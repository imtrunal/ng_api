const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { CONFIG } = require('./config');

module.exports.connectDb = () => {
    try {

        mongoose.connect(CONFIG.dbUrl);
        mongoose.connection.on('connected', () => {
            console.log("Mongoose connected successfully.");
        });

        mongoose.connection.on('error', (err) => {
            console.error("Mongoose connection error: ", err);
        });
    } catch (error) {
        console.log("Database error", error);
    }
}
