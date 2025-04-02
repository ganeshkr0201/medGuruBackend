import { validateToken } from "../services/authentication.js";

function checkForAuthenticationCookie(cookieName) {
    return function(req, res, next) {
        const tokenCookieValue = req.cookies.token;
        console.log(req.cookies);
        if(!tokenCookieValue){
            return next();
        }
        const userPayload = validateToken(tokenCookieValue);
        req.user = userPayload;
        return next();
    }
}

export {
    checkForAuthenticationCookie,
}
