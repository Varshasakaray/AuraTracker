import express from 'express';
import { CreateUser, AccessUser } from '../controller/user.js';

const router = express.Router();

router.post('/signup', CreateUser);
router.post('/signin', AccessUser);

export default router;
