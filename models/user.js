import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: {
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    roles: {
        type: [String],
        enum: ['user', 'admin', 'moderator'],
        default: ['user']
    },
    memory: [
        {
            content: { type: String, required: true },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    createdAt: {
        type: Date, 
        default: Date.now 
    },
});

const User = mongoose.model("User", userSchema);

export { User };
