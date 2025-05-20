require('dotenv').config();

exports.CONFIG = {
    port: process.env.PORT || 8080,
    dbUrl: process.env.DB_URL,
    jwtSecret: process.env.JWT_SECRET,
    jwtExp: process.env.JWT_EXP,
    cloudinary_db: process.env.CLOUDINARY_CLOUD_NAME,
    cloudinary_api_secret: process.env.CLOUDINARY_API_SECRET,
    cloudinary_key: process.env.CLOUDINARY_API_KEY,
};
