const express = require('express');
const router = express.Router();
const Color = require('../model/color');

// Create a new color
router.post('/', async (req, res) => {
    try {
        const color = new Color(req.body);
        await color.save();
        res.status(201).json(color);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all colors
router.get('/', async (req, res) => {
    try {
        const colors = await Color.find();
        res.json(colors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single color by ID
router.get('/:id', async (req, res) => {
    try {
        const color = await Color.findById(req.params.id);
        if (!color) return res.status(404).json({ message: 'Color not found' });
        res.json(color);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a color
router.put('/:id', async (req, res) => {
    try {
        const color = await Color.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!color) return res.status(404).json({ message: 'Color not found' });
        res.json(color);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a color
router.delete('/:id', async (req, res) => {
    try {
        const color = await Color.findByIdAndDelete(req.params.id);
        if (!color) return res.status(404).json({ message: 'Color not found' });
        res.json({ message: 'Color deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
