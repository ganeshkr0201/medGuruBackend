import { User } from "../models/user.js";
import { Chat } from "../models/chat.js";
import { sendReqToGemini } from "../config/connectGemini.js";
import moment from "moment";
import { v4 as uuidv4 } from "uuid";
import { updateDynamicMemory } from "../config/updateDynamicMemory.js";

const getUserChatHistory = async (req, res) => {
  try {
    const { user_id } = req.params;
    console.log("recieved a GET request on /api/chat/history/" + user_id);

    const user = await User.findById(user_id);
    if (!user) {
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
      older: [],
    };

    chats.forEach((chat) => {
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

    return res.send({ success: true, history: history });
  } catch (error) {
    res.status(500).json({ error: "Server error while fetching chat history" });
  }
};

const getUserChatSessionHistory = async (req, res) => {
  try {
    const { user_id, sessionId } = req.params;
    console.log(
      "recieved a GET request on /api/chat/history/" + user_id + "/" + sessionId
    );
    const result = await Chat.find({
      userId: user_id,
      sessionId: sessionId,
    });
    return res.send({ success: true, history: result });
  } catch (error) {
    return res.send({ success: false, error: error.message });
  }
};

const handleReqResFromAi = async (req, res) => {
  try {
    const { user_id, sessionId } = req.params;
    console.log(
      "received a POST request on /api/chat/" + user_id + "/" + sessionId
    );

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
    const memory = `i am ${name} and You know the following about the me based on our past conversations:\n${
      user.memory?.map((m) => m.content).join("\n") || ""
    }`;

    const aiMessage = await sendReqToGemini(userMessage, history, memory);

    const messages = [
      { text: userMessage, user: "me" },
      { text: aiMessage.content, user: "ai" },
    ];

    // Save messages in chat
    const existingChat = await Chat.findOne({ sessionId, userId: user_id });

    if (!existingChat) {
      // Create new chat with custom createdAt
      const chat = new Chat({
        userId: user_id,
        sessionId: sessionId || uuidv4(),
        title: title || userMessage,
        messages,
        createdAt: Date.now(), // Mongoose will set this anyway, but you’re being explicit
      });
      await chat.save();
    } else {
      // Update existing chat: append messages, update title, and override createdAt
      await Chat.findOneAndUpdate(
        { sessionId, userId: user_id },
        {
          $push: { messages: { $each: messages } },
          $set: {
            title: title || userMessage,
            createdAt: Date.now(),
          },
        },
        { new: true, runValidators: true }
      );
    }

    const summarizationPrompt = `
        Extract only personal facts about the user from the following message pair. Do not include explanations, headers, or bullet formatting.
        
        Respond with direct facts only, such as:
        Name
        Age
        Location
        Health conditions
        Preferences
        Emotional state
        Hobbies
        Repetitive behavior
        Goals
        
        Only include user-related facts. Omit anything about the assistant.
        
        User: ${userMessage}  
        Assistant: ${aiMessage.content}
        `;
    const memoryUpdate = await sendReqToGemini(summarizationPrompt, " ", " ");

    const previousMemory =
      user.memory.length > 0 ? user.memory[0].content : " ";
    const newSummary = updateDynamicMemory(
      previousMemory,
      memoryUpdate.content
    );

    if (user.memory.length <= 0) {
      user.memory.push({
        content: memoryUpdate.content,
        timestamp: new Date(),
      });
    } else {
      user.memory[0].content = newSummary;
      user.memory[0].timestamp = new Date();
    }
    await user.save();

    return res.send({
      success: true,
      userMessage: userMessage,
      aiMessage: aiMessage.content,
    });
  } catch (error) {
    return res.send({ success: false, error: error.message });
  }
};

const deleteChatHistory = async (req, res) => {
  try {
    const { user_id, sessionId } = req.params;
    console.log(
      "recieved a DELETE request on /api/chat/history/" +
        user_id +
        "/" +
        sessionId
    );
    const result = await Chat.deleteMany({
      userId: user_id,
      sessionId: sessionId,
    });
    return res.send({ success: true, message: "chat delete successful" });
  } catch (error) {
    return res.send({ success: false, error: error.message });
  }
};

export {
  handleReqResFromAi,
  getUserChatHistory,
  getUserChatSessionHistory,
  deleteChatHistory,
};
