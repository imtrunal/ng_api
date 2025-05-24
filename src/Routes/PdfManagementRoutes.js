const express = require('express');
const router = express.Router();
const { getPDF} = require('../controller/PdfManagement');

router.get('/get-url/:shortUrl', getPDF);

module.exports = router;