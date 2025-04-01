import { User } from "../models/user.js";
import { sendReqToGemini } from "../config/connectGemini.js";


const handleReqResFromAi = async (req, res) => {
    try{
        const user_id = req.user?.id;
        const user = await User.findById(user_id);
        const { userMessage } = req.body;
        if(!user) {
            return res.send({success: false, error: "User Not Found"});
        }
        const aiMessage = await sendReqToGemini(userMessage);
        user.chatHistory.push({ user: userMessage, ai: aiMessage.content });
        await user.save();
        return res.send({success: true, userMessage: userMessage, aiMessage: aiMessage.content});
    }
    catch(error) {
        return res.send({success: false, error: error.message})
    }
}

const handleHistory = async (req, res) => {
    try{
        const user_id = req.user?.id;
        const user = await User.findById(user_id);
        if(!user) {
            return res.send({success: false, error: "User Not Found"});
        }
        return res.send({success: true, History: user.chatHistory});
    }
    catch(error) {
        return res.send({success: false, error: error.message});
    }
}

export {
    handleReqResFromAi,
    handleHistory
}