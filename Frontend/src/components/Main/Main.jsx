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
  const [dueDate, setDueDate] = useState(""); // Stores the selected due date
  const [announcements, setAnnouncements] = useState([]); // Stores fetched announcements

  // Fetch announcements from Firestore
  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const snapshot = await db
          .collection("announcements")
          .doc("classes")
          .collection(classData.id)
          .orderBy("timestamp", "desc")
          .get();
        const fetchedAnnouncements = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAnnouncements(fetchedAnnouncements);
      } catch (error) {
        console.error("Error fetching announcements:", error);
      }
    };

    fetchAnnouncements();
  }, [classData.id]);

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
        // Upload selected files to the server
        const formData = new FormData();
        selectedFiles.forEach((file) => {
          formData.append("files", file);
        });
        const response = await axios.post(
          "http://localhost:8000/api/v1/upload",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        fileUrls = response.data.fileUrls;
      }

      if (editingAnnouncement) {
        // Update existing announcement
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
        // Create a new announcement
        await db
          .collection("announcements")
          .doc("classes")
          .collection(classData.id)
          .add({
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            text: inputValue.trim(),
            fileUrls: fileUrls,
            dueDate: dueDate, // Save due date
            sender: loggedInUser?.displayName || loggedInMail,
            senderPhotoURL: loggedInUser?.photoURL || "",
          });
      }

      // Reset state
      setInput("");
      setSelectedFiles([]);
      setDueDate(""); // Reset due date field
      setEditingAnnouncement(null);
      setShowInput(false);
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
  };

  // Function to edit an announcement
  const handleEdit = (announcement) => {
    setInput(announcement.text);
    setSelectedFiles(announcement.fileUrls || []);
    setDueDate(announcement.dueDate || "");
    setEditingAnnouncement(announcement);
    setShowInput(true);
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
              <h1 className="main_heading main_overflow">
                {classData.className}
              </h1>
              <div className="main_section main_overflow">
                {classData.section}
              </div>
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

          {announcements
            .filter((announcement) => announcement.dueDate) // Keep only announcements with a due date
            .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)) // Sort by earliest due date
            .slice(0, 1) // Take only the first (earliest) one
            .map((announcement, index) => (
              <p key={index} className="main__subText">
                <strong>
                  Due{" "}
                  {new Date(announcement.dueDate).toLocaleDateString("en-US", {
                    weekday: "long",
                  })}
                </strong>
                <br />
                {new Date(announcement.dueDate).toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}{" "}
                – {announcement.text}
              </p>
            ))}

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

                  {/* Due Date Picker */}
                  <TextField
                    id="due-date"
                    label="Due Date"
                    type="datetime-local"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />

                  {/* File Upload */}
                  <div className="main__buttons">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      accept="*/*"
                    />
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
                      <Button onClick={() => setShowInput(false)}>
                        Cancel
                      </Button>

                      <Button
                        onClick={handleUpload}
                        color="primary"
                        variant="contained"
                      >
                        {editingAnnouncement?.id ? "Update" : "Announce"}
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="main__wrapper100"
                  onClick={() => setShowInput(true)}
                >
                  <Avatar />
                  <div>Announce Something to class</div>
                </div>
              )}
            </div>
          </div>
          <ClassRoomAnnouncement classData={classData} onEdit={handleEdit} />
        </div>
      </div>
    </div>
  );
};

export default Main;