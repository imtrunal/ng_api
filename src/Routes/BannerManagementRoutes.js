const express = require('express');
const router = express.Router();
const { upload } = require('../utils/upload');
const { addBanner, getAllBanners, deleteBanner } = require('../controller/BannerManagementController');

//Add PDF
router.post('/add', upload, addBanner);
router.get('/list', getAllBanners);
router.delete('/delete/:id', deleteBanner);

module.exports = router;