const express = require('express');
const { userRegister, userLogin, changeUserPassword } = require('../controller/AdminrController');
const router = express.Router();
const { authorization } = require('../middleware/auth.middleware');

//User Register
router.post('/register', userRegister);
//User Login
router.post('/login', userLogin);
//Protected Route
router.get('/auth/verify', authorization, (req, res) => {
    res.json({ success: true, message: "Token is valid" });
});

module.exports = router;