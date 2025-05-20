const jwt = require('jsonwebtoken');
const { CONFIG } = require('../config/config');

const createUserSession = async function (user) {
    const token = await generateJWT(user);
    const loginResponse = { sessionToken: token, user: user };
    return loginResponse;
}

const generateJWT = async function (value) {
    const payload = {
        userId: value._id,
        email: value.email
    };

    return jwt.sign(payload, CONFIG.jwtSecret, { expiresIn: CONFIG.jwtExp });
}

module.exports = {
    createUserSession,
}