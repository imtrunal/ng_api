const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const ImageFiles = mongoose.model('ImageFiles', imageSchema);

module.exports = ImageFiles;
