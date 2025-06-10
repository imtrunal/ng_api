const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const { addBanner, getAllBanners, deleteBanner } = require('../controller/BannerManagementController');
const { authorization } = require("../middleware/auth.middleware")

//Add PDF
router.post('/add', authorization, upload, addBanner);
router.get('/list', getAllBanners);
router.delete('/delete/:id', authorization, deleteBanner);

module.exports = router;