import express from 'express';
import userRouter from './routes/userRoutes.js';
import cors from 'cors';
import mongoose from 'mongoose';
import errorHandler from './middlewares/errorHandlerMiddleware.js';
import taskRouter from './routes/taskRouter.js';
import Announcement from './models/Announcement.js';
import attendanceRouter from './routes/attendanceRouter.js';
import examRouter from './routes/examRouter.js';
import timetableRouter from './routes/timetableRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';
import missionRouter from './routes/missionRoutes.js';
import multer from "multer";
import path from 'path';
import { fileURLToPath } from 'url';
import sendEmail from './utils/sendEmail.js';
// ES module workaround for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/aura-tracker")
  .then(() => console.log("Connected to MongoDB"))
  .catch((e) => console.log(e));

// CORS config
const corsOptions = {
  origin: ['http://localhost:5173'],
};
app.use(cors(corsOptions));
// app.use(cors());


// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'uploads'));
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
 const upload = multer({storage});

// **GET /api/v1/files** - Fetch all files
 app.get("/api/v1/files", async(req,res) =>{
  try{
    const announcements  = await Announcement.find();
    res.json(announcements );
  }catch(error){
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "An error occurred while fetching files" });
  }
 })

 // **POST /api/v1/upload** - Upload a file
 app.post("/api/v1/upload", upload.array("files", 10), async (req, res) => {
  try {
    console.log("Uploaded files:", req.files); // Debug: log the files received
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }
    // Create an array of file URLs (adjust the URL if needed)
    const fileUrls = req.files.map((file) => `uploads/${file.filename}`);
    return res.json({ message: "Upload successful!", fileUrls });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ message: "An error occurred while uploading files" });
  }
});


app.post("/send-badge-email", async (req, res) => {
  const { email, badgeName } = req.body;

  if (!email || !badgeName) {
      return res.status(400).json({ message: "Email and badge name are required" });
  }

  const messageContent = `<h3>Congratulations!</h3>
      <p>You have earned the <strong>${badgeName}</strong> badge! 🎉</p>
      <p>Keep up the great work and continue earning more rewards.</p>`;

  try {
      await sendEmail(email, messageContent);
      res.status(200).json({ message: "Badge email sent successfully" });
  } catch (error) {
      console.error("Error sending badge email:", error);
      res.status(500).json({ message: "Failed to send badge email" });
  }
});


// app.post('/api/v1/upload', (req, res) => {
//   res.send({ message: 'Upload successful!' });
// });

app.use("/",userRouter);
app.use("/",taskRouter);
app.use("/",attendanceRouter);
app.use("/",examRouter);
app.use('/',timetableRouter); 
app.use("/",notificationRouter);
app.use("/",missionRouter);
app.use(errorHandler);



const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`); 
});