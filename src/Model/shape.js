const mongoose = require('mongoose');

const shapeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
}, {
    timestamps: true
});

const Shape = mongoose.model('Shapes', shapeSchema);

module.exports = Shape;