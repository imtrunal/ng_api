const Token = require("../Model/token");

//check token
module.exports.checkToken = async (id) => {
    try {
        return Token.findOne({ userId: id });
    } catch (error) {
        throw error;
    }
}

//generate new Token
module.exports.generateToken = async (id, token) => {
    const storedToken = new Token({
        userId: id,
        token: token,
    });
    storedToken.save();
    return storedToken;
}

//update Token
module.exports.updateToken = async (id, token) => {
    const updateToken = await Token.findOneAndUpdate({ userId: id }, { token }, { new: true });
    await updateToken.save();
    return updateToken;
}