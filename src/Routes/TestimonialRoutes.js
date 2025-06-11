const express = require('express');
const router = express.Router();
const { authorization } = require("../middleware/auth.middleware")
const { addTestimonial, getTestimonials, deleteTestimonial } = require("../controller/TestimonialManagementController");

//Add PDF
router.post('/add', addTestimonial);
router.get('/list', getTestimonials);
router.delete('/delete/:id', authorization, deleteTestimonial);

module.exports = router;