const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const {
    addNewClient,
    getAllClients,
    deleteClient
} = require("../controller/ClientManagementController")
const { authorization } = require("../middleware/auth.middleware");

//Add new client
router.post('/', authorization, upload, addNewClient);
//Get all clients
router.get('/', getAllClients);
//Delete client
router.delete('/:id', authorization, deleteClient);

module.exports = router;
