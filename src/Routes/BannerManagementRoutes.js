const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const { addBanner, getAllBanners, deleteBanner } = require('../controller/BannerManagementController');
const { authorization } = require("../middleware/auth.middleware")

//Add New Banner
router.post('/', authorization, upload, addBanner);
//Get All Banners
router.get('/', getAllBanners);
//Delete Banner
router.delete('/:id', authorization, deleteBanner);

module.exports = router;