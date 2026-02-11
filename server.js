// require("./src/utils/preload")
const express = require('express');
const app = express();
const path = require('path');
const { CONFIG } = require('./src/config/config');
const PORT = CONFIG.port || 9090;
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const { connectDb } = require('./src/config/db');
const fs = require('fs');
const axios = require('axios');
const { upload } = require('./src/utils/upload');
const { successResponse, errorResponse } = require('./src/utils/apiResponse');
const { default: status } = require('http-status');
const { incrementTotalCount } = require('./src/utils/updateStatistics');
// const { convert } = require('pdf-poppler');
const pdfParse = require('pdf-parse');
const pdfToImage = require('./src/utils/pdfToImage.js');

// const { fromPath } = require('pdf2pic');

connectDb();
app.use(
  cors({
    origin: '*',
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
setInterval(
  () => {
    const cacheDir = path.join(__dirname, 'uploads', 'cache');

    if (!fs.existsSync(cacheDir)) return;

    const now = Date.now();

    fs.readdir(cacheDir, (err, files) => {
      if (err) return;

      files.forEach((file) => {
        const filePath = path.join(cacheDir, file);

        fs.stat(filePath, (err, stat) => {
          if (err) return;

          if (now - stat.mtimeMs > 30 * 60 * 1000) {
            fs.unlink(filePath, () => {});
          }
        });
      });
    });
  },
  30 * 60 * 1000,
);

app.get('/', (req, res) => {
  res.send('Admin Panel Backend');
});

// const mappingFile = path.join(__dirname, "eklg17-mapping.json");
// const eklg17Mapping = JSON.parse(fs.readFileSync(mappingFile, "utf8"));

// // Function to convert Unicode to EKLG 17
// const convertToEKLG17 = (text) => {
//     let convertedText = "";
//     for (let char of text) {
//         convertedText += eklg17Mapping[char] || char; // Replace if mapping exists, else keep original
//     }
//     return convertedText;
// };

// // API route to handle conversion
// app.post("/eklg17-convert", (req, res) => {
//     try {
//         const { text } = req.body;
//         if (!text) {
//             return res.status(400).json({ error: "No text provided" });
//         }

//         const convertedText = convertToEKLG17(text);
//         res.json({ convertedText });
//     } catch (error) {
//         console.error("Conversion Error:", error);
//         res.status(500).json({ error: "Conversion failed" });
//     }
// });

const eklg17Mapping = JSON.parse(
  fs.readFileSync('eklg17-mapping.json', 'utf8'),
);

// const convertToEKLG17 = (text) => {
//     let convertedText = "";

//     for (let char of text) {
//         convertedText += eklg17Mapping[char] || char; // Replace if found, else keep original
//     }

//     return convertedText;
// };

const vowelSigns = ['િ'];

const convertToEKLG17 = (text) => {
  let convertedText = '';
  let i = 0;
  let prevEklg = '';

  while (i < text.length) {
    let matchFound = false;

    for (let len = 3; len > 0; len--) {
      const substr = text.slice(i, i + len);

      if (substr === '્') {
        if (convertedText.length > 0) {
          convertedText = convertedText.slice(0, -prevEklg.length);
          prevEklg = '';
        }
        i += 1;
        matchFound = true;
        break;
      }

      if (eklg17Mapping[substr]) {
        const currentEklg = eklg17Mapping[substr];

        if (vowelSigns.includes(substr) && prevEklg) {
          convertedText = convertedText.slice(0, -prevEklg.length);
          convertedText += currentEklg + prevEklg;
          prevEklg = currentEklg;
        } else {
          convertedText += currentEklg;
          prevEklg = currentEklg;
        }

        i += len;
        matchFound = true;
        break;
      }
    }

    // No mapping match
    if (!matchFound) {
      const char = text[i];
      const currentEklg = eklg17Mapping[char] || char;

      if (vowelSigns.includes(char) && prevEklg) {
        convertedText = convertedText.slice(0, -prevEklg.length);
        convertedText += currentEklg + prevEklg;
        prevEklg = currentEklg;
      } else {
        convertedText += currentEklg;
        prevEklg = currentEklg;
      }

      i += 1;
    }
  }

  return convertedText;
};

const reversedMapping = {};
for (const [key, value] of Object.entries(eklg17Mapping)) {
  reversedMapping[value] = key;
}

const convertToUnicode = (eklg17Text) => {
  let convertedText = '';
  let i = 0;

  // First, handle the special case of 'r' by swapping it with the next valid sequence
  let processedText = '';
  for (let j = 0; j < eklg17Text.length; j++) {
    if (eklg17Text[j] === 'r' && j + 1 < eklg17Text.length) {
      // Check for possible 2 or 3 character sequences after 'r'
      let found = false;
      for (let len = 2; len >= 1; len--) {
        if (j + 1 + len > eklg17Text.length) continue;
        const nextSeq = eklg17Text.slice(j + 1, j + 1 + len);
        if (reversedMapping[nextSeq]) {
          // Swap 'r' with the found sequence
          processedText += nextSeq + 'r';
          j += len; // Skip the sequence we just processed
          found = true;
          break;
        }
      }
      if (!found) {
        processedText += 'r';
      }
    } else {
      processedText += eklg17Text[j];
    }
  }

  // Now convert the processed text normally
  i = 0;
  while (i < processedText.length) {
    let matchFound = false;

    // Check for longest possible match first (3 chars)
    for (let len = 3; len > 0; len--) {
      if (i + len > processedText.length) continue;

      const substr = processedText.slice(i, i + len);

      // Check if the current substring exists in reversedMapping
      if (reversedMapping[substr]) {
        convertedText += reversedMapping[substr];
        i += len;
        matchFound = true;
        break;
      }
    }

    // If no match was found, just append the character as is
    if (!matchFound) {
      convertedText += processedText[i];
      i++;
    }
  }

  return convertedText;
};

app.get('/transliterate', async (req, res) => {
  try {
    const englishText = req.query.text;
    const response = await axios.get('https://inputtools.google.com/request', {
      params: {
        text: englishText,
        itc: 'gu-t-i0-und',
        num: 1,
        cp: 0,
        cs: 1,
        ie: 'utf-8',
        oe: 'utf-8',
        app: 'demopage',
      },
    });

    let translatedText = englishText;
    if (response.data[0] === 'SUCCESS' && response.data[1]?.length > 0) {
      translatedText = response.data[1][0][1][0]; // First suggestion
    }
    return successResponse(
      req,
      res,
      status.OK,
      'Translated text',
      translatedText,
    );
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
  }
});

// API endpoint
app.post('/eklg17-convert', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided!' });

    const convertedText = convertToEKLG17(text);
    await incrementTotalCount('totalEKLGUse', 1);
    return successResponse(
      req,
      res,
      status.OK,
      'EKLG 17 converted text',
      convertedText,
    );
  } catch (error) {
    return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
  }
});

app.post('/unique-convert', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'No text provided!' });

    const convertedText = convertToUnicode(text);
    await incrementTotalCount('totalEKLGUse', 1);
    return successResponse(
      req,
      res,
      status.OK,
      'Unique converted text',
      convertedText,
    );
  } catch (error) {
    return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    s;
  }
});

