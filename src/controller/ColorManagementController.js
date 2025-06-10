const { default: status } = require("http-status");
const colorService = require("../Service/ColorService");
const { successResponse, errorResponse } = require("../utils/apiResponse");

const addNewColor = async (req, res) => {
    try {
        const color = await colorService.addNewColor(req.body);
        return successResponse(req, res, status.OK, "Color added successfully", color );
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

const getAllColors = async (req, res) => {
    try {
        const colors = await colorService.getAllColors();
        return successResponse(req, res, status.OK, "Colors fetched successfully",  colors );
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

const getColorById = async (req, res) => {
    try {
        const color = await colorService.getColorById(req.params.id);
        if (!color) return errorResponse(req, res, status.NOT_FOUND, "Color not found");
        return successResponse(req, res, status.OK, "Color fetched successfully",  color );
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

const updateColor = async (req, res) => {
    try {
        const color = await colorService.updateColor(req.params.id, req.body);
        if (!color) return errorResponse(req, res, status.NOT_FOUND, "Color not found");
        return successResponse(req, res, status.OK, "Color updated successfully", color );
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

const deleteColor = async (req, res) => {
    try {
        const color = await colorService.deleteColor(req.params.id);
        if (!color) return errorResponse(req, res, status.NOT_FOUND, "Color not found");
        return successResponse(req, res, status.OK, "Color deleted successfully",  color );
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

module.exports = {
    addNewColor,
    getAllColors,
    getColorById,
    updateColor,
    deleteColor,
};
