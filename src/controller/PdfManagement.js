const PdfFiles = require("../Model/pdfFiles");
const { errorResponse, successResponse } = require("../utils/apiResponse");
const { default: status } = require("http-status");
const pdfService = require("../Service/PdfService");

const getPDF = async (req, res) => {
    try {
        const pdfFile = await pdfService.getPdfUrl(req.params.shortUrl);
        if (!pdfFile) {
            return res.status(404).json({ error: 'File not found' });
        }
        return successResponse(req, res, status.OK, "PDF fetched successfully", { url: pdfFile.url });
    } catch (error) {
        console.error('Error fetching PDF:', error);
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
    getPDF,
}