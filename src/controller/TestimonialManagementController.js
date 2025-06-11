const { default: status } = require("http-status");
const testimonialService = require("../Service/testimonialService");
const { errorResponse, successResponse } = require("../utils/apiResponse");

const addTestimonial = async (req, res) => {
    try {
        const testimonial = await testimonialService.addReview(req.body);
        return successResponse(req, res, status.CREATED, "New Testimonial Added successfully", testimonial);
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
}

const getTestimonials = async (req, res) => {
    try {
        const testimonial = await testimonialService.getALlReview();
        return successResponse(req, res, status.OK, "Testimonials Fetched successfully", testimonial);
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
}

const deleteTestimonial = async (req, res) => {
    try {
        const testimonial = await testimonialService.deleteReview(req.params.id);
        return successResponse(req, res, status.OK, "Testimonial deleted successfully", testimonial);
    } catch (error) {
        console.log(error);
        return errorResponse(req, res, status.INTERNAL_SERVER_ERROR, error.message);
    }
}

module.exports = {
    addTestimonial,
    getTestimonials,
    deleteTestimonial
}