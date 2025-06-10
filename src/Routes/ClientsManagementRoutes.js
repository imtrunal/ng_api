const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const {
    addNewClient,
    getAllClients,
    deleteClient
} = require("../controller/ClientManagementController")
const { authorization } = require("../middleware/auth.middleware");

router.post('/', authorization, upload, addNewClient);
router.get('/', getAllClients);
router.delete('/:id', authorization, deleteClient);

module.exports = router;
