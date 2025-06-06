const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const {
    addNewClient,
    getAllClients,
    deleteClient
} = require("../controller/ClientManagementController")

router.post('/', upload, addNewClient);
router.get('/', getAllClients);
router.delete('/:id', deleteClient);

module.exports = router;
