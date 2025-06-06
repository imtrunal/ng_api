const Color = require("../Model/color");

// Create a new color
const addNewColor = async (req, res) => {
    try {
        const color = new Color(req.body);
        await color.save();
        return res.status(201).json(color);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Get all colors
const getAllColors = async (req, res) => {    
    try {
        const colors = await Color.find();
        return res.json(colors);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Get a single color by ID
const getColorById = async (req, res) => {
    try {
        const color = await Color.findById(req.params.id);
        if (!color) return res.status(404).json({ message: 'Color not found' });
        return res.json(color);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// Update a color
const updateColor = async (req, res) => {
    try {
        const color = await Color.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!color) return res.status(404).json({ message: 'Color not found' });
        return res.json(color);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

// Delete a color
const deleteColor = async (req, res) => {
    try {
        const color = await Color.findByIdAndDelete(req.params.id);
        if (!color) return res.status(404).json({ message: 'Color not found' });
        return res.json({ message: 'Color deleted successfully' });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addNewColor,
    getAllColors,
    getColorById,
    updateColor,
    deleteColor
};
