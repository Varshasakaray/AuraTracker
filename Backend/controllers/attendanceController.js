import asyncHandler from "express-async-handler";
import Attendance from "../models/Attendance.js";

const attendanceController = {
  //!add
  create: asyncHandler(async (req, res) => {
    const { subject,credit,totalClasses,attendedClasses } = req.body;
    if (!subject||!credit || !attendedClasses || !totalClasses) {
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
      subject: normalizedSubject,
      user: req.user,
      credit,
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
};

export default attendanceController;