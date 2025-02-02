import React, { useState, useEffect } from "react";
import "./style.css";
import { Avatar, Button, TextField } from "@mui/material";
import { useLocalContext } from "../../context/context";
import axios from "axios";
import ClassRoomAnnouncement from "../ClassRoomAnnouncement/ClassRoomAnnouncement";
import db from "../lib/Firebase";
import firebase from "firebase/compat/app";

const Main = ({ classData }) => {
  const { loggedInMail, loggedInUser } = useLocalContext();

  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInput] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null); // Stores announcement being edited

  // Fetch files from MongoDB
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/files");
        const data = await response.json();
        setSelectedFiles(data);
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

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
        console.log("Upload Response:", response.data);
        fileUrls = response.data.fileUrls;
      }
      if (fileUrls.length === 0 && selectedFiles.length > 0) {
        alert("File upload failed! Please check the server.");
        return;
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
            sender: loggedInUser?.displayName || loggedInMail,
            senderPhotoURL: loggedInUser?.photoURL || "",
          });
      }

      // Reset state
      setInput("");
      setSelectedFiles([]);
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
        <div className="main__announce">
          <div className="main__status">
            <p>Upcoming</p>
            <p className="main__subText">No work due</p>
          </div>
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
                    <div className="main__buttons">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        accept="*/*" // Allow all file types
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
    </div>
  );
};

export default Main;
