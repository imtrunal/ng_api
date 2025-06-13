const { default: axios } = require('axios');
const pdf = require('pdf-parse');

async function getPdfPageCountFromUrl(pdfUrl) {
    try {
        const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
        const data = await pdf(response.data);
        return data.numpages;
    } catch (error) {
        console.error('Error reading PDF:', error.message);
        return 1; // default to 1 if error occurs
    }
}

module.exports = getPdfPageCountFromUrl;