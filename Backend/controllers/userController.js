import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const usersController = {
    // Register
    register: asyncHandler(async (req, res) => {
        const { name, email, password, mobileNo, semester, DOB, course, regno } = req.body;
        console.log(req.body);
        
        // Validate required fields
        if (!name || !email || !password || !mobileNo || !semester || !DOB || !course || !regno) {
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
            name,
            email,
            password: hashedPassword,
            mobileNo,
            semester,
            DOB,
            course,
            regno
        });

        console.log(req.body);
        res.json({
            name: userCreated.name,
            email: userCreated.email,
            id: userCreated._id,
            mobileNo: userCreated.mobileNo,
            semester: userCreated.semester,
            DOB: userCreated.DOB,
            course: userCreated.course,
            regno: userCreated.regno
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

        // Send the response
        res.json({
            message: "Login successful",
            token,
            id: user._id,
            email: user.email,
            username: user.name,  // Changed to "name" based on schema
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
            name: user.name,
            email: user.email,
            mobileNo: user.mobileNo,
            semester: user.semester,
            DOB: user.DOB,
            course: user.course,
            regno: user.regno,
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
        const { email, name, mobileNo, semester, DOB, course, regno } = req.body;

        // Find and update the user
        const updatedUser = await User.findByIdAndUpdate(
            req.user,
            { email, name, mobileNo, semester, DOB, course, regno },
            { new: true }
        );

        // Send the response
        res.json({
            message: "Profile updated successfully",
            updatedUser: {
                name: updatedUser.name,
                email: updatedUser.email,
                mobileNo: updatedUser.mobileNo,
                semester: updatedUser.semester,
                DOB: updatedUser.DOB,
                course: updatedUser.course,
                regno: updatedUser.regno
            }
        });
    })
}

export default usersController;