app.post('/upload', upload, (req, res) => {
  try {
    const file = req.files.attachedFiles[0];
    return successResponse(req, res, status.OK, 'File uploaded successfully', {
      url: file.path,
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    return errorResponse(
      req,
      res,
      status.INTERNAL_SERVER_ERROR,
      'File upload failed',
    );
  }
});

//Routes
app.use('/admin', require('./src/Routes/AdminRoutes.js'));
app.use('/pdfs', require('./src/Routes/PdfManagementRoutes'));
app.use('/banners', require('./src/Routes/BannerManagementRoutes'));
app.use('/products', require('./src/Routes/ProductManagementRoutes'));
app.use('/category', require('./src/Routes/CategoryListRoutes'));
app.use('/clients', require('./src/Routes/ClientsManagementRoutes'));
app.use('/colors', require('./src/Routes/ColorRoutes'));
app.use('/shapes', require('./src/Routes/ShapeRoutes'));
app.use('/statistics', require('./src/Routes/StatisticsRoutes'));
app.use('/testimonials', require('./src/Routes/TestimonialRoutes'));

// app.get("/uploads/products/videos/:filename", async (req, res) => {
//   try {
//     const { filename } = req.params;
//     const uploadsDir = path.join(__dirname, "uploads");

//     const filePath = findFileRecursive(uploadsDir, filename);
//     if (!filePath) {
//       return res.status(404).json({ error: "File not found" });
//     }

//     res.setHeader("Content-Type", "video/mp4");
//     res.setHeader("Content-Disposition", "inline; filename=\"video.mp4\"");
//     z
//     const stream = fs.createReadStream(filePath);
//     stream.pipe(res);

//   } catch (error) {
//     res.status(500).json({ error: "Failed to open file" });
//   }
// });

app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'), {
    // filter: (req, res) => {
    //   return !req.path.includes('/products/videos/');
    // }
  }),
);

