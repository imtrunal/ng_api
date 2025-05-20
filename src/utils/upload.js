const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary");
require("dotenv").config();

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        let config = {
            public_id: file.originalname.replace(/\.[^/.]+$/, ""),
        };
        console.log("file.fieldname", file.fieldname);

        switch (file.fieldname) {
            case 'productImage':
                config.folder = 'products';
                config.resource_type = 'image';
                config.allowed_formats = ['jpg', 'jpeg', 'png', 'webp'];
                config.format = "raw"
                break;

            case 'productPdf':
                config.folder = 'products';
                config.resource_type = 'raw';
                config.allowed_formats = ['pdf'];
                config.format = 'pdf';
                break;

            case 'banner':
                config.folder = 'banners';
                config.resource_type = 'image';
                config.allowed_formats = ['jpg', 'jpeg', 'png', 'webp'];
                break;

            default:
                config.folder = 'misc';
                config.resource_type = 'auto';
        }

        return config;
    },
});


const getCloudinaryPublicId = (imageUrl) => {
    const encodedId = imageUrl.split("/upload/")[1]
        .replace(/v\d+\//, "")
        .replace(/\.[^/.]+$/, "");

    return decodeURIComponent(encodedId);
};


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
    { name: 'productImage'},
    { name: 'productPdf' },
    { name: 'pdf', maxCount: 1 },
    { name: 'banner', maxCount: 1 }
]);

module.exports = { upload, getCloudinaryPublicId, destroyImage };
