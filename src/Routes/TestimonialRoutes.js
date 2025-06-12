const express = require('express');
const router = express.Router();
const { authorization } = require("../middleware/auth.middleware")
const { addTestimonial, getTestimonials, deleteTestimonial, editTestimonial } = require("../controller/TestimonialManagementController");

//Add Testimonial
router.post('/', addTestimonial);
//Get All Testimonials
router.get('/', getTestimonials);
//Update Testimonial
router.put('/:id', authorization, editTestimonial);
//Delete Testimonial
router.delete('/:id', authorization, deleteTestimonial);

module.exports = router;