import { User } from "../models/user.js";


function checkForAuthorisation (roles) {
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return async function (req, res, next) {
        try {
            const { userId } = req.params;
            const user = await User.findById(userId);
            if(!user){
                return res.send({success: false, message: 'user not found'});
            }
            if (!requiredRoles.some(role => user.roles.includes(role))){
                return res.send({success: false, message: "unauthorised"});
            }
            return next();
        }
        catch (error) {
            return res.send({ success: false, error: error.message });
        }
        
    }
}

export {
    checkForAuthorisation,
}
