import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


const usersController = {
    // Register
    register: asyncHandler(async (req, res) => {
        const { username, email, password, mobileNo, semester, DOB, course, regnum } = req.body;
        console.log(req.body);
        
        // Validate required fields
        if (!username || !email || !password || !mobileNo || !semester || !DOB || !course || !regnum) {
            throw new Error("Please fill all required fields");
        }

        // Check if user is already registered
        const userExists = await User.findOne({ email });
        if (userExists) {
            throw new Error("User already registered");
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const userCreated = await User.create({
            username,
            email,
            password: hashedPassword,
            mobileNo,
            semester,
            DOB,
            course,
            regnum,
            auraPoints:0
        });

        console.log(req.body);
        res.json({
            username: userCreated.username,
            email: userCreated.email,
            id: userCreated._id,
            mobileNo: userCreated.mobileNo,
            semester: userCreated.semester,
            DOB: userCreated.DOB,
            course: userCreated.course,
            regnum: userCreated.regnum,
            auraPoints: userCreated.auraPoints
        });
    }),

    // Login
    login: asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        // Check if email is valid
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error("Invalid email");
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Invalid login credentials");
        }

        // Generate token
        const token = jwt.sign({ id: user._id }, 'appKey', {
            expiresIn: "30d",
        });
        console.log(user);
        // Send the response
        res.json({
            message: "Login successful",
            token,
            id: user._id,
            email: user.email,
            username: user.username,  // Changed to "name" based on schema
            mobileNo: user.mobileNo,
            semester: user.semester,
            DOB: user.DOB,
            course: user.course,
            regnum: user.regnum,
            auraPoints: user.auraPoints,
        });
    }),

    // Profile
    profile: asyncHandler(async (req, res) => {
        // Find the user by ID
        const user = await User.findById(req.user);
        if (!user) {
            throw new Error("User not found");
        }

        // Send the response
        res.json({
            username: user.username,
            email: user.email,
            mobileNo: user.mobileNo,
            semester: user.semester,
            DOB: user.DOB,
            course: user.course,
            regnum: user.regnum,
            auraPoints:user.auraPoints,
        });
    }),

    // Change Password
    changeUserPassword: asyncHandler(async (req, res) => {
        const { newPassword } = req.body;

        // Find the user
        const user = await User.findById(req.user);
        if (!user) {
            throw new Error("User not found");
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);
        user.password = hashedPassword;
        await user.save({
            validateBeforeSave: false,
        });

        // Send the response
        res.json({ message: "Password changed successfully" });
    }),

    // Update User Profile
    updateUserProfile: asyncHandler(async (req, res) => {
        const { email, username, mobileNo, semester, DOB, course, regnum ,auraPoints} = req.body;

        // Find and update the user
        const updatedUser = await User.findByIdAndUpdate(
            req.user,
            { email, username, mobileNo, semester, DOB, course, regnum,auraPoints },
            { new: true }
        );

        // Send the response
        res.json({
            message: "Profile updated successfully",
            updatedUser: {
                username: updatedUser.username,
                email: updatedUser.email,
                mobileNo: updatedUser.mobileNo,
                semester: updatedUser.semester,
                DOB: updatedUser.DOB,
                course: updatedUser.course,
                regnum: updatedUser.regnum,
                auraPoints: updatedUser.auraPoints
            }
        });
    }),
    
    // Daily Check-in Controller
    dailyCheckIn: asyncHandler(async (req, res) => {
        console.log("Daily Check-in Route Hit");
        console.log("Request User from Token:", req.user);
      
        if (!req.user) {
          return res.status(401).json({ message: "User not authenticated" });
        }
      
        try {
          const user = await User.findById(req.user);
          if (!user) {
            console.log("User not found in the database");
            return res.status(404).json({ message: "User not found" });
          }
      
          console.log("Found User:", user);
          const today = new Date().setHours(0, 0, 0, 0);
          const lastCheckDate = user.lastCheckIn ? user.lastCheckIn.setHours(0, 0, 0, 0) : null;
      
          if (lastCheckDate === today) {
            return res.status(200).json({ message: "Daily check-in already completed", auraPoints: user.auraPoints });
          }
      
          user.auraPoints += 1;
          user.lastCheckIn = new Date();
          await user.save();
      
          res.status(200).json({ message: "Daily check-in successful!", auraPoints: user.auraPoints });
        } catch (error) {
          console.error("Error during daily check-in:", error.message);
          res.status(500).json({ message: "Server error", error: error.message });
        }
      })
            
      
}

export default usersController;
