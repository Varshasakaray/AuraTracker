import React, { useState, useEffect } from "react";
import "./style.css";
import { Avatar, Button, TextField } from "@mui/material";
import { useLocalContext } from "../../context/context";
import axios from "axios";
import ClassRoomAnnouncement from "../ClassRoomAnnouncement/ClassRoomAnnouncement";
import db from "../lib/Firebase";
import firebase from "firebase/compat/app";

const Main = ({ classData }) => {
  const { loggedInMail,loggedInUser } = useLocalContext();

  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [imageOptions, setImageOptions] = useState([]);
  const [editingAnnouncement,setEditingAnnouncement] = useState(null); // Stores announcement being edited

  // Fetch files from MongoDB
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("http://localhost:8000/api/v1/files");
        const data = await response.json();
        setImageOptions(data); 
      } catch (error) {
        console.error("Error fetching files:", error);
      }
    };

    fetchFiles();
  }, []);

  // Save announcement to Firestore
  const handleUpload = async () => {
    if (!inputValue.trim() && !image) {
      alert("Please enter some text or select an image!");
      return;
    }

    try {
      if (editingAnnouncement) {
        // Update existing announcement
        await db
          .collection("announcements")
          .doc("classes")
          .collection(classData.id)
          .doc(editingAnnouncement.id)
          .update({
            text: inputValue.trim(),
            imageUrl: image || null,
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
            imageUrl: image || null,
            sender: loggedInUser?.displayName || loggedInMail,
            senderPhotoURL: loggedInUser?.photoURL || "", 
          });
      }

      // Reset state
      setInput("");
      setImage("");
      setEditingAnnouncement(null);
      setShowInput(false);
    } catch (error) {
      console.error("Error saving announcement:", error);
    }
  };
  // Function to edit an announcement
  const handleEdit = (announcement) => {
    setInput(announcement.text);
    setImage(announcement.imageUrl || "");
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
                      {imageOptions.length > 0 ? (
                        <select
                          onChange={(e) => setImage(e.target.value)}
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Select an Image (optional)
                          </option>
                          {imageOptions.map((file) => (
                            <option key={file._id} value={file.imageUrl}>
                              {file.description || file.imageUrl}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p>No images available</p>
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
                    <Avatar/>
                    <div>Announce Something to class</div>
                  </div>
                )}
              </div>
            </div>
            <ClassRoomAnnouncement classData={classData} onEdit={handleEdit}/>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