function findFileRecursive(baseDir, filename) {
  const files = fs.readdirSync(baseDir);
  for (let file of files) {
    const fullPath = path.join(baseDir, file);
    const stats = fs.statSync(fullPath);
    if (stats.isDirectory()) {
      const found = findFileRecursive(fullPath, filename);
      if (found) return found;
    } else if (file === filename) {
      return fullPath;
    }
  }
  return null;
}

app.get('/files/pages/:filename', async (req, res) => {
  try {
    const { filename } = req.params;
    const uploadsDir = path.join(__dirname, 'uploads');

    const filePath = findFileRecursive(uploadsDir, filename);

    if (!filePath) {
      return res.status(404).json({ error: 'File not found' });
    }

    if (path.extname(filename).toLowerCase() === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const totalPages = pdfData.numpages;

      const pageLinks = [];
      for (let i = 1; i <= totalPages; i++) {
        pageLinks.push(
          // `${req.protocol}://${req.get('host')}/files/p_${i}/${filename}`,
          `/files/p_${i}/${filename}`,
        );
      }

      const response = { totalPages, pageLinks };
      return res.json(response);
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch file' });
  }
});

// app.get("/files/p_:page/:filename", async (req, res) => {
//   try {
//     const { page, filename } = req.params;
//     const uploadsDir = path.join(__dirname,"uploads");
//     const pdfPath = findFileRecursive(uploadsDir, filename);

//     if (!pdfPath) {
//       return res.status(404).json({ error: "PDF not found" });
//     }

//     const outDir = path.join(__dirname, "uploads", "cache");
//     if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

//     const outPrefix = `pdf-${filename.replace(/\..+$/, "")}-${page}`;
//     const opts = {
//       format: "png",
//       out_dir: outDir,
//       out_prefix: outPrefix,
//       page: parseInt(page),
//       dpi: 40,
//     };

//     await convert(pdfPath, opts);

//     const generatedFile = fs
//       .readdirSync(outDir)
//       .find(f => f.startsWith(outPrefix) && f.endsWith(".png"));

//     if (!generatedFile) {
//       throw new Error(`No PNG generated for ${filename} page ${page}`);
//     }

//     const outputFile = path.join(outDir, generatedFile);
//     const imgBuffer = fs.readFileSync(outputFile);

//     res.setHeader("Content-Type", "image/png");
//     res.send(imgBuffer);

//     fs.unlink(outputFile, () => {});
//   } catch (error) {
//     console.error("❌ PDF Page Render Error:", error);
//     res.status(500).json({ error: "Failed to render PDF page" });
//   }
// });

// app.get("/files/p_:page/:filename", async (req, res) => {
//   try {
//     const { page, filename } = req.params;
//     const uploadsDir = path.join(__dirname, "uploads");

//     const pdfPath = findFileRecursive(uploadsDir, filename);

//     if (!pdfPath) {
//       return res.status(404).json({ error: "PDF not found" });
//     }

//     const outDir = path.join(__dirname, "uploads", "cache");
//     if (!fs.existsSync(outDir)) {
//       fs.mkdirSync(outDir, { recursive: true });
//     }

//     const baseName = filename.replace(/\..+$/, "");
//     const outPrefix = `pdf-${baseName}-${page}-${Date.now()}`;

//     const opts = {
//       format: "png",
//       out_dir: outDir,
//       out_prefix: outPrefix,
//       page: parseInt(page),
//       dpi: 40,
//     };

//     await convert(pdfPath, opts);

//     // Find generated file
//     const generated = fs.readdirSync(outDir).find(
//       f => f.startsWith(outPrefix) && f.endsWith(".png")
//     );

//     if (!generated) {
//       throw new Error("PNG not generated");
//     }

//     const outputFile = path.join(outDir, generated);

//     res.setHeader("Content-Type", "image/png");

//     const stream = fs.createReadStream(outputFile);

//     stream.pipe(res);

//     // ✅ Delete AFTER response ends
//     res.on("finish", () => {
//       fs.unlink(outputFile, err => {
//         if (err) console.error("Cache delete error:", err);
//       });
//     });

//     // Safety: client disconnect
//     req.on("close", () => {
//       stream.destroy();

//       fs.unlink(outputFile, () => {});
//     });

//     stream.on("error", (err) => {
//       if (err.code !== "EPIPE") {
//         console.error("Stream error:", err);
//       }
//     });

//   } catch (error) {
//     if (error.code !== "EPIPE") {
//       console.error("❌ PDF Page Render Error:", error);
//     }

//     if (!res.headersSent) {
//       res.status(500).json({ error: "Failed to render PDF page" });
//     }
//   }
// });

// Limit PDF jobs

const MAX_PDF_JOBS = 3;
let runningJobs = 0;
const jobQueue = [];

async function runPdfJob(fn) {
  if (runningJobs >= MAX_PDF_JOBS) {
    await new Promise((resolve) => jobQueue.push(resolve));
  }

  runningJobs++;

  try {
    return await fn();
  } finally {
    runningJobs--;

    if (jobQueue.length) {
      jobQueue.shift()();
    }
  }
}

app.get('/files/p_:page/:filename', async (req, res) => {
  let imgPath = null;
  let stream = null;

  try {
    const { page, filename } = req.params;

    const uploadsDir = path.join(__dirname, 'uploads');
    const pdfPath = findFileRecursive(uploadsDir, filename);

    if (!pdfPath) {
      return res.status(404).json({ error: 'PDF not found' });
    }

    const outDir = path.join(__dirname, 'uploads', 'cache');

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const outPrefix = await runPdfJob(() =>
      pdfToImage(pdfPath, outDir, Number(page), filename),
    );

    imgPath = `${outPrefix}-${page}.jpg`;

    const waitForFile = async () => {
      for (let i = 0; i < 20; i++) {
        if (fs.existsSync(imgPath)) return;
        await new Promise((r) => setTimeout(r, 100));
      }
      throw new Error('Image not created');
    };

    await waitForFile();

    res.setHeader('Content-Type', 'image/jpeg');

    stream = fs.createReadStream(imgPath);
    stream.pipe(res);

    // Delete after send
    stream.on('close', () => {
      if (imgPath) fs.unlink(imgPath, () => {});
    });

    req.on('close', () => {
      if (stream) stream.destroy();
      if (imgPath) fs.unlink(imgPath, () => {});
    });
  } catch (err) {
    console.error('❌ PDF Render Error:', err);

    if (imgPath) fs.unlink(imgPath, () => {});

    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed' });
    }
  }
});

