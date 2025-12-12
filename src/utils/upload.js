// const multer = require("multer");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");
// const { cloudinary } = require("../config/cloudinary");
// require("dotenv").config();

// const folderConfigs = {
//     'productImage': {
//         folder: 'products/images',
//         resource_type: 'image',
//         allowed_formats: ['jpg', 'jpeg', 'png', 'webp','gif']
//     },
//     'productPdf': {
//         folder: 'products/pdfs',
//         resource_type: 'auto',
//         allowed_formats: ['pdf'],
//         format: 'pdf'
//     },
//     'productVideo': {
//         folder: 'products/videos',
//         resource_type: 'video',
//         allowed_formats: ['mp4', 'mov', 'avi', 'webm']
//     },
//     'clientLogo': {
//         folder: 'clients',
//         resource_type: 'image',
//         allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
//     },
//     'banner': {
//         folder: 'banners',
//         resource_type: 'image',
//         allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
//     }
// };

// const storage = new CloudinaryStorage({
//     cloudinary,
//     params: (req, file) => {
//         const config = {
//             public_id: file.originalname.replace(/\.[^/.]+$/, ""),
//             ...(folderConfigs[file.fieldname] || {
//                 folder: 'attachedFiles',
//                 resource_type: 'auto'
//             })
//         };

//         return config;
//     }
// });


// const getCloudinaryPublicId = (imageUrl) => {
//     const encodedId = imageUrl.split("/upload/")[1]
//         .replace(/v\d+\//, "")
//         .replace(/\.[^/.]+$/, "");

//     return decodeURIComponent(encodedId);
// };

// const getPdfPages = async (publicId) => {
//     try {
//         const result = await cloudinary.api.resource(publicId, {
//             resource_type: 'image',
//         });
//         console.log(`PDF resource fetched: ${publicId}`, result);

//         return result.pages;
//     } catch (error) {        
//         return 1;
//     }
// }


// const destroyFile = async (publicId, resource_type = 'image') => {
//     console.log(resource_type);

//     try {
//         const result = await cloudinary.uploader.destroy(publicId, {
//             resource_type: resource_type
//         });

//         if (result.result !== "ok") {
//             console.error(`Failed to delete image: ${publicId}`);
//             return false;
//         }
//         return true;
//     } catch (error) {
//         console.error("Error deleting Cloudinary image:", error);
//         return false;
//     }
// };

// const upload = multer({ storage }).fields([
//     { name: 'productImage', maxCount: 20 },
//     { name: 'productPdf' },
//     { name: 'productVideo' },
//     { name: 'clientLogo', maxCount: 50 },
//     { name: 'pdf', maxCount: 1 },
//     { name: 'banner', maxCount: 1 },
//     { name: 'attachedFiles', maxCount: 1 },
// ]);

// module.exports = { upload, getCloudinaryPublicId, destroyFile, getPdfPages };


const multer = require("multer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const folderConfigs = {
  'productImage': { folder: 'products/images', resource_type: 'image', allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'] },
  'productPdf': { folder: 'products/pdfs', resource_type: 'auto', allowed_formats: ['pdf'], format: 'pdf' },
  'productVideo': { folder: 'products/videos', resource_type: 'video', allowed_formats: ['mp4', 'mov', 'avi', 'webm'] },
  'clientLogo': { folder: 'clients', resource_type: 'image', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] },
  'banner': { folder: 'banners', resource_type: 'image', allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] }
};

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

const ensureDirExists = dir => { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); };

function cleanFileName(originalName) {
  const ext = path.extname(originalName);
  const base = path.basename(originalName, ext);

  const cleanedBase = base.replace(/[^a-zA-Z0-9]/g, "");

  const finalBase = cleanedBase || `file${Date.now()}`;

  return `${finalBase}${ext.toLowerCase()}`;
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const config = folderConfigs[file.fieldname] || { folder: "attachedFiles" };
    const dir = path.join(UPLOAD_DIR, config.folder);
    ensureDirExists(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const cleaned = cleanFileName(file.originalname);
    cb(null, cleaned);
  },
});

const upload = multer({ storage }).fields([
  { name: 'productImage', maxCount: 20 },
  { name: 'productPdf' },
  { name: 'productVideo' },
  { name: 'clientLogo', maxCount: 50 },
  { name: 'pdf', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'attachedFiles', maxCount: 1 },
]);

const getFileId = (filePath) => {
  const cleaned = filePath
    .replace(/^https?:\/\/[^/]+\/uploads\//, "")
    .replace(/^\/?uploads\//, "");
  return `/${cleaned}`;
};

const destroyFile = async (filePath) => {
  try {
    filePath = getFileId(filePath);
    const relative = filePath.startsWith("/") ? filePath.slice(1) : filePath;
    const absolutePath = path.join(UPLOAD_DIR, relative);

    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      return true;
    } else {
      console.warn(`⚠️ File not found: ${absolutePath} — skipping...`);
      return true; // ✅ Continue execution even if file not found
    }
  } catch (err) {
    console.error("Error deleting file:", err);
    return true; // ✅ Still return true so next code continues
  }
};

module.exports = { upload, getFileId, destroyFile };
