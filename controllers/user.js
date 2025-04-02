import { User } from "../models/user.js";
import { createTokenForUser } from "../services/authentication.js";


const handleSignUp = async (req, res) => {
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
    return res.clearCookie('token').send({success: true, message: "token removed"});
}

export {
    handleSignUp,
    handleSignIn,
    handleLogout
}

