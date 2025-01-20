import express from 'express';

import isAuthenticated from '../middlewares/isAuth.js';
import attendanceController from '../controllers/attendanceController.js';



const attendanceRouter=express.Router();
//add
attendanceRouter.post('/api/v1/subjects/create',isAuthenticated, attendanceController.create);
//lists
attendanceRouter.get('/api/v1/subjects/lists',isAuthenticated, attendanceController.lists);

//update
attendanceRouter.put(
    "/api/v1/subjects/update/:subjectId",
    isAuthenticated,
    attendanceController.update
  );
  // delete
  attendanceRouter.delete(
    "/api/v1/subjects/delete/:id",
    isAuthenticated,
    attendanceController.delete
  );


export default attendanceRouter;