import mongoose from 'mongoose';
const announcementSchema = new mongoose.Schema({
    text: String,
    sender: String,
    timestamp: { type: Date, default: Date.now },
    filePath: String, // To store the file path
  });
  
  
export default mongoose.model("Announcement", announcementSchema);