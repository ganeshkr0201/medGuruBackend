import JWT from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

function createTokenForUser(user) {
    const payload = {
        id : user._id,
        name: user.name,
        email: user.email,
    }
    const token = JWT.sign(payload, process.env.JWT_SECRET_KEY);
    return token;
}


function validateToken(token) {
    const payload = JWT.verify(token, process.env.JWT_SECRET_KEY);
    return payload;
}

export {
    createTokenForUser,
    validateToken,
}