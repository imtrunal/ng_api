const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    subcategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SubCategory' }]
});

const Category = mongoose.model('Category', categorySchema);


const subcategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    icon: { type: String,},
});

const SubCategory = mongoose.model('SubCategory', subcategorySchema);


module.exports = { Category, SubCategory };
