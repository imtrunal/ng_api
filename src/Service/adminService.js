const User = require("../Model/User");

// Create a new user
const createUser = async (user) => {
    try {
        const newUser = new User(user);
        return await newUser.save();
    } catch (error) {
        throw Error(error);
    }
}

// Find a user
const findUser = async (email) => {
    try {
        return await User.findOne({
            email
        });
    }
    catch (error) {
        throw Error(error);
    }
}

//Find User By Id
const findUserById = async (id) => {
    try {
        return await User.findById(id);
    } catch (error) {
        throw Error(error);
    }
}

module.exports={
    createUser,
    findUser,
    findUserById
}
