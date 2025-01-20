import asyncHandler from "express-async-handler";
import Attendance from "../models/Attendance.js";

const attendanceController = {
  //!add
  create: asyncHandler(async (req, res) => {
    const { subject,totalClasses,attendedClasses } = req.body;
    if (!subject || !attendedClasses || !totalClasses) {
      throw new Error("Subject name and totalClasses are required");
    }
    //Convert the name to lowercase
    const normalizedSubject = subject.toLowerCase();    
    //!Check if Task already exists on the user
    const SubjectExists = await Attendance.findOne({
      subject: normalizedSubject,
      user: req.user,
    });
    if (SubjectExists) {
      throw new Error(
        `Subject ${SubjectExists.subject} already exists in the database`
      );
    }
    //! Create the Subject
    const newSubject = await Attendance.create({
      name: normalizedSubject,
      user: req.user,
      attendedClasses,
      totalClasses,
    });
    res.status(201).json(newSubject);
  }),

  //!lists
  lists: asyncHandler(async (req, res) => {
    const subjects = await Attendance.find({ user: req.user });
    res.status(200).json(subjects);
  }),

  //!update
  update: asyncHandler(async (req, res) => {
    const { subjectId } = req.params;
    const { attendedClasses,totalClasses } = req.body;
    const subjectToUpdate = await Attendance.findById(subjectId);
    if (!subjectToUpdate && subjectToUpdate.user.toString() !== req.user.toString()) {
      throw new Error("Subject not found or user not authorized");
    }
    const oldName = subjectToUpdate.name;
    //! Update Task properties
    subjectToUpdate.attendedClasses = attendedClasses || subjectToUpdate.name;
    subjectToUpdate.totalClasses = totalClasses || subjectToUpdate.type;
    const updatedSubject = await subjectToUpdate.save();
    // //Update affected transaction
    // if (oldName !== updatedTask.name) {
    //   await Transaction.updateMany(
    //     {
    //       user: req.user,
    //       Task: oldName,
    //     },
    //     { $set: { Task: updatedTask.name } }
    //   );
    // }
    res.json(updatedSubject);
  }),
  //! delete
  delete: asyncHandler(async (req, res) => {
    const subject = await Attendance.findById(req.params.id);
    console.log(req.user);  // Log to ensure req.user is populated correctly

    if (!subject) {
      return res.status(404).json({ message: "Subject not found" });
    }

    if (subject.user.toString() !== req.user.toString()) {
      return res.status(403).json({ message: "User not authorized to delete this task" });
    }

    try {
      // // If needed, update transactions before deletion
      // await Transaction.updateMany(
      //   { user: req.user, Task: task.name },
      //   { $set: { Task: "Uncategorized" } }
      // );

      // Delete the task
      await Attendance.findByIdAndDelete(req.params.id);
      res.json({ message: "Subject removed" });
    } catch (error) {
      console.error(error);  // Log the error for debugging
      res.status(500).json({ message: "An error occurred while deleting the subject" });
    }
  }),
};

export default attendanceController;