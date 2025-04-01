import express from 'express';
import { handleLogout, handleSignIn, handleSignUp } from '../controllers/user.js';

const userRouter = express.Router();

userRouter.post('/signup', handleSignUp);
userRouter.post('/signin', handleSignIn);
userRouter.get('/logout', handleLogout);

export default userRouter;