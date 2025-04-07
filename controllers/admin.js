import { User } from "../models/user.js";
import { Chat } from "../models/chat.js";

const updateRoles = async (req, res) => {
    try{
        const { userId } = req.params;
        console.log(`recieved a POST request on /api/admin/update-roles/${userId}`);
        const { email, newRoles } = req.body;
        const validRoles = ['user', 'admin', 'moderator'];
        if(!email || !newRoles) {
            return res.send({success: false, message: "email or roles are missing"});
        }
        const client = await User.findOne({ email });
        if (!client) {
            return res.send({success: false, message: `no user exist with this email: ${email}`});
        }
        let updatedRoles = client.roles.filter(role => role === 'user');
        newRoles.forEach(role => {
            if (validRoles.includes(role) && !updatedRoles.includes(role)) {
              updatedRoles.push(role);
            }
          });
        client.roles = updatedRoles;
        await client.save();
        
        return res.send({success: true, Roles: client.roles});
    }
    catch(error) {
        return res.send({success: false, error: error.message});
    }
}

const showAllChats = async(req, res) => {
    const { userId } = req.params;
    console.log(`recieved a GET request on /api/admin/show-chats/${userId}`);
    const chats = await Chat.find({});
    return res.send({success: true, chats: chats});
}

const showAllUsers = async(req, res) => {
    const { userId } = req.params;
    console.log(`recieved a POST request on /api/admin/show-users/${userId}`);
    const users = await User.find({});
    return res.send({success: true, users: users});
}

export {
    updateRoles,
    showAllChats,
    showAllUsers
}
