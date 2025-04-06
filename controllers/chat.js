import { User } from "../models/user.js";
import { Chat } from "../models/chat.js";
import { sendReqToGemini } from "../config/connectGemini.js";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";



const getUserChatHistory = async (req, res) => {
    try {
        const { user_id } = req.params;
        console.log("recieved a GET request on /api/chat/history/"+user_id);

        const user = await User.findById(user_id);
        if(!user) {
            return res.send({ success: false, message: "User Doesn't Exist" });
        }

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

        return res.send({success: true, history: history});
    } catch (error) {
        res.status(500).json({ error: "Server error while fetching chat history" });
    }
};


const getUserChatSessionHistory = async (req, res) => {
    try {
        const { user_id, sessionId } = req.params;
        console.log("recieved a GET request on /api/chat/history/"+user_id+"/"+sessionId);
        const result = await Chat.find({ 
            userId: user_id, 
            sessionId: sessionId 
        });
        return res.send({ success: true, history: result });
    }
    catch (error) {
        return res.send({ success: false, error: error.message });
    }
}

const handleReqResFromAi = async (req, res) => {
    try {
        const { user_id, sessionId } = req.params;
        console.log("Received a POST request on /api/chat/" + user_id + "/" + sessionId);

        const user = await User.findById(user_id);
        const { title, userMessage } = req.body;

        if (!user) {
            return res.send({ success: false, error: "User Not Found" });
        }
        if (!userMessage) {
            return res.send({ success: false, error: "User message missing" });
        }

        const result = await Chat.find({ userId: user_id, sessionId });
        const history = result.length > 0 ? result[0].messages : " ";

        // Format memory as concatenated string
        const name = user.name;
        const memory =`i am ${name} and our chat summery is ${user.memory?.map(m => m.content).join("\n") || ""}`;

        const aiMessage = await sendReqToGemini(userMessage, history, memory);

        const messages = [
            { text: userMessage, user: "me" },
            { text: aiMessage.content, user: "ai" },
        ];

        // Save messages in chat
        const existingChat = await Chat.findOne({ sessionId, userId: user_id });
        if (!existingChat) {
            const chat = new Chat({
                userId: user_id,
                sessionId: sessionId || uuidv4(),
                title: title || userMessage,
                messages: messages,
            });
            await chat.save();
        } else {
            await Chat.findOneAndUpdate(
                { sessionId, userId: user_id },
                { $push: { messages: { $each: messages } } },
                { new: true, runValidators: true }
            ).exec();
        }

        const summarizationPrompt = `Filter out important details and keywords from the following message:\n\n${aiMessage.content}`;
        const memoryUpdate = await sendReqToGemini(summarizationPrompt, " ", " ");

        // Delete memory older than 30 days
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        user.memory = user.memory.filter(entry => new Date(entry.timestamp) > oneMonthAgo);

        user.memory.push({
            content: memoryUpdate.content,
            timestamp: new Date()
        });

        await user.save();


        return res.send({
            success: true,
            userMessage: userMessage,
            aiMessage: aiMessage.content
        });
    } 
    catch (error) {
        return res.send({ success: false, error: error.message });
    }
};


const deleteChatHistory = async (req, res) => {
    try {
        const { user_id, sessionId } = req.params;
        console.log("recieved a DELETE request on /api/chat/history/"+user_id+"/"+sessionId);
        const result = await Chat.deleteMany({ 
            userId: user_id, 
            sessionId: sessionId 
        });
        return res.send({ success: true, message: "chat delete successful"});
    }
    catch (error) {
        return res.send({ success: false, error: error.message });
    }
}


export {
    handleReqResFromAi,
    getUserChatHistory,
    getUserChatSessionHistory,
    deleteChatHistory,
}
