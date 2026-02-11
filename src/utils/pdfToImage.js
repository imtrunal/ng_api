const { execFile } = require('child_process');
const path = require('path');

function pdfToImage(pdfPath, outDir, page, filename) {
  return new Promise((resolve, reject) => {
    const safeName = filename.replace(/[^a-z0-9]/gi, '_');
    const unique = Date.now() + '-' + Math.random().toString(36).slice(2);

    const outPrefix = path.join(outDir, `tmp-${safeName}-${unique}`);

    execFile(
      'pdftoppm',
      ['-jpeg', '-r', '80', '-f', page, '-l', page, pdfPath, outPrefix],
      (err) => {
        if (err) {
          console.error('pdftoppm error:', err);
          reject(err);
        } else resolve(outPrefix);
      },
    );
  });
}

module.exports = pdfToImage;
