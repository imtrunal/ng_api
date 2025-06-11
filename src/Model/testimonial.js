const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String
    },
    text: {
        type: String
    }
}, { timestamps: true });

const Testimonial = mongoose.model("Testimonial", testimonialSchema);

module.exports = Testimonial;