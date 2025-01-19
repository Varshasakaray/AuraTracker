import mongoose from 'mongoose';

const attendanceSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    subject:{
        type:String,
        required:true,
        default:"Uncategorized",
    },
    totalClasses:{
        type:Number,
        required:true,
        // enum:["income","expense"],
    },
    attendedClasses:{
        type:Number,
        required:true,
    }
},{timestamps:true,});

export default mongoose.model('Attendance',attendanceSchema);