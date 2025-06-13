const mongoose = require('mongoose');

//name change
const statisticsSchema = new mongoose.Schema({
    totalVisiters: {
        type: Number,
        default: 0
    },
    totalProducts: {
        type: Number,
        default: 0
    },
    totalEKLGUse: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Statistics = mongoose.model('Statistics', statisticsSchema);

module.exports = Statistics; 