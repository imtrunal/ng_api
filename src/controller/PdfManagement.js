const PdfFiles = require("../Model/pdfFiles");
const { getCloudinaryPublicId, destroyImage } = require("../utils/upload");

const addPDF = async (req, res) => {
    try {
        const uploadedPdf = req.files?.productPdf?.[0]; // Access the 'pdf' field array

        if (!uploadedPdf) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const pdfFile = await PdfFiles.create({
            url: uploadedPdf.path,
            description: req.body.description,
        });

        return res.json({
            success: true,
            data: pdfFile,
            message: "PDF Added Successfully",
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Failed to upload PDF' });
    }
};


const getPDF = async (req, res) => {
    try {
        const pdfFile = await PdfFiles.findOne({ short: req.params.shortUrl });
        if (!pdfFile) {
            return res.status(404).json({ error: 'File not found' });
        }
        return res.json({ success: true, url: pdfFile.file, message: "PDF fetched successfully" });
    } catch (error) {
        console.error('Error fetching PDF:', error);
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
}

const getAllPDF = async (req, res) => {
    try {
        const pdfFiles = await PdfFiles.find().sort({ createdAt: -1 });
        return res.json({ success: true, data: pdfFiles, message: "All PDFs fetched successfully" });

    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
}

const deletePDF = async (req, res) => {
    try {
        const pdfFile = await PdfFiles.findByIdAndDelete(req.params.id);
        if (!pdfFile) {
            return res.status(404).json({ error: 'File not found' });
        }
        const publicID = await getCloudinaryPublicId(pdfFile.file);
        if (publicID) await destroyImage(publicID, 'raw');
        return res.json({ success: true, message: 'File deleted successfully' });
    } catch (error) {
        console.error('Error deleting PDF:', error);
        return res.status(500).send({
            success: false,
            message: error.message,
        })
    }
}

const updatePDF = async (req, res) => {
    try {
        const pdfFile = await PdfFiles.findByIdAndUpdate(
            req.params.id,
            {
                ...(req.file && { file: req.file.path }),
                description: req.body.description
            },
            { new: true }
        );

        if (!pdfFile) {
            return res.status(404).json({ error: 'File not found' });
        }

        return res.json({ success: true, data: pdfFile, message: "File updated successfully" });

    } catch (error) {
        console.error('Error updating PDF:', error);
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
}

module.exports = {
    addPDF,
    getPDF,
    getAllPDF,
    deletePDF,
    updatePDF
}