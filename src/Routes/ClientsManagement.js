const express = require('express');
const router = express.Router();
const Client = require("../Model/clients");
const { upload } = require('../utils/upload');

router.post('/', upload, async (req, res) => {
    try {
        const logos = req.files?.clientLogo;

        if (!logos || logos.length === 0) {
            return res.status(400).json({ error: "At least one client logo is required" });
        }

        const createdClients = await Promise.all(
            logos.map(file => {
                const client = new Client({ link: file.path });
                return client.save();
            })
        );

        res.status(201).json(createdClients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const clients = await Client.find();
        res.json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.delete('/:id', async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) return res.status(404).json({ message: 'Client not found' });
        res.json({ message: 'Client deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
