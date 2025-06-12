const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const { addProduct, getAllProduct, deleteProduct, getProductById, updateProduct } = require('../controller/ProductManagementController');
const {authorization}=require("../middleware/auth.middleware")

//Add Product
router.post('/',authorization, upload, addProduct);
//Get All Products
router.get('/', getAllProduct);
//Get Product by Id
router.get("/:id", getProductById);
//Update Product
router.put("/:id", authorization,upload, updateProduct);
//Delete Product
router.delete("/:id",authorization, deleteProduct);

module.exports = router;