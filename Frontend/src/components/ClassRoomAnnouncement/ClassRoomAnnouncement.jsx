import React, { useEffect, useState } from "react";
import axios from "axios";
import { Avatar, IconButton, Menu, MenuItem, Button } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./style.css";
import db from "../lib/Firebase";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useLocalContext } from "../../context/context";
import { useNavigate } from "react-router-dom";
const ClassRoomAnnouncement = ({ classData, onEdit }) => {
  const navigate = useNavigate();
  const { loggedInMail } = useLocalContext();
  const [announcement, setAnnouncement] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // For menu
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]); // For assignment upload
  const [submittedAssignments, setSubmittedAssignments] = useState({}); // Track submission status of user
  const isAdmin = loggedInMail === classData?.owner; // Check if the user is an admin

  // console.log("is admin:", isAdmin);
  // console.log("Class Creator (Sender in Firestore):", classData?.owner);
  // console.log("user email:", loggedInMail);

  const handleMenuOpen = (event, announcement) => {
    setAnchorEl(event.currentTarget);
    setSelectedAnnouncement(announcement);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedAnnouncement(null);
  };

  const handleDelete = () => {
    if (selectedAnnouncement?.id) {
      db.collection("announcements")
        .doc("classes")
        .collection(classData.id)
        .doc(selectedAnnouncement.id)
        .delete()
        .then(() => {
          console.log("Announcement deleted");
        })
        .catch((error) => console.error("Error deleting announcement:", error));
    }
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedAnnouncement) {
      onEdit(selectedAnnouncement);
    }
    handleMenuClose();
  };

  // check if the user has already submitted the assignment
  const checkSubmission = async (postId) => {
    try {
      const snapshot = await db
        .collection("announcements")
        .doc(classData.id)
        .collection("posts")
        .doc(postId)
        .collection("assignments")
        .where("uploaderEmail", "==", loggedInMail)
        .get();

      console.log(`Checking submission for post ${postId}: `, !snapshot.empty);

      // Update only for the correct post
      setSubmittedAssignments((prev) => ({
        ...prev,
        [postId]: !snapshot.empty,
      }));
    } catch (error) {
      console.error("Error checking submission:", error);
    }
  };

  useEffect(() => {
    if (announcement.length > 0) {
      announcement.forEach((item) => {
        checkSubmission(item.id); // Check submission for each post
      });
    }
  }, [announcement]); // Avoid infinite loop

  // Handle file selection
  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  // Upload assignment
  const handleUploadAssignment = async (postId) => {
    if (selectedFiles.length === 0) {
      alert("Please select a file first.");
      return;
    }

    try {
      let fileUrls = [];
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

      if (!response.data.fileUrls || response.data.fileUrls.length === 0) {
        alert("File upload failed! Please check the server.");
        return;
      }

      fileUrls = response.data.fileUrls;

      await db
        .collection("announcements")
        .doc(classData.id)
        .collection("posts")
        .doc(postId)
        .collection("assignments")
        .add({
          fileUrls: fileUrls,
          uploaderEmail: loggedInMail,
          timestamp: new Date(),
        });

      // Update only the specific postId in state
      setSubmittedAssignments((prev) => ({
        ...prev,
        [postId]: true, //  Mark only this post as submitted
      }));

      setSelectedFiles([]); // Reset only after successful upload
      alert("Assignment uploaded successfully!");
    } catch (error) {
      console.error("Error uploading assignment:", error);
      alert("Failed to upload assignment. Please try again.");
    }
  };

  useEffect(() => {
    if (classData) {
      let unsubscribe = db
        .collection("announcements")
        .doc("classes")
        .collection(classData.id)
        .orderBy("timestamp", "desc")
        .onSnapshot((snap) => {
          setAnnouncement(
            snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }))
          );
        });

      return () => unsubscribe();
    }
  }, [classData]);

  console.log(announcement);

  useEffect(() => {
    if (announcement.length > 0) {
      announcement.forEach((item) => {
        checkSubmission(item.id); // Check only for this post
      });
    }
  }, [announcement]); //  Don't track `submittedAssignments` to avoid infinite loop

  return (
    <div>
      {announcement.map((item) => (
        <div className="amt" key={item.id}>
          <div className="amt__Cnt">
            <div className="amt__top">
              <Avatar src={item.senderPhotoURL} alt={item.sender} />
              <div>{item.sender}</div>
              <IconButton
                aria-controls="announcement-menu"
                aria-haspopup="true"
                onClick={(e) => handleMenuOpen(e, item)}
              >
                <MoreVertIcon />
              </IconButton>
            </div>
            <p className="amt__txt">{item.text}</p>
            {/* Check if fileUrls is not empty and render each file */}
            {item.fileUrls && item.fileUrls.length > 0 && (
              <div className="amt__files">
                {item.fileUrls.map((fileUrl, index) => {
                  const fileExtension = fileUrl.split(".").pop().toLowerCase();
                  console.log(fileUrl);
                  console.log(fileExtension);

                  // Construct the correct file path with your backend URL
                  const filePath = `http://localhost:8000/${fileUrl}`;

                  if (["jpg", "jpeg", "png"].includes(fileExtension)) {
                    return (
                      <img
                        key={index}
                        className="amt__img"
                        src={filePath}
                        alt={`Announcement file ${index}`}
                      />
                    );
                  } else if (fileExtension === "pdf") {
                    return (
                      <div key={index} className="amt__pdf">
                        <a
                          href={filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <PictureAsPdfIcon
                            style={{ color: "red", fontSize: "5rem" }}
                          />
                        </a>
                      </div>
                    );
                  } else {
                    return null;
                  }
                })}
              </div>
            )}

            {/* // Inside the map function, add this where the admin's posts are displayed */}
            {isAdmin && (
              <button
                className="view-submissions-btn"
                onClick={() =>
                  navigate(`/submissions/${classData.id}/${item.id}`)
                }
              >
                View Submitted Assignments
              </button>
            )}
            
            {/* Show Upload Button ONLY for Users, on Admin's Posts */}
            {!isAdmin && item.sender !== loggedInMail && (
              <div className="amt__upload">
                {submittedAssignments[item.id] ? (
                  <p className="submission-success">
                    ✅ Successfully Submitted
                  </p>
                ) : (
                  <>
                    <input type="file" multiple onChange={handleFileChange} />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handleUploadAssignment(item.id)}
                    >
                      Upload Assignment
                    </Button>
                  </>
                )}
              </div>
            )}
            <div className="amt__time">
              {new Date(item.timestamp?.toDate()).toLocaleString()}
            </div>
          </div>
        </div>
      ))}

      {/* Menu for Edit/Delete */}
      <Menu
        id="announcement-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </div>
  );
};

export default ClassRoomAnnouncement;
