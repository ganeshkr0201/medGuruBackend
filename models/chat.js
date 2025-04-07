import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    sessionId: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    messages: [
        {
            text: { type: String, required: true },
            user: { type: String, enum: ["me", "ai"], required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Chat = mongoose.model("Chat", chatSchema);
export { Chat };
