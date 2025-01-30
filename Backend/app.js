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
const app = express();

// const app= express();

app.use(express.json());

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/aura-tracker")
  .then(() => console.log("Connected to MongoDB"))
  .catch((e) => console.log(e));

// CORS config
const corsOptions = {
  origin: ['http://localhost:5173'],
};
app.use(cors(corsOptions));

app.use("/",userRouter);
app.use("/",taskRouter);
app.use("/",attendanceRouter);
app.use("/",examRouter);
app.use('/',timetableRouter); 
app.use(errorHandler);

// API to fetch all files
app.get("/api/v1/files", async (req, res) => {
  try{
    const files = await Announcement.find();
    res.status(200).json(files);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch files" });
  }
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`listening on port ${PORT}`); // <-- Corrected string interpolation
});