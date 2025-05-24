const mongoose = require("mongoose");
const shortId = require('shortid');

const pdfFiles = new mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    short: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // expires: 86400,
    },
});

const PdfFiles = mongoose.model("PDFfiles", pdfFiles);

module.exports = PdfFiles;