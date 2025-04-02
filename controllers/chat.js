import { User } from "../models/user.js";
import { Chat } from "../models/chat.js";
import { sendReqToGemini } from "../config/connectGemini.js";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";



const getUserChatHistory = async (req, res) => {
    try {
        const user_id = req.user?.id;

        const now = moment();
        const startOfToday = now.startOf("day").toDate();
        const startOfYesterday = now.subtract(1, "day").startOf("day").toDate();
        const startOfLast7Days = now.subtract(6, "days").startOf("day").toDate();

        const chats = await Chat.find({ userId: user_id }).sort({ createdAt: -1 });

        let history = {
            today: [],
            yesterday: [],
            last7Days: [],
            older: []
        };

        chats.forEach(chat => {
            const chatDate = chat.createdAt;
            if (moment(chatDate).isSameOrAfter(startOfToday)) {
                history.today.push(chat);
            } else if (moment(chatDate).isSameOrAfter(startOfYesterday)) {
                history.yesterday.push(chat);
            } else if (moment(chatDate).isSameOrAfter(startOfLast7Days)) {
                history.last7Days.push(chat);
            } else {
                history.older.push(chat);
            }
        });

        return res.json(history);
    } catch (error) {
        res.status(500).json({ error: "Server error while fetching chat history" });
    }
};



const saveChatSession = async (req, res) => {
    try {
        const { userId, sessionId, title, messages } = req.body;

        const chat = new Chat({ 
            userId, 
            sessionId, 
            title, 
            messages
        });
        await chat.save();

        res.status(201).json({ message: "Chat session saved", chat });
    } catch (error) {
        res.status(500).json({ error: "Failed to save chat session" });
    }
};



const handleReqResFromAi = async (req, res) => {
    try {
        const user_id = req.user?.id;
        const user = await User.findById(user_id);
        const { userMessage } = req.body;
        if(!user) {
            return res.send({success: false, error: "User Not Found"});
        }
        const aiMessage = await sendReqToGemini(userMessage);
        const chat = new Chat({
            userId: user_id,
            sessionId: uuidv4(),
            title: userMessage,
            messages: [
                { "text": userMessage, "user": "me" },
                { "text": aiMessage.content, "user": "ai" }
            ]
        })
        await chat.save();
        return res.send({success: true, message: "Chat session saved", chat});
    }
    catch(error) {
        return res.send({success: false, error: error.message})
    }
}

export {
    handleReqResFromAi,
    getUserChatHistory,
    saveChatSession,
}
