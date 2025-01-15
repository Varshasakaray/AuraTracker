import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
//User Registration

const usersController={
    //Register
    register:asyncHandler(async(req,res)=>{
        const {username,email,password} = req.body;
        console.log(req.body);
        if(!username || !email || !password){
            throw new Error("please fill all required fields");
        }
        //check if user is already registered
        const userExists=await User.findOne({email});
        if(userExists){
            throw new Error("User already registered");
        }
        const salt=await  bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(password, salt);
        const userCreated = await User.create({
            email,username,
            password:hashedPassword,
        });
        console.log(req.body);
        res.json({
            username:userCreated.username,
            email:userCreated.email,
            id:userCreated._id,
        });
    }),
    //Login
    login:asyncHandler(async(req,res)=>{
        //Get the user data
        const {email,password}=req.body;
        //check if email is valid
        const user=await User.findOne({email});
        if(!user){
            throw new Error("Invalid email");
        }
        //compare the user password
        const isMatch=await bcrypt.compare(password,user.password);
        if(!isMatch){
            throw new Error("Invalid login credentials");
        }
        //Generate token
        const token=jwt.sign({id:user._id},'appKey',{
            expiresIn:"30d",
        });
        //Send the response
        res.json({
            message:"Login successful",
            token,
            id:user._id,
            email:user.email,
            username:user.username,
        })
    }),
    //profile
    profile:asyncHandler(async(req,res)=>{
        //find the user
        // console.log(req.headers);
        const user=await User.findById(req.user);
        if(!user){
            throw new Error("User not found");
        }
        //send the response
        res.json({username:user.username,email:user.email});
    }),
    //change password
    changeUserPassword:asyncHandler(async(req,res)=>{
       const {newPassword}=req.body;
       //Find the user
       console.log(req.body);
        const user=await User.findById(req.user);
        if(!user){
            throw new Error("User not found");
        }
        console.log(user);
        //hash the password
        const salt=await  bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(newPassword, salt);
        user.password=hashedPassword;
        await user.save({
            validateBeforeSave:false,
        });
        //send the response
        res.json({message:"Password changed successfully"});
    }),
    //update user profile
    updateUserProfile:asyncHandler(async(req,res)=>{
       const {email,username}=req.body;
       const updatedUser=await User.findByIdAndUpdate(req.user,{username,email},{
        new:true,
       });
        //send the response
        console.log(req.user);
        res.json({message:"Password changed successfully",updatedUser});
    }),
    
}

export default usersController;