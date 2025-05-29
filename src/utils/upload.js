const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary");
require("dotenv").config();

const folderConfigs = {
    'productImage': {
        folder: 'products/images',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    },
    'productPdf': {
        folder: 'products/pdfs',
        resource_type: 'auto',
        allowed_formats: ['pdf'],
        format: 'pdf'
    },
    'productVideo': {
        folder: 'products/videos',
        resource_type: 'video',
        allowed_formats: ['mp4', 'mov', 'avi', 'webm']
    },
    'clientLogo': {
        folder: 'clients',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    },
    'banner': {
        folder: 'banners',
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp']
    }
};

const storage = new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
        const config = {
            public_id: file.originalname.replace(/\.[^/.]+$/, ""),
            ...(folderConfigs[file.fieldname] || {
                folder: 'attachedFiles',
                resource_type: 'auto'
            })
        };

        return config;
    }
});


const getCloudinaryPublicId = (imageUrl) => {
    const encodedId = imageUrl.split("/upload/")[1]
        .replace(/v\d+\//, "")
        .replace(/\.[^/.]+$/, "");

    return decodeURIComponent(encodedId);
};

const getPdfPages = async (publicId) => {
    try {
        const result = await cloudinary.api.resource(publicId, {
            resource_type: 'image',
        });
        console.log(`PDF resource fetched: ${publicId}`, result);
        
        return result.pages;
    } catch (error) {        
        return 1;
    }
}


const destroyImage = async (publicId, resource_type = 'image') => {
    console.log(resource_type);

    try {
        const result = await cloudinary.uploader.destroy(publicId, {
            resource_type: resource_type
        });

        if (result.result !== "ok") {
            console.error(`Failed to delete image: ${publicId}`);
            return false;
        }
        return true;
    } catch (error) {
        console.error("Error deleting Cloudinary image:", error);
        return false;
    }
};

const upload = multer({ storage }).fields([
    { name: 'productImage', maxCount: 20 },
    { name: 'productPdf' },
    { name: 'productVideo' },
    { name: 'clientLogo', maxCount: 50 },
    { name: 'pdf', maxCount: 1 },
    { name: 'banner', maxCount: 1 },
    { name: 'attachedFiles', maxCount: 1 },
]);

module.exports = { upload, getCloudinaryPublicId, destroyImage, getPdfPages };