// app.get("/files/p_:page/:filename", async (req, res) => {
//   let filePath = null;

//   try {
//     const { page, filename } = req.params;
//     const uploadsDir = path.join(__dirname, "uploads");

//     const pdfPath = findFileRecursive(uploadsDir, filename);

//     if (!pdfPath) {
//       return res.status(404).json({ error: "PDF not found" });
//     }

//     const outDir = path.join(__dirname, "uploads", "cache");
//     if (!fs.existsSync(outDir)) {
//       fs.mkdirSync(outDir, { recursive: true });
//     }

//     const outputName = `page-${filename}-${page}.png`;
//     filePath = path.join(outDir, outputName);

//     // ✅ Serve from cache if exists
//     if (fs.existsSync(filePath)) {
//       return res.sendFile(filePath);
//     }

//     const options = {
//       density: 120,
//       saveFilename: `page-${filename}-${page}`,
//       savePath: outDir,
//       format: "png",
//       width: 1200,
//       height: 1600,
//     };

//     const storeAsImage = fromPath(pdfPath, options);

//     const result = await storeAsImage(page);

//     filePath = result.path;

//     // ✅ Stop if client disconnected
//     if (res.headersSent || req.aborted) {
//       return;
//     }

//     res.setHeader("Content-Type", "image/png");

//     const stream = fs.createReadStream(filePath);

//     stream.pipe(res);

//     // ✅ Handle broken pipe
//     stream.on("error", (err) => {
//       if (err.code !== "EPIPE") {
//         console.error("Stream error:", err);
//       }
//     });

//     req.on("close", () => {
//       stream.destroy();
//     });

//   } catch (error) {
//     if (error.code !== "EPIPE") {
//       console.error("PDF Render Error:", error);
//     }

//     if (!res.headersSent) {
//       res.status(500).json({ error: "Failed to render PDF page" });
//     }
//   }
// });

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
