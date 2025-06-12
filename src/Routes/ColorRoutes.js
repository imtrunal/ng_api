const express = require('express');
const router = express.Router();
const {
    addNewColor,
    getAllColors,
    getColorById,
    updateColor,
    deleteColor
} = require("../controller/ColorManagementController")
const { authorization } = require("../middleware/auth.middleware");

// Create a new color
router.post('/', authorization, addNewColor);
// Get all colors
router.get('/', getAllColors);
// Get a single color by ID
router.get('/:id', getColorById);
// Update a color
router.put('/:id', authorization, updateColor);
// Delete a color
router.delete('/:id', authorization, deleteColor);

module.exports = router;
