const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubCategory',
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    image: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImageFiles'
    }],
    pdf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PDFfiles'
    },
    video: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VideoFiles'
    },
    material: {
        type: String
    },
    description: {
        type: String
    },
    moq: {
        type: Number,
        default: 1
    },
    color: {
        type: String,
        default: ''
    },
    shape: {
        type: String,
        default: ''
    },
}, {
    timestamps: true
});

const Products = mongoose.model('Products', productSchema);

module.exports = Products;
