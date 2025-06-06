const Banner = require("../Model/banner");

const add = async (bannerFile, bodyData) => {
    try {
        const banner = await Banner.create({
            banner: bannerFile.path,
            bannerName: bannerFile.originalname,
            startDate: bodyData.startDate,
            endDate: bodyData.endDate,
        });
        return banner;
    } catch (error) {
        throw new Error(error.message || "Failed to add banner");
    }
}

const findAll = async () => {
    try {
        const banners = await Banner.find().sort({ startDate: 1 });
        return banners;
    } catch (error) {
        throw new Error(error.message || "Failed to get Banners")
    }
}

const deleteBanner = async (id) => {
    try {
        return await Banner.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(error.message || "Failed to delete Banner");
    }
}

module.exports = {
    add,
    findAll,
    deleteBanner
}