const express = require('express');
const router = express.Router();
const {
    addNewShape,
    getAllShapes,
    getShapeById,
    updateShape,
    deleteShape
} = require("../controller/ShapeManagementController");
const { authorization } = require("../middleware/auth.middleware");

// Create a new shape
router.post('/', authorization, addNewShape);

// Get all shapes
router.get('/', getAllShapes);

// Get a shape by ID
router.get('/:id', getShapeById);

// Update a shape
router.put('/:id', authorization, updateShape);

// Delete a shape
router.delete('/:id', authorization, deleteShape);

module.exports = router;
