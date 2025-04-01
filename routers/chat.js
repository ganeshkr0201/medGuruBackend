import express from 'express';
import { handleHistory, handleReqResFromAi } from '../controllers/chat.js';

const chatRouter = express.Router();

chatRouter.post('/', handleReqResFromAi);
chatRouter.post('/history', handleHistory);

export default chatRouter;