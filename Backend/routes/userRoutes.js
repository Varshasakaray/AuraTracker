import express from 'express';
import isAuthenticated from '../middlewares/isAuth.js';
import usersController from '../controllers/userController.js';


const userRouter=express.Router();

userRouter.post('/api/v1/users/register', usersController.register);
userRouter.post('/api/v1/users/login', usersController.login);
userRouter.get('/api/v1/users/profile',isAuthenticated, usersController.profile);
//change password
userRouter.put('/api/v1/users/change-password',isAuthenticated, usersController.changeUserPassword);

//update profile
userRouter.put('/api/v1/users/update-profile',isAuthenticated, usersController.updateUserProfile);

export default userRouter;