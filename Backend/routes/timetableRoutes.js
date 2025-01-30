// routes/timetableRouter.js
import express from 'express';
import { getTimetableByDay, updateTimetable, addSubject, deleteSubject } from '../controllers/timetableController.js';
import isAuthenticated from '../middlewares/isAuth.js';

const timetableRouter = express.Router();

timetableRouter.get('/api/v1/timetable/:day', isAuthenticated, getTimetableByDay);
timetableRouter.post('/api/v1/timetable', isAuthenticated, updateTimetable);
timetableRouter.post('/api/v1/timetable/subject', isAuthenticated, addSubject);
timetableRouter.delete('/api/v1/timetable/:day/subject', isAuthenticated, deleteSubject);

export default timetableRouter;