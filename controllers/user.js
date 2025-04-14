import { User } from "../models/user.js";
import { Chat } from "../models/chat.js";
import { createTokenForUser } from "../services/authentication.js";
import mongoose from "mongoose";


const handleSignUp = async (req, res) => {
    console.log("recieved a POST request on /api/user/signup");
    const { name, email, password } = req.body;
    if(!name || !email || !password) {
        return res.send({ success: false, error: "missing name, email or password"});
    }
    const user = await User.findOne({email: email});
    if(user) {
        return res.send({success: false, error: "user already registered"});
    }
    try{
        const user = await User.create({
            name,
            email,
            password
        });
        const token = createTokenForUser(user);
        return res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 15 * 24 * 60 * 60 * 1000,
          }).send({sucess: true, token: token});
    }
    catch(error) {
        return res.send({success: false, error: error.message});
    }
}

const handleSignIn = async (req, res) => {
    console.log("recieved a POST request on /api/user/signin");
    const { email, password } = req.body;
    const user = await User.findOne({email});
    if(!user) {
        return res.send({sucess: false, error: "user does not exist"});
    }
    if(user.password !== password) {
        return res.send({success: false, error: "Incorrect Password"});
    }
    const token = createTokenForUser(user);
    return res.cookie("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 15 * 24 * 60 * 60 * 1000,
          }).send({sucess: true, token: token});
}

const handleLogout = (req, res) => {
    console.log("recieved a GET request on /api/user/logout");
    return res.clearCookie('token').send({success: true, message: "token removed"});
}

const handleDelete = async (req, res) => {
    try {
        const { userId } = req.params;
        const { password } = req.body;
        console.log("recieved a GET request on /api/user/delete"+userId);
        const user = await User.findById(userId);
        if(!user) {
            return res.send({ success: false, error: "User Doesn't Exist"});
        }
        if(!password) {
            return res.send({ success: false, error: "Password Empty"});
        }
        if(user.password != password) {
            return res.send({ success: false, error: "Incorrect Password"});
        }
        await Chat.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
        await User.findByIdAndDelete(userId);
        return res.send({ success: true, message: "User Deleted Successfully"});
    }
    catch (error) {
        return res.send({ success: false, error: error.message });
    }
}

export {
    handleSignUp,
    handleSignIn,
    handleLogout,
    handleDelete,
}
