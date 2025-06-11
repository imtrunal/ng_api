const Token = require("../Model/token");

//check token
const checkToken = async (id) => {
    try {
        return Token.findOne({ userId: id });
    } catch (error) {
        throw error;
    }
}

//generate new Token
const generateToken = async (id, token) => {
    const storedToken = new Token({
        userId: id,
        token: token,
    });
    storedToken.save();
    return storedToken;
}

//update Token
const updateToken = async (id, token) => {
    const updateToken = await Token.findOneAndUpdate({ userId: id }, { token }, { new: true });
    await updateToken.save();
    return updateToken;
}

module.exports={
    checkToken,
    generateToken,
    updateToken
}