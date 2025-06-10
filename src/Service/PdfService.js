const PdfFiles = require("../Model/pdfFiles");

const getPdfUrl = async (shortUrl) => {
    try {
        return await PdfFiles.findOne({ short: shortUrl });
    } catch (error) {
        throw new Error(error.message||"Failed to get pdf url");
    }
}

module.exports={
    getPdfUrl
}