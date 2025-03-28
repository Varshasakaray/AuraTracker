import React, { useEffect, useState } from "react";
import axios from "axios";
import { Avatar, IconButton, Menu, MenuItem, Button } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./style.css";
import db from "../lib/Firebase";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { useLocalContext } from "../../context/context";
import { useNavigate } from "react-router-dom";

const ClassRoomAnnouncement = ({ classData, onEdit, onSubmissionChange }) => {
  const navigate = useNavigate();
  const { loggedInMail } = useLocalContext();
  const [announcement, setAnnouncement] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submittedAssignments, setSubmittedAssignments] = useState({});
  const isAdmin = loggedInMail === classData?.owner;

  // const handleMenuOpen = (event, announcement) => {
  //   setAnchorEl(event.currentTarget);
  //   setSelectedAnnouncement(announcement);
  // };
  const handleMenuOpen = (event, announcement) => {
    if (announcement.sender === loggedInMail) {
      setAnchorEl(event.currentTarget);
      setSelectedAnnouncement(announcement);
    }
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
        .then(() => console.log("Announcement deleted"))
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

      const isSubmitted = !snapshot.empty;
      setSubmittedAssignments((prev) => ({
        ...prev,
        [postId]: isSubmitted,
      }));
      if (onSubmissionChange) {
        onSubmissionChange(postId, isSubmitted);
      }
    } catch (error) {
      console.error("Error checking submission:", error);
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleUploadAssignment = async (postId) => {
    if (selectedFiles.length === 0) {
      alert("Please select a file first.");
      return;
    }

    try {
      let fileUrls = [];
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));

      const response = await axios.post(
        "http://localhost:8000/api/v1/upload",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

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

      setSubmittedAssignments((prev) => ({
        ...prev,
        [postId]: true,
      }));
      if (onSubmissionChange) {
        onSubmissionChange(postId, true);
      }

      setSelectedFiles([]);
      alert("Assignment uploaded successfully!");
    } catch (error) {
      console.error("Error uploading assignment:", error);
      alert("Failed to upload assignment. Please try again.");
    }
  };

  useEffect(() => {
    if (classData) {
      const unsubscribe = db
        .collection("announcements")
        .doc("classes")
        .collection(classData.id)
        .orderBy("timestamp", "desc")
        .onSnapshot(
          (snap) => {
            const newAnnouncements = snap.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setAnnouncement(newAnnouncements);
            newAnnouncements.forEach((item) => {
              if (!(item.id in submittedAssignments)) {
                checkSubmission(item.id);
              }
            });
          },
          (error) => console.error("Error fetching announcements:", error)
        );
      return () => unsubscribe();
    }
  }, [classData]);

  return (
    <div>
      {announcement.map((item) => {
        const currentDate = new Date();
        const dueDate = item.dueDate ? new Date(item.dueDate) : null;
        const isOverdue = dueDate && currentDate > dueDate;
        return (
          <div className="amt" key={item.id}>
            <div className="amt__Cnt">
              <div className="amt__top">
                <Avatar src={item.senderPhotoURL} alt={item.sender} />
                <div>{item.sender}</div>
                {/* <IconButton
                aria-controls="announcement-menu"
                aria-haspopup="true"
                onClick={(e) => handleMenuOpen(e, item)}
              >
                <MoreVertIcon />
              </IconButton> */}

                {item.sender === loggedInMail && (
                  <IconButton
                    aria-controls="announcement-menu"
                    aria-haspopup="true"
                    onClick={(e) => handleMenuOpen(e, item)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                )}
              </div>
              <p className="amt__txt">{item.text}</p>
              {item.fileUrls && item.fileUrls.length > 0 && (
                <div className="amt__files">
                  {item.fileUrls.map((fileUrl, index) => {
                    const fileExtension = fileUrl
                      .split(".")
                      .pop()
                      .toLowerCase();
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
              {isAdmin && item.sender === loggedInMail && (
                <button
                  className="view-submissions-btn"
                  onClick={() =>
                    navigate(`/submissions/${classData.id}/${item.id}`)
                  }
                >
                  View Submitted Assignments
                </button>
              )}

              {isAdmin && item.sender !== loggedInMail && <></>}

              {!isAdmin && item.sender !== loggedInMail && (
                <div className="amt__upload">
                  {submittedAssignments[item.id] ? (
                    <p className="submission-success">
                      ✅ Successfully Submitted
                    </p>
                  ) : isOverdue ? (
                    <p className="overdue-message">
                      ⏰ Cannot submit. The due date has passed.
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
        );
      })}
      <Menu
        id="announcement-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose} // Corrected from handleMenu △△Close
      >
        <MenuItem onClick={handleEdit}>Edit</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
      </Menu>
    </div>
  );
};

export default ClassRoomAnnouncement;
