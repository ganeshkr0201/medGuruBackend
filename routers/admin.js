import express from 'express';
import { showAllChats, showAllUsers, updateRoles } from '../controllers/admin.js';
import { checkForAuthorisation } from '../middlewares/checkForAuthorisation.js';


const adminRouter = express.Router();


adminRouter.post('/update-roles/:userId', checkForAuthorisation(['admin']), updateRoles);
adminRouter.get('/show-chats/:userId', checkForAuthorisation(['admin']), showAllChats);
adminRouter.get('/show-users/:userId', checkForAuthorisation(['admin']), showAllUsers);


export default adminRouter;
