import React, { useState, useEffect } from "react";
import "./style.css";
import { Avatar, Button, TextField } from "@mui/material";
import { useLocalContext } from "../../context/context";
import axios from "axios";
import ClassRoomAnnouncement from "../ClassRoomAnnouncement/ClassRoomAnnouncement";
import db from "../lib/Firebase";
import firebase from "firebase/compat/app";
import { Link } from "react-router-dom";

const Main = ({ classData }) => {
  const { loggedInMail, loggedInUser } = useLocalContext();

  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [dueDate, setDueDate] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [submittedPosts, setSubmittedPosts] = useState({});
  const [isLoading, setIsLoading] = useState(true); // Add loading state

  // Fetch announcements and submission status with real-time updates
  useEffect(() => {
    if (!classData?.id) return;

    const unsubscribeAnnouncements = db
      .collection("announcements")
      .doc("classes")
      .collection(classData.id)
      .orderBy("timestamp", "desc")
      .onSnapshot(
        async (snapshot) => {
          const fetchedAnnouncements = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setAnnouncements(fetchedAnnouncements);

          // Fetch initial submission status for all announcements
          const submissionPromises = fetchedAnnouncements.map(async (announcement) => {
            const snapshot = await db
              .collection("announcements")
              .doc(classData.id)
              .collection("posts")
              .doc(announcement.id)
              .collection("assignments")
              .where("uploaderEmail", "==", loggedInMail)
              .get();
            return { id: announcement.id, isSubmitted: !snapshot.empty };
          });

          const submissionResults = await Promise.all(submissionPromises);
          const newSubmittedPosts = submissionResults.reduce((acc, { id, isSubmitted }) => {
            acc[id] = isSubmitted;
            return acc;
          }, {});

          setSubmittedPosts((prev) => ({ ...prev, ...newSubmittedPosts }));
          setIsLoading(false); // Data is fully loaded
        },
        (error) => {
          console.error("Error fetching announcements:", error);
          setIsLoading(false);
        }
      );

    return () => unsubscribeAnnouncements();
  }, [classData?.id, loggedInMail]);

  // Handle submission status updates from ClassRoomAnnouncement
  const handleSubmissionChange = (postId, isSubmitted) => {
    setSubmittedPosts((prev) => ({ ...prev, [postId]: isSubmitted }));
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  // Save announcement to Firestore
  const handleUpload = async () => {
    if (!inputValue.trim() && selectedFiles.length === 0) {
      alert("Please enter some text or select a file!");
      return;
    }

    try {
      let fileUrls = [];
      if (selectedFiles.length > 0) {
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append("files", file));
        const response = await axios.post(
          "http://localhost:8000/api/v1/upload",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        fileUrls = response.data.fileUrls;
      }

      if (editingAnnouncement) {
        await db
          .collection("announcements")
          .doc("classes")
          .collection(classData.id)
          .doc(editingAnnouncement.id)
          .update({
            text: inputValue.trim(),
            fileUrls: fileUrls,
            dueDate: dueDate,
          });
      } else {
        await db
          .collection("announcements")
          .doc("classes")
          .collection(classData.id)
          .add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            text: inputValue.trim(),
            fileUrls: fileUrls,
            dueDate: dueDate,
            sender: loggedInUser?.displayName || loggedInMail,
            senderPhotoURL: loggedInUser?.photoURL || "",
          });
      }

      setInput("");
      setSelectedFiles([]);
      setDueDate("");
      setEditingAnnouncement(null);
      setShowInput(false);
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
  };

  // Edit an announcement
  const handleEdit = (announcement) => {
    setInput(announcement.text);
    setSelectedFiles(announcement.fileUrls || []);
    setDueDate(announcement.dueDate || "");
    setEditingAnnouncement(announcement);
    setShowInput(true);
  };

  // Get the closest upcoming unsubmitted assignment
  const getClosestUpcomingAssignment = () => {
    const now = new Date();
    const upcoming = announcements
      .filter((announcement) => announcement.dueDate)
      .filter((announcement) => new Date(announcement.dueDate) > now)
      .filter((announcement) => !submittedPosts[announcement.id]) // Exclude submitted
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    return upcoming.length > 0 ? upcoming[0] : null;
  };

  return (
    <div className="main">
      <div className="main__wrapper">
        <div className="main__content">
          <div className="main__wrapper1">
            <div className="main__bgImage">
              <div className="main__emptyStyles" />
            </div>
            <div className="main__text">
              <h1 className="main_heading main_overflow">{classData.className}</h1>
              <div className="main_section main_overflow">{classData.section}</div>
              <div className="main__wrapper2">
                <em className="main__code">Class Code :</em>
                <div className="main__id">{classData.id}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Section */}
        <div className="main__status">
          <p>Upcoming</p>
          {isLoading ? (
            <p>Loading...</p>
          ) : (() => {
              const closestAssignment = getClosestUpcomingAssignment();
              if (closestAssignment) {
                return (
                  <p key={closestAssignment.id} className="main__subText">
                    <strong>
                      Due{" "}
                      {new Date(closestAssignment.dueDate).toLocaleDateString("en-US", {
                        weekday: "long",
                      })}
                    </strong>
                    <br />
                    {new Date(closestAssignment.dueDate).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit",
                      hour12: true,
                    })}{" "}
                    – {closestAssignment.text}
                  </p>
                );
              } else {
                return <p>No upcoming assignments.</p>;
              }
            })()}
          <Link to="/upcoming">Show All</Link>
        </div>

        {/* Announcements */}
        <div className="main__announcements">
          <div className="main__announcementsWrapper">
            <div className="main__ancContent">
              {showInput ? (
                <div className="main__form">
                  <TextField
                    id="filled-multiline-flexible"
                    multiline
                    label="Announce Something to class"
                    variant="filled"
                    value={inputValue}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  <TextField
                    id="due-date"
                    label="Due Date"
                    type="datetime-local"
                    InputLabelProps={{ shrink: true }}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                  <div className="main__buttons">
                    <input type="file" multiple onChange={handleFileChange} accept="*/*" />
                    {selectedFiles.length > 0 && (
                      <div>
                        <p>Selected Files:</p>
                        <ul>
                          {selectedFiles.map((file, index) => (
                            <li key={index}>{file.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <Button onClick={() => setShowInput(false)}>Cancel</Button>
                      <Button onClick={handleUpload} color="primary" variant="contained">
                        {editingAnnouncement?.id ? "Update" : "Announce"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="main__wrapper100" onClick={() => setShowInput(true)}>
                  <Avatar />
                  <div>Announce Something to class</div>
                </div>
              )}
            </div>
          </div>
          <ClassRoomAnnouncement
            classData={classData}
            onEdit={handleEdit}
            onSubmissionChange={handleSubmissionChange}
          />
        </div>
      </div>
    </div>
  );
};

export default Main;