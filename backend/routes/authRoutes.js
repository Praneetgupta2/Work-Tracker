const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, isAdmin } = require('../middleware/auth');

router.post('/register', auth, isAdmin, authController.register);
router.post('/login', authController.login);
router.get('/me', auth, authController.getMe);

module.exports = router;
