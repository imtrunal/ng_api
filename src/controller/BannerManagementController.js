const { status } = require("http-status");
const { errorResponse, successResponse } = require("../utils/apiResponse");
const bannerService = require("../Service/BannerService");
const { destroyFile } = require("../utils/upload");

const addBanner = async (req, res) => {
    try {
        const bannerFile = req.files?.banner?.[0];
        if (!bannerFile) {
            return errorResponse(req, res, status.BAD_REQUEST, "Banner file is required");
        }
        bannerFile.path = `${req.protocol}://${req.get("host")}/uploads/banners/${bannerFile.filename}`;
        const banner = await bannerService.add(bannerFile, req.body);

        return successResponse(req, res, status.CREATED, "Banner added successfully", banner);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

const getAllBanners = async (req, res) => {
    try {
        const banners = await bannerService.findAll();
        return successResponse(req, res, status.OK, "Banners fetched successfully", banners );
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

const deleteBanner = async (req, res) => {
    try {
        const deleted = await bannerService.deleteBanner(req.params.id);
        if (!deleted) {
            return errorResponse(req, res, status.NOT_FOUND, "Banner not found");
        }
        await destroyFile(deleted.banner);
        return successResponse(req, res, status.OK, "Banner deleted successfully");
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
};

module.exports = {
    addBanner,
    getAllBanners,
    deleteBanner
};
