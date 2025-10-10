const express = require('express');
const app = express();
const path = require('path');
const { CONFIG } = require('./src/config/config');
const PORT = CONFIG.port || 9090;
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const { connectDb } = require('./src/config/db');
const fs = require("fs");
const axios = require("axios");
const { upload } = require('./src/utils/upload');
const { successResponse, errorResponse } = require('./src/utils/apiResponse');
const { default: status } = require('http-status');
const { incrementTotalCount } = require('./src/utils/updateStatistics');
const { convert } = require("pdf-poppler"); 

connectDb();
app.use(cors({
    origin: '*'
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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


const eklg17Mapping = JSON.parse(fs.readFileSync("eklg17-mapping.json", "utf8"));

// const convertToEKLG17 = (text) => {
//     let convertedText = "";

//     for (let char of text) {
//         convertedText += eklg17Mapping[char] || char; // Replace if found, else keep original
//     }

//     return convertedText;
// };

const vowelSigns = ['િ'];

const convertToEKLG17 = (text) => {
    let convertedText = "";
    let i = 0;
    let prevEklg = "";

    while (i < text.length) {
        let matchFound = false;

        for (let len = 3; len > 0; len--) {
            const substr = text.slice(i, i + len);

            if (substr === "્") {
                if (convertedText.length > 0) {
                    convertedText = convertedText.slice(0, -prevEklg.length);
                    prevEklg = "";
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
    let convertedText = "";
    let i = 0;

    // First, handle the special case of 'r' by swapping it with the next valid sequence
    let processedText = "";
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


app.get("/transliterate", async (req, res) => {
    try {
        const englishText = req.query.text;
        const response = await axios.get("https://inputtools.google.com/request", {
            params: {
                text: englishText,
                itc: "gu-t-i0-und",
                num: 1,
                cp: 0,
                cs: 1,
                ie: "utf-8",
                oe: "utf-8",
                app: "demopage"
            }
        });

        let translatedText = englishText;
        if (response.data[0] === "SUCCESS" && response.data[1]?.length > 0) {
            translatedText = response.data[1][0][1][0]; // First suggestion
        }
        return successResponse(req, res, status.OK, "Transalted text", translatedText);
    } catch (error) {
        console.error("Error:", error);
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message)
    }
});

// API endpoint
app.post("/eklg17-convert", async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided!" });

        const convertedText = convertToEKLG17(text);
        await incrementTotalCount('totalEKLGUse', 1);
        return successResponse(req, res, status.OK, "EKLG 17 converted text", convertedText);

    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
});

app.post("/unique-convert", async(req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "No text provided!" });

        const convertedText = convertToUnicode(text);
        await incrementTotalCount('totalEKLGUse', 1);
        return successResponse(req, res, status.OK, "Unique converted text", convertedText);
    } catch (error) {
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message); s
    }
});

app.post("/upload", upload, (req, res) => {
    try {
        const file = req.files.attachedFiles[0];
        return successResponse(req, res, status.OK, "File uploaded successfully", { url: file.path });
    } catch (error) {
        console.error("Error uploading file:", error);
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, "File upload failed");
    }
});


//Routes
app.use("/admin", require("./src/Routes/AdminrRoutes"));
app.use("/pdfs", require("./src/Routes/PdfManagementRoutes"));
app.use("/banners", require("./src/Routes/BannerManagementRoutes"));
app.use("/products", require("./src/Routes/ProductManagementRoutes"));
app.use("/category", require("./src/Routes/CategoryListRoutes"));
app.use("/clients", require("./src/Routes/ClientsManagementRoutes"));
app.use("/colors", require("./src/Routes/ColorRoutes"));
app.use("/shapes", require("./src/Routes/ShapeRoutes"));
app.use("/statistics", require("./src/Routes/StatisticsRoutes"));
app.use("/testimonials", require("./src/Routes/TestimonialRoutes"));



const pdfParse = require("pdf-parse");
const mime = require("mime-types");

app.use("/uploads", express.static(path.join(__dirname,"uploads")));

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

app.get("/files/pages/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const uploadsDir = path.join(__dirname, "uploads");

    const filePath = findFileRecursive(uploadsDir, filename);

    if (!filePath) {
      return res.status(404).json({ error: "File not found" });
    }

    if (path.extname(filename).toLowerCase() === ".pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const totalPages = pdfData.numpages;

      const pageLinks = [];
      for (let i = 1; i <= totalPages; i++) {
        pageLinks.push(`${req.protocol}://${req.get("host")}/files/p_${i}/${filename}`);
      }

      const response = { totalPages, pageLinks };
      return res.json(response);
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch file" });
  }
});

app.get("/files/p_:page/:filename", async (req, res) => {
  try {
    const { page, filename } = req.params;
    const uploadsDir = path.join(__dirname,"uploads");
    const pdfPath = findFileRecursive(uploadsDir, filename);

    if (!pdfPath) {
      return res.status(404).json({ error: "PDF not found" });
    }
    
    const outDir = path.join(__dirname, "uploads", "cache");
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

    const outPrefix = `pdf-${filename.replace(/\..+$/, "")}-${page}`;
    const opts = {
      format: "png",
      out_dir: outDir,
      out_prefix: outPrefix,
      page: parseInt(page),
      dpi: 50,
    };

    await convert(pdfPath, opts);

    const generatedFile = fs
      .readdirSync(outDir)
      .find(f => f.startsWith(outPrefix) && f.endsWith(".png"));

    if (!generatedFile) {
      throw new Error(`No PNG generated for ${filename} page ${page}`);
    }

    const outputFile = path.join(outDir, generatedFile);
    const imgBuffer = fs.readFileSync(outputFile);

    res.setHeader("Content-Type", "image/png");
    res.send(imgBuffer);

    fs.unlink(outputFile, () => {});
  } catch (error) {
    console.error("❌ PDF Page Render Error:", error);
    res.status(500).json({ error: "Failed to render PDF page" });
  }
});

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));