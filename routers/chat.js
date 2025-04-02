import express from 'express';
import { handleReqResFromAi, getUserChatHistory } from '../controllers/chat.js';

const chatRouter = express.Router();

chatRouter.post('/', handleReqResFromAi);
chatRouter.get("/history", getUserChatHistory);

export default chatRouter;
