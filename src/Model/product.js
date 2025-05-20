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
    image: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ImageFiles'
    },
    pdf: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'PDFfiles'
    },
    material: {
        type: String
    },
    moq: {
        type: Number,
        default: 1
    }
}, {
    timestamps: true
});

const Products = mongoose.model('Products', productSchema);

module.exports = Products;
