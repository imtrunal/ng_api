const express = require("express");
const router = express.Router();
const Statistics = require("../Model/statistics");
const { default: status } = require("http-status");
const { authorization } = require("../middleware/auth.middleware");
const { successResponse, errorResponse } = require("../utils/apiResponse");

router.get('/', authorization, async (req, res) => {
    try {
        const statistics = await Statistics.findOne();
        return successResponse(req, res, status.OK, "Statistics fetched successfully", statistics);
    } catch (error) {
        console.error(error);
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
});

module.exports = router;