const { status } = require("http-status");
const bcrypt = require("bcrypt");
const userService = require("../Service/adminService");
const { errorResponse, successResponse } = require("../utils/apiResponse");
const { createUserSession } = require("../utils/jwt");
const { generateToken, checkToken, updateToken } = require("../Service/authTokenService");

//User Registration
const userRegister = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const isExistingUser = await userService.findUser(email);
        if (isExistingUser) {
            return errorResponse(req, res, status.CONFLICT, "User already exists");
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await userService.createUser({
            name,
            email,
            password: hashedPassword,
        });

        if (!newUser) {
            return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, "User registration failed");
        }
        const sessionResponse = await createUserSession(newUser);
        await generateToken(newUser._id, sessionResponse.sessionToken);
        return successResponse(req, res, status.CREATED, "User register successfully", {
            token: sessionResponse.sessionToken,
            user: newUser,
        });
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

//User Login
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userService.findUser(email);
        if (!user) {
            return errorResponse(req, res, status.NOT_FOUND, "User not found");
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return errorResponse(req, res, status.UNAUTHORIZED, "Entred password is incorrect");
        }

        const sessionResponse = await createUserSession(user);
        await generateToken(user._id, sessionResponse.sessionToken);
        return successResponse(req, res, status.OK, "User Logged In!", { token: sessionResponse.sessionToken, user: user });
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

module.exports = { userRegister, userLogin };
