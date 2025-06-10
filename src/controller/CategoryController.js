const { default: status } = require('http-status');
const categoryService = require('../Service/CategoryService');
const { errorResponse, successResponse } = require("../utils/apiResponse");

const addBulkCategory = async (req, res) => {
    try {
        const category = await categoryService.addBulk(req.body);
        return successResponse(req, res, status.OK, "Bulk Category Added Successfully", category);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message)
    }
};

const addCategory = async (req, res) => {
    try {
        const { name, subcategories } = req.body;
        const category = await categoryService.add(name, subcategories);
        return successResponse(req, res, status.CREATED, "Category Added Successfully", category);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message)
    }
};

const getAllCategory = async (req, res) => {
    try {
        const categories = await categoryService.findAllCategory();
        return successResponse(req, res, status.OK, "Categories Retrieved Successfully",  categories );
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message)
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category = await categoryService.findById(req.params.id);
        if (!category) return errorResponse(req, res, status.NOT_FOUND, "Category Not Found");
        return successResponse(req, res, status.OK, "Category Retrieved Successfully", category);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message)
    }
};

const updateCategoryName = async (req, res) => {
    try {
        const category = await categoryService.updateName(req.params.id, req.body.name);
        if (!category) return errorResponse(req, res, status.NOT_FOUND, "Category Not Found");
        return successResponse(req, res, status.OK, "Category Updated Successfully", category);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message)
    }
};

const deleteCategory = async (req, res) => {
    try {
        const category = await categoryService.deleteCategory(req.params.id);
        if (!category) return errorResponse(req, res, status.NOT_FOUND, "Category Not Found");
        return successResponse(req, res, status.OK, "Category Deleted Successfully");
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message)
    }
};

const addNewSubCategory = async (req, res) => {
    try {
        const category = await categoryService.addNewSubCategory(req.params.id, req.body.subcategories);
        return successResponse(req, res, status.OK, "New Subcategory Added Successfully", category);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message)
    }
};

const removeSubCategory = async (req, res) => {
    try {
        const category = await categoryService.removeSubCategory(req.params.id, req.params.subId);
        if (!category) return errorResponse(req, res, status.NOT_FOUND, "Category Not Found");
        return successResponse(req, res, status.OK, "Subcategory Removed Successfully", category);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message)
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
