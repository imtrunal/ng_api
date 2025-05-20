const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const { addProduct, getAllProduct, deleteProduct, getProductById, updateProduct } = require('../controller/ProductManagement');


router.post('/add', upload, addProduct);
router.get('/list', getAllProduct);
router.get("/:id", getProductById);
router.put("/update/:id", upload, updateProduct);
router.delete("/delete/:id", deleteProduct);

module.exports = router;