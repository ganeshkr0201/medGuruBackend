import express from 'express';
import { handleDelete, handleLogout, handleSignIn, handleSignUp } from '../controllers/user.js';

const userRouter = express.Router();

userRouter.post('/signup', handleSignUp);
userRouter.post('/signin', handleSignIn);
userRouter.get('/logout', handleLogout);
userRouter.delete('/delete/:userId', handleDelete);

export default userRouter;
