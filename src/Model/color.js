const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
}, {
    timestamps: true
});

const Color = mongoose.model('Colors', colorSchema);

module.exports = Color;