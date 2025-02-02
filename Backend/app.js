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
import multer from "multer";
const app = express();

// const app= express();

app.use(express.json());
// Serve static files from the "Backend" folder
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
    cb(null, '/uploads');
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
//  app.post("/api/v1/upload", upload.array("files", 10), async (req, res) => {
//   try {
//     if (!req.files) {
//       return res.status(400).send("No files uploaded.");
//     }
//     const fileUrls = req.files.map((file) => `uploads/${file.filename}`);
//     res.json({ message: "Files uploaded successfully", fileUrls });
//   } catch (error) {
//     console.error("Error uploading files:", error);
//     res.status(500).json({ message: "An error occurred while uploading files" });
//   }
// });
app.post('/api/v1/upload', (req, res) => {
  res.send({ message: 'Upload successful!' });
});

app.use("/",userRouter);
app.use("/",taskRouter);
app.use("/",attendanceRouter);
app.use("/",examRouter);
app.use('/',timetableRouter); 
app.use(errorHandler);



const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`); // <-- Corrected string interpolation
});