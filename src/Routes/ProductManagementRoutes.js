const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const { addProduct, getAllProduct, deleteProduct, getProductById, updateProduct } = require('../controller/ProductManagementController');
const {authorization}=require("../middleware/auth.middleware")

router.post('/add',authorization, upload, addProduct);
router.get('/list', getAllProduct);
router.get("/:id", getProductById);
router.put("/update/:id", authorization,upload, updateProduct);
router.delete("/delete/:id",authorization, deleteProduct);

module.exports = router;