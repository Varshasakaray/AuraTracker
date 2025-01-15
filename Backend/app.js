import express from 'express';
import userRouter from './routes/userRoutes.js';
import cors from 'cors';
import mongoose from 'mongoose';
import errorHandler from './middlewares/errorHandlerMiddleware.js';
import taskRouter from './routes/taskRouter.js';
const app= express();
app.use(express.json());


//connect to mongodb
mongoose.connect("mongodb://localhost:27017/aura-tracker")
.then(()=>console.log("Connected to mongodb"))
.catch((e)=>console.log(e));

//cors  config
const corsOptions={
    origin:['http://localhost:5173']
}
app.use(cors(corsOptions));
app.use("/",userRouter);
app.use("/",taskRouter);
app.use(errorHandler);

const PORT=process.env.PORT || 8000;

app.listen(PORT, () =>{
    console.log('listening on port ${PORT}');
});