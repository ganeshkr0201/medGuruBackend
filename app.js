import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import cors from 'cors';

import { User } from './models/user.js';
import { connectToDB } from './config/connectDB.js';
import userRouter from './routers/user.js';
import chatRouter from './routers/chat.js';
import adminRouter from './routers/admin.js';

const app = express();
const PORT = process.env.PORT || 3000;


//CONNECTING TO DATABASE
connectToDB(process.env.MONGO_URL)
.then(() => {
    console.log(`DB CONNECTION SUCCESSFULL`);
})
.catch((err) => {
    console.log(`ERROR IN DB : ${err}`);
})


//EXPRESS MIDDLEWARES
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: [process.env.FRONTEND_ORIGIN, process.env.LOCAL_ORIGIN],
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  methods: "GET,POST,PUT,DELETE",
}));


app.get('/add', async (req, res) => {
    const updateUser = await User.updateMany(
        { roles: { $exists: false } },
        { $set: { roles: ['user'] } }
      );           
      console.log(updateUser);
    return res.send({success: true, message: "user updated successfully"});
})

//EXPRESS ROUTES
app.get('/', (req, res) => {
    return res.send('API WORKING');
})
app.use('/api/user', userRouter);
app.use('/api/chat', chatRouter);
app.use('/api/admin', adminRouter);



//STARTING THE SERVERS
app.listen(PORT, () => {
    console.log(`Server Running On PORT: ${PORT}`);
})
