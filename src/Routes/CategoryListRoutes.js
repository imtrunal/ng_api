const express = require('express');
const router = express.Router();
const { Category, SubCategory } = require('../Model/category');
const {
    addBulkCategory,
    addCategory,
    getAllCategory,
    getCategoryById,
    updateCategoryName,
    deleteCategory,
    addNewSubCategory,
    removeSubCategory } = require('../controller/CategoryController');
const { authorization } = require('../middleware/auth.middleware');

router.post('/bulk', authorization, addBulkCategory);


// Create a new category with subcategories
router.post('/', authorization, addCategory);

// Get all categories with subcategories
router.get('/', getAllCategory);

// Get a single category by ID with subcategories
router.get('/:id', getCategoryById);

// Update a category name
router.put('/:id', authorization, updateCategoryName);

// Delete a category and its subcategories
router.delete('/:id', authorization, deleteCategory);

// Add new subcategories to existing category
router.post('/:id/subcategories', authorization, addNewSubCategory);

// Remove a subcategory from a category (optional: delete subcategory)
router.delete('/:id/subcategories/:subId', authorization, removeSubCategory);

module.exports = router;
