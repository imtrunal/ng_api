const express = require('express');
const router = express.Router();
const { getPDF } = require('../controller/PdfManagement');

router.get('/get-url/:shortUrl', getPDF);
router.post('/get-url', (req, res) => {
    const { pdfUrl } = req.body;

    const imageUrls = Array.from({ length: totalPages }, (_, i) => {
        const page = i + 1;
        const transformation = `f_webp,fl_awebp,q_auto/pg_${page}`;
        return pdfUrl.replace('/upload/', `/upload/${transformation}/`);
    });
    res.status(400).json({ message: "Short URL is required" });
});


module.exports = router;