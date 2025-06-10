const { default: status } = require("http-status");
const shapeService = require("../Service/ShapeService");
const { errorResponse, successResponse } = require("../utils/apiResponse");

const addNewShape = async (req, res) => {
    try {
        const shape = await shapeService.addNewShape(req.body);
        return successResponse(req, res, status.OK, "New Shape Added successfully", shape);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

const getAllShapes = async (req, res) => {
    try {
        const shapes = await shapeService.getAllShapes();
        return successResponse(req, res, status.OK, "Shapes Retrieved successfully", shapes);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

const getShapeById = async (req, res) => {
    try {
        const shape = await shapeService.getShapeById(req.params.id);
        if (!shape) return errorResponse(req, res, status.NOT_FOUND, "Shape Not Found");
        return successResponse(req, res, status.OK, "Shape Retrieved successfully", shape);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

const updateShape = async (req, res) => {
    try {
        const shape = await shapeService.updateShape(req.params.id, req.body);
        if (!shape) return errorResponse(req, res, status.NOT_FOUND, "Shape Not Found");
        return successResponse(req, res, status.OK, "Shape Updated successfully", shape);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

const deleteShape = async (req, res) => {
    try {
        const shape = await shapeService.deleteShape(req.params.id);
        if (!shape) return errorResponse(req, res, status.NOT_FOUND, "Shape Not Found");
        return successResponse(req, res, status.OK, "Shape Deleted successfully", shape);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

module.exports = {
    addNewShape,
    getAllShapes,
    getShapeById,
    updateShape,
    deleteShape,
};
