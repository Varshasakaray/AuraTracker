import React, { useEffect, useState } from "react";
import axios from "axios";
import { Avatar, IconButton, Menu, MenuItem } from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import "./style.css";
import db from "../lib/Firebase";

const ClassRoomAnnouncement = ({ classData, onEdit }) => {
  const [announcement, setAnnouncement] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null); // For menu
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

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
                  console.log(fileExtension); // For debugging

                  // Construct the correct file path with your backend URL
                  const filePath = `http://localhost:8000/${fileUrl}`; // Adjust the URL to your backend's actual URL

                  if (
                    fileExtension === "jpg" ||
                    fileExtension === "jpeg" ||
                    fileExtension === "png"
                  ) {
                    // If the file is an image
                    return (
                      <img
                        key={index}
                        className="amt__img"
                        src={filePath}
                        alt={`Announcement file ${index}`}
                      />
                    );
                  } else if (fileExtension === "pdf") {
                    // If the file is a PDF
                    return (
                      <div key={index} className="amt__pdf">
                        <a
                          href={filePath}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          PDF: {filePath}
                        </a>
                      </div>
                    );
                  } else {
                    // Handle other file types if needed
                    return null;
                  }
                })}
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
