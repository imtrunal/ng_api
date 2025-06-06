const categoryService = require('../Service/CategoryService');

const addBulkCategory = async (req, res) => {
    try {
        const createdCategories = await categoryService.addBulk(req.body);
        return res.status(201).json(createdCategories);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const addCategory = async (req, res) => {
    try {
        const { name, subcategories } = req.body;
        const createdCategory = await categoryService.add(name, subcategories);
        return res.status(201).json(createdCategory);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const getAllCategory = async (req, res) => {
    try {
        const categories = await categoryService.findAllCategory();
        return res.json(categories);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await categoryService.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        return res.json(category);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const updateCategoryName = async (req, res) => {
    try {
        const updated = await categoryService.updateName(req.params.id, req.body.name);
        if (!updated) return res.status(404).json({ message: 'Category not found' });
        return res.json(updated);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const deleted = await categoryService.deleteCategory(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Category not found' });
        return res.json({ message: 'Category and subcategories deleted' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

const addNewSubCategory = async (req, res) => {
    try {
        const updated = await categoryService.addNewSubCategory(req.params.id, req.body.subcategories);
        return res.status(201).json(updated);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

const removeSubCategory = async (req, res) => {
    try {
        const updated = await categoryService.removeSubCategory(req.params.id, req.params.subId);
        if (!updated) return res.status(404).json({ message: 'Category not found' });
        return res.json(updated);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};

module.exports = {
    addBulkCategory,
    addCategory,
    getAllCategory,
    getCategoryById,
    updateCategoryName,
    deleteCategory,
    addNewSubCategory,
    removeSubCategory
};
