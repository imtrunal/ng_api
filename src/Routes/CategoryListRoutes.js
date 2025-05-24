const express = require('express');
const router = express.Router();
const { Category, SubCategory } = require('../Model/category');



router.post('/bulk', async (req, res) => {
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

        res.status(201).json(createdCategories);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


// Create a new category with subcategories
router.post('/', async (req, res) => {
    try {
        const { name, subcategories } = req.body;

        const createdSubs = await SubCategory.insertMany(subcategories);
        const subcategoryIds = createdSubs.map(sub => sub._id);

        const newCategory = await Category.create({
            name,
            subcategories: subcategoryIds
        });

        const populated = await Category.findById(newCategory._id).populate('subcategories');
        res.status(201).json(populated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Get all categories with subcategories
router.get('/', async (req, res) => {
    try {
        const categories = await Category.find().populate('subcategories', 'name , icon');
        res.json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a single category by ID with subcategories
router.get('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate('subcategories', 'name');
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.json(category);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a category name
router.put('/:id', async (req, res) => {
    try {
        const updated = await Category.findByIdAndUpdate(req.params.id, { name: req.body.name }, {
            new: true,
            runValidators: true
        }).populate('subcategories', 'name');
        if (!updated) return res.status(404).json({ message: 'Category not found' });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Delete a category and its subcategories
router.delete('/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        // Optional: delete subcategories from DB
        await SubCategory.deleteMany({ _id: { $in: category.subcategories } });

        await category.deleteOne();
        res.json({ message: 'Category and subcategories deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add new subcategories to existing category
router.post('/:id/subcategories', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        const newSubs = await SubCategory.insertMany(req.body.subcategories);
        const newSubIds = newSubs.map(sub => sub._id);

        category.subcategories.push(...newSubIds);
        await category.save();

        const updated = await Category.findById(req.params.id).populate('subcategories', 'name');
        res.status(201).json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// Remove a subcategory from a category (optional: delete subcategory)
router.delete('/:id/subcategories/:subId', async (req, res) => {
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
        res.json(updated);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

module.exports = router;
