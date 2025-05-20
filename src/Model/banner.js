const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    banner: {
        type: String,
        required: true
    },
    bannerName: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    }
}, { timestamps: true }
);

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;