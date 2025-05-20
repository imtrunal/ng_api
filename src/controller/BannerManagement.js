const Banner = require("../Model/banner");
const { status } = require("http-status");
const { errorResponse, successResponse } = require("../utils/apiResponse");

const addBanner = async (req, res) => {
    try {
        const bannerFile = req.files?.banner?.[0];

        console.log(bannerFile);

        const banner = await Banner.create({
            banner: bannerFile.path,
            bannerName: bannerFile.originalname,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
        });
        return res.status(200).send({
            success: true,
            message: "Banner added successfully",
            data: banner
        })
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: error.message,
        })
    }
}

const getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ startDate: 1 });
        return res.status(200).send({
            success: true,
            message: "Banners fetched successfully",
            data: banners
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: error.message,
        });
    }
}

const deleteBanner = async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        return successResponse(req, res, status.OK, "Banner deleted successfully");
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
    addBanner,
    getAllBanners,
    deleteBanner
}