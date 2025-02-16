import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Button,
  Card,
  CardContent,
  Typography,
  Avatar,
} from "@mui/material";
import db from "../lib/Firebase";
import "./style.css";

function DisplayAssignments({ classData }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [weekFilter, setWeekFilter] = useState("thisWeek");
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [submittedAssignments, setSubmittedAssignments] = useState([]);

  // Fetch assignments only when classData.id changes
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!classData || !classData.id) return;

      try {
        // Fetch assignments from Firestore collection
        const assignmentsRef = db
          .collection("announcements")
          .doc("classes")
          .collection(classData.id);

        const snapshot = await assignmentsRef.get();

        if (snapshot.empty) {
          console.log("No assignments found.");
          setAssignments([]); // Reset assignments if none are found
          return;
        }

        // Map fetched assignments data
        const fetchedAssignments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Fetched assignments:", fetchedAssignments);
        setAssignments(fetchedAssignments);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      }
    };

    fetchAssignments();
  }, [classData.id]);

  useEffect(() => {
    const fetchSubmittedAssignments = async () => {
      if (!classData || !classData.id || tabIndex !== 2) return;

      try {
        let submitted = [];
        for (const assignment of assignments) {
          const submittedRef = db
            .collection("announcements")
            .doc(classData.id)
            .collection("posts")
            .doc(assignment.id)
            .collection("assignments")
            .orderBy("timestamp", "desc");

          const snapshot = await submittedRef.get();
          if (!snapshot.empty) {
            snapshot.docs.forEach((doc) => {
              submitted.push({
                postId: assignment.id,
                id: doc.id,
                ...doc.data(),
              });
            });
          }
        }

        console.log("Fetched submitted assignments:", submitted);
        setSubmittedAssignments(submitted);
      } catch (error) {
        console.error("Error fetching submitted assignments:", error);
      }
    };

    fetchSubmittedAssignments();
  }, [classData.id, tabIndex, assignments]);


  // Filter assignments based on tabIndex, weekFilter, and submittedAssignments
  useEffect(() => {
    const filterAssignments = () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start of this week (Sunday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6); // End of this week (Saturday)
      const startOfNextWeek = new Date(endOfWeek);
      startOfNextWeek.setDate(endOfWeek.getDate() + 1); // Next week's start (Sunday)
      const endOfNextWeek = new Date(startOfNextWeek);
      endOfNextWeek.setDate(startOfNextWeek.getDate() + 6); // Next week's end (Saturday)

      let filtered = assignments.filter((assignment) => {
        const dueDate = new Date(assignment.dueDate);

        if (tabIndex === 2) {
          // Show submitted assignments
          return submittedAssignments.some((s) => s.postId === assignment.id);
        } else {
          // Assigned or Missing
          if (weekFilter === "thisWeek") {
            return dueDate >= startOfWeek && dueDate <= endOfWeek;
          } else if (weekFilter === "nextWeek") {
            return dueDate >= startOfNextWeek && dueDate <= endOfNextWeek;
          }
        }
        return true;
      });

      if (tabIndex === 0) {
        // Show only unsubmitted assignments
        const submittedIds = new Set(submittedAssignments.map((s) => s.postId));
        filtered = filtered.filter((assignment) => !submittedIds.has(assignment.id));
      } else if (tabIndex === 2) {
        // Show earlier submissions if "earlier" is selected
        if (weekFilter === "earlier") {
          filtered = submittedAssignments.filter((s) => {
            const submittedDate = new Date(s.timestamp.seconds * 1000);
            return submittedDate < startOfWeek;
          });
        }
      }

      setFilteredAssignments(filtered);
      
    }; 
    filterAssignments();
  }, [assignments, weekFilter, tabIndex, submittedAssignments]); 

  return (
    <div className="assignments-container">
      <Tabs
        value={tabIndex}
        onChange={(e, newIndex) => setTabIndex(newIndex)}
        className="tabs"
      >
        <Tab label="Assigned" />
        <Tab label="Missing" />
        <Tab label="Done" />
      </Tabs>

      {tabIndex !== 1 && (
        <div className="assignments-section">
          <div className="toggle-buttons">
            <Button
              variant={weekFilter === "thisWeek" ? "contained" : "outlined"}
              onClick={() => setWeekFilter("thisWeek")}
            >
              This Week
            </Button>
            {tabIndex === 0 ? (
              <Button
                variant={weekFilter === "nextWeek" ? "contained" : "outlined"}
                onClick={() => setWeekFilter("nextWeek")}
              >
                Next Week
              </Button>
            ) : (
              <Button
                variant={weekFilter === "earlier" ? "contained" : "outlined"}
                onClick={() => setWeekFilter("earlier")}
              >
                Earlier
              </Button>
            )}
          </div>

          <div className="assignments-list">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => {
                const timestamp = assignment.timestamp
                  ? new Date(
                      assignment.timestamp.seconds * 1000 +
                        assignment.timestamp.nanoseconds / 1000000
                    )
                  : null;

                return (
                  <Card key={assignment.id} className="assignment-card">
                    <CardContent>
                      <div className="assignment-header">
                        <Avatar
                          src={assignment.senderPhotoURL}
                          alt={assignment.sender}
                        />
                        <Typography variant="h6">{assignment.sender}</Typography>
                      </div>
                      <Typography variant="h6">{assignment.text}</Typography>
                      <Typography variant="body2">{assignment.description}</Typography>

                      {/* ✅ Hide due date when tabIndex === 2 */}
                      {tabIndex === 2 ? (
                        <Typography variant="caption" className="success-text">
                          ✅ Successfully Submitted
                        </Typography>
                      ) : (
                        <Typography variant="caption">
                          Due: {new Date(assignment.dueDate).toLocaleDateString()}
                        </Typography>
                      )}
                      
                      {assignment.fileUrls && assignment.fileUrls.length > 0 && (
                        <div className="file-links">
                          {assignment.fileUrls.map((fileUrl, index) => (
                            <a
                              key={index}
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {`File ${index + 1}`}
                            </a>
                          ))}
                        </div>
                      )}
                      <Typography variant="caption">
                        Timestamp: {timestamp?.toLocaleString()}
                      </Typography>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Typography>No assignments found.</Typography>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DisplayAssignments;   