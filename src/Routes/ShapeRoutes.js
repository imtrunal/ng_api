const express = require('express');
const router = express.Router();
const Shape = require("../Model/shape");

// Create a new shape
router.post('/', async (req, res) => {
    try {
        const shape = new Shape(req.body);
        await shape.save();
        res.status(201).json(shape);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all shapes
router.get('/', async (req, res) => {
    try {
        const shapes = await Shape.find();
        res.json(shapes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a shape by ID
router.get('/:id', async (req, res) => {
    try {
        const shape = await Shape.findById(req.params.id);
        if (!shape) return res.status(404).json({ message: 'Shape not found' });
        res.json(shape);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a shape
router.put('/:id', async (req, res) => {
    try {
        const shape = await Shape.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!shape) return res.status(404).json({ message: 'Shape not found' });
        res.json(shape);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a shape
router.delete('/:id', async (req, res) => {
    try {
        const shape = await Shape.findByIdAndDelete(req.params.id);
        if (!shape) return res.status(404).json({ message: 'Shape not found' });
        res.json({ message: 'Shape deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
