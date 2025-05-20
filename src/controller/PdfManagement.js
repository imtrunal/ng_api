const PdfFiles = require("../Model/pdfFiles");
const { getCloudinaryPublicId, destroyImage } = require("../utils/upload");


const getPDF = async (req, res) => {
    try {
        const pdfFile = await PdfFiles.findOne({ short: req.params.shortUrl });
        if (!pdfFile) {
            return res.status(404).json({ error: 'File not found' });
        }
        return res.json({ success: true, url: pdfFile.url, message: "PDF fetched successfully" });
    } catch (error) {
        console.error('Error fetching PDF:', error);
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
}


module.exports = {
    getPDF,
}