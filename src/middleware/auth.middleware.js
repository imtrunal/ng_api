const jwt = require('jsonwebtoken');
const { errorResponse } = require('../utils/apiResponse');
const { CONFIG } = require('../config/config');
const Token = require('../Model/token');
const User = require('../Model/User');

module.exports.authorization = async (req, res, next) => {
    try {
        const token = req.headers["authorization"];        
        if (!token) {
            return errorResponse(req, res, 401, "Authorization forbidden");
        }
        const token1 = token.split(" ")[1];
        
        if (!token1) {
            return errorResponse(req, res, 401, "Token not provided");
        }
        // Verify the token and get the decoded data
        const decoded = jwt.verify(token1, CONFIG.jwtSecret);

        // Check if the token is expired
        const currentTime = Math.floor(Date.now() / 1000);
        //find the token
        const userToken = await Token.findOne({ userId: decoded.userId, token: token1 });
        if (!userToken) {
            return errorResponse(req, res, 401, "Invalid token");
        }
        if (decoded.exp < currentTime) {
            return errorResponse(req, res, 400, "Token has expired");
        }
        // Find the user from the decoded token's userId
        const user = await User.findById(decoded.userId);
        if (!user) {
            return errorResponse(req, res, 401, "Permission denied");
        }
        req.user = user; // Store user info in the request for further use
        next();
    } catch (error) {
        console.log(error);
        if (error.name === "TokenExpiredError") {
            return errorResponse(req, res, 400, "Token has expired");
        } else if (error.name === "JsonWebTokenError") {
            return errorResponse(req, res, 401, "Invalid token");
        } else {
            return errorResponse(req, res, 500, "Server error");
        }
    }
};