const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tokenSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const Token = mongoose.model('token', tokenSchema);

module.exports = Token;