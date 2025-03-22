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
import { CheckCircleOutline } from "@mui/icons-material";
import db from "../lib/Firebase";
import "./style.css";

function DisplayAssignments({ classData }) {
  const [tabIndex, setTabIndex] = useState(0);
  const [weekFilter, setWeekFilter] = useState("thisWeek");
  const [assignments, setAssignments] = useState([]);
  const [filteredAssignments, setFilteredAssignments] = useState([]);
  const [submittedAssignments, setSubmittedAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!classData || !classData.id) return;

      try {
        const assignmentsRef = db
          .collection("announcements")
          .doc("classes")
          .collection(classData.id);

        const snapshot = await assignmentsRef.get();

        if (snapshot.empty) {
          console.log("No assignments found.");
          setAssignments([]);
          return;
        }

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

  useEffect(() => {
    const filterAssignments = () => {
      const today = new Date();
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      let filtered = assignments.filter((assignment) => {
        const dueDate = new Date(assignment.dueDate);

        if (tabIndex === 2) {
          return submittedAssignments.some((s) => s.postId === assignment.id);
        } else {
          if (weekFilter === "thisWeek") {
            return dueDate >= startOfWeek && dueDate <= endOfWeek;
          } else if (weekFilter === "laterWeek") {
            return dueDate > endOfWeek;
          }
        }
        return true;
      });

      if (tabIndex === 0) {
        const submittedIds = new Set(submittedAssignments.map((s) => s.postId));
        filtered = filtered.filter((assignment) => !submittedIds.has(assignment.id));
      }

      setFilteredAssignments(filtered);
    };
    filterAssignments();
  }, [assignments, weekFilter, tabIndex, submittedAssignments]);

  return (
    <div className="assignments-container">
      <Tabs value={tabIndex} onChange={(e, newIndex) => setTabIndex(newIndex)} className="tabs">
        <Tab label="Assigned" />
        <Tab label="Missing" />
        <Tab label="Done" />
      </Tabs>

      {tabIndex !== 1 && (
        <div className="assignments-section">
          <div className="toggle-buttons">
            <Button variant={weekFilter === "thisWeek" ? "contained" : "outlined"} onClick={() => setWeekFilter("thisWeek")}>
              This Week
            </Button>
            {tabIndex === 0 ? (
              <Button variant={weekFilter === "laterWeek" ? "contained" : "outlined"} onClick={() => setWeekFilter("laterWeek")}>
                Later Weeks
              </Button>
            ) : (
              <Button variant={weekFilter === "earlier" ? "contained" : "outlined"} onClick={() => setWeekFilter("earlier")}>
                Earlier
              </Button>
            )}
          </div>

          <div className="assignments-list">
            {filteredAssignments.length > 0 ? (
              filteredAssignments.map((assignment) => (
                <Card key={assignment.id} className="assignment-card">
                  <CardContent>
                    <div className="assignment-header">
                      <Avatar src={assignment.senderPhotoURL} alt={assignment.sender} />
                      <Typography variant="h6">{assignment.sender}</Typography>
                    </div>
                    <Typography variant="h6">{assignment.text}</Typography>
                    <Typography variant="body2">{assignment.description}</Typography>
                    {tabIndex === 2 && submittedAssignments.some(s => s.postId === assignment.id) ? (
                      submittedAssignments.filter(s => s.postId === assignment.id).map(sub => {
                        const dueDate = new Date(assignment.dueDate);
                        const submittedDate = new Date(sub.timestamp.seconds * 1000);
                        const diffMs = dueDate - submittedDate;
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        return (
                          <Typography key={sub.id} variant="caption" className="success-text">
                            <CheckCircleOutline style={{ color: "green" }} /> Successfully Submitted {diffDays} days, {diffHours} hours, and {diffMinutes} minutes before due date.
                          </Typography>
                        );
                      })
                    ) : (
                      <Typography variant="caption">Due: {new Date(assignment.dueDate).toLocaleString()}</Typography>
                    )}
                  </CardContent>
                </Card>
              ))
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
