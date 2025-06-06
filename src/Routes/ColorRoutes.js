const express = require('express');
const router = express.Router();
const {
    addNewColor,
    getAllColors,
    getColorById,
    updateColor,
    deleteColor
} = require("../controller/ColorManagementController")

// Create a new color
router.post('/', addNewColor);

// Get all colors
router.get('/', getAllColors);

// Get a single color by ID
router.get('/:id', getColorById);

// Update a color
router.put('/:id', updateColor);

// Delete a color
router.delete('/:id', deleteColor);

module.exports = router;
