const express = require('express');
const router = express.Router();
const { authorization } = require('../middleware/auth.middleware');
const { upload } = require('../utils/upload');
const { addPDF, getPDF, getAllPDF, deletePDF, updatePDF } = require('../controller/PdfManagement');
const { cloudinary } = require('../config/cloudinary');
const axios  = require('axios');
const { PDFDocument } = require('pdf-lib');
const { fromBuffer } = require('pdf2pic');
//Add PDF
router.post('/upload', upload, addPDF);
router.get('/get-url/:shortUrl', getPDF);
router.get('/list', getAllPDF);
router.delete('/delete/:id', deletePDF);
router.put('/update/:id', upload, updatePDF);



router.post('/extract-first-page', async (req, res) => {
    try {
        const pdfUrl = req.body.pdfUrl;
        // Download PDF
        const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
        const pdfBuffer = Buffer.from(response.data);

        // Extract first page
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const newPdf = await PDFDocument.create();
        const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
        newPdf.addPage(firstPage);
        const extractedPdf = await newPdf.save();

        // Convert to image
        const converter = fromBuffer(extractedPdf, { density: 300 });
        const image = await converter(1, { format: 'jpg' });

        res.json({ imageUrl: image.path });
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ error: 'Failed to process PDF' });
    }
});


module.exports = router;