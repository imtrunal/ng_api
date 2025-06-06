const colorService = require("../Service/ColorService");

const addNewColor = async (req, res) => {
    try {
        const color = await colorService.addNewColor(req.body);
        return res.status(201).json(color);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const getAllColors = async (req, res) => {
    try {
        const colors = await colorService.getAllColors();
        return res.status(200).json(colors);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getColorById = async (req, res) => {
    try {
        const color = await colorService.getColorById(req.params.id);
        if (!color) return res.status(404).json({ message: "Color not found" });
        return res.status(200).json(color);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const updateColor = async (req, res) => {
    try {
        const color = await colorService.updateColor(req.params.id, req.body);
        if (!color) return res.status(404).json({ message: "Color not found" });
        return res.status(200).json(color);
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

const deleteColor = async (req, res) => {
    try {
        const color = await colorService.deleteColor(req.params.id);
        if (!color) return res.status(404).json({ message: "Color not found" });
        return res.status(200).json({ message: "Color deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = {
    addNewColor,
    getAllColors,
    getColorById,
    updateColor,
    deleteColor,
};
