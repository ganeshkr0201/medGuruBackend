import express from 'express';
import { handleReqResFromAi, getUserChatHistory, deleteChatHistory } from '../controllers/chat.js';

const chatRouter = express.Router();

chatRouter.post('/:user_id/:sessionId', handleReqResFromAi);
chatRouter.get("/history/:user_id", getUserChatHistory);
chatRouter.delete("/history/:user_id/:sessionId", deleteChatHistory);


export default chatRouter;
