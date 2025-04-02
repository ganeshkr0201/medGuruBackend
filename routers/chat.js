import express from 'express';
import { handleReqResFromAi, getUserChatHistory, deleteChatHistory } from '../controllers/chat.js';

const chatRouter = express.Router();

chatRouter.get("/history/:user_id", getUserChatHistory);
chatRouter.delete("/history/:user_id/:sessionId", deleteChatHistory);
chatRouter.post('/:user_id/:sessionId', handleReqResFromAi);


export default chatRouter;
