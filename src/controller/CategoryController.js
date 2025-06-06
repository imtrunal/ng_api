const { Category, SubCategory } = require('../Model/category');

const addBulkCategory = async (req, res) => {
    try {
        const categoriesData = req.body; // Expecting an array

        const createdCategories = [];

        for (const cat of categoriesData) {
            const createdSubs = await SubCategory.insertMany(cat.subcategories);
            const subcategoryIds = createdSubs.map(sub => sub._id);

            const newCategory = await Category.create({
                name: cat.name,
                subcategories: subcategoryIds
            });

            const populatedCategory = await Category.findById(newCategory._id).populate('subcategories', 'name');
            createdCategories.push(populatedCategory);
        }

        return res.status(201).json(createdCategories);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

// Create a new category with subcategories
const addCategory = async (req, res) => {
    try {
        const { name, subcategories } = req.body;

        const createdSubs = await SubCategory.insertMany(subcategories);
        const subcategoryIds = createdSubs.map(sub => sub._id);

        const newCategory = await Category.create({
            name,
            subcategories: subcategoryIds
        });

        const populated = await Category.findById(newCategory._id).populate('subcategories');
        return res.status(201).json(populated);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

// Get all categories with subcategories
const getAllCategory = async (req, res) => {    
    try {
        const categories = await Category.find().populate('subcategories', 'name , icon');
        return res.json(categories);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Get a single category by ID with subcategories
const getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate('subcategories', 'name');
        if (!category) return res.status(404).json({ message: 'Category not found' });
        return res.json(category);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Update a category name
const updateCategoryName = async (req, res) => {
    try {
        const updated = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
            new: true,
            runValidators: true
        }).populate('subcategories', 'name');
        if (!updated) return res.status(404).json({ message: 'Category not found' });
        return res.json(updated);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

// Delete a category and its subcategories
const deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        // Optional: delete subcategories from DB
        await SubCategory.deleteMany({ _id: { $in: category.subcategories } });

        await category.deleteOne();
        return res.json({ message: 'Category and subcategories deleted' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

// Add new subcategories to existing category
const addNewSubCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const newSubs = await SubCategory.insertMany(req.body.subcategories);
        const newSubIds = newSubs.map(sub => sub._id);

        category.subcategories.push(...newSubIds);
        await category.save();

        const updated = await Category.findById(req.params.id).populate('subcategories', 'name');
        return res.status(201).json(updated);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

// Remove a subcategory from a category (optional: delete subcategory)
const removeSubCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        category.subcategories = category.subcategories.filter(
            sub => sub.toString() !== req.params.subId
        );
        await category.save();

        // Optional: delete subcategory from collection
        await SubCategory.findByIdAndDelete(req.params.subId);

        const updated = await Category.findById(req.params.id).populate('subcategories', 'name');
        return res.json(updated);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

module.exports={
    addBulkCategory,
    addCategory,
    getAllCategory,
    getCategoryById,
    updateCategoryName,
    deleteCategory,
    addNewSubCategory,
    removeSubCategory
}
