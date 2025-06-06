const Shape = require("../Model/shape");

// Create a new shape
const addNewShape = async (req, res) => {
    try {
        const shape = new Shape(req.body);
        await shape.save();
        return res.status(201).json(shape);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get all shapes
const getAllShapes = async (req, res) => {    
    try {
        const shapes = await Shape.find();
        return res.json(shapes);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get a shape by ID
const getShapeById = async (req, res) => {
    try {
        const shape = await Shape.findById(req.params.id);
        if (!shape) return res.status(404).json({ message: 'Shape not found' });
        return res.json(shape);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Update a shape
const updateShape = async (req, res) => {
    try {
        const shape = await Shape.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!shape) return res.status(404).json({ message: 'Shape not found' });
        return res.json(shape);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Delete a shape
const deleteShape = async (req, res) => {
    try {
        const shape = await Shape.findByIdAndDelete(req.params.id);
        if (!shape) return res.status(404).json({ message: 'Shape not found' });
        return res.json({ message: 'Shape deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addNewShape,
    getAllShapes,
    getShapeById,
    updateShape,
    deleteShape
};
