const mongoose = require('mongoose');

const totalCountsSchema = new mongoose.Schema({
    totalVisiters: {
        type: Number,
        default: 0
    },
    totalProducts: {
        type: Number,
        default: 0
    },
    totalInquiries: {
        type: Number,
        default: 0
    },
    totalEKLGUse: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const TotalCounts = mongoose.model('Statistics', totalCountsSchema);
module.exports = TotalCounts;