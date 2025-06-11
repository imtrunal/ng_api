const Testimonial = require("../Model/testimonial");

const addReview = async (data) => {
    try {
        const reviewData = new Testimonial(data);
        await reviewData.save();
        return reviewData;
    } catch (error) {
        throw new Error(error || "Failed to add new review")
    }
}

const getALlReview = async () => {
    try {
        return await Testimonial.find().sort({createdAt:-1}).lean();
    } catch (error) {
        throw new Error(error || "Failed to add new review")
    }
}

const deleteReview = async (id) => {
    try {
        return await Testimonial.findOneAndDelete(id);
    } catch (error) {
        throw new Error(error || "Failed to delete review0");
    }
}

module.exports = {
    addReview,
    getALlReview,
    deleteReview
}