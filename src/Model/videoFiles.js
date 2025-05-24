const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
    filename: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
}, { timestamps: true });

const VideoFiles = mongoose.model('VideoFiles', videoSchema);

module.exports = VideoFiles;
