const cloudinary = require('cloudinary').v2;
require("dotenv").config();
const { CONFIG } = require("../config/config");

cloudinary.config({
    cloud_name: CONFIG.cloudinary_db,
    api_key: CONFIG.cloudinary_key,
    api_secret: CONFIG.cloudinary_api_secret
});

module.exports = { cloudinary };
