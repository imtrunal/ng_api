const shapeService = require("../Service/ShapeService");

const addNewShape = async (req, res) => {
    try {
        const shape = await shapeService.addNewShape(req.body);
        return res.status(201).json(shape);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getAllShapes = async (req, res) => {
    try {
        const shapes = await shapeService.getAllShapes();
        return res.status(200).json(shapes);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getShapeById = async (req, res) => {
    try {
        const shape = await shapeService.getShapeById(req.params.id);
        if (!shape) return res.status(404).json({ message: "Shape not found" });
        return res.status(200).json(shape);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateShape = async (req, res) => {
    try {
        const shape = await shapeService.updateShape(req.params.id, req.body);
        if (!shape) return res.status(404).json({ message: "Shape not found" });
        return res.status(200).json(shape);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const deleteShape = async (req, res) => {
    try {
        const shape = await shapeService.deleteShape(req.params.id);
        if (!shape) return res.status(404).json({ message: "Shape not found" });
        return res.status(200).json({ message: "Shape deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addNewShape,
    getAllShapes,
    getShapeById,
    updateShape,
    deleteShape,
};
