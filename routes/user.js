const express = require('express');
const { registerUser, loginUser, getProfile, forgotPassword, resetPassword, addHome, deleteHome, addRoom, deleteRoom } = require('../controls/user.js');
const { authenticationMid } = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgotPassword', forgotPassword);
router.post('/reset/:token', resetPassword);

router.get('/profile', authenticationMid, getProfile);

router.post('/add-home', authenticationMid, addHome);
router.delete('/delete-home/:homeId', authenticationMid, deleteHome);
router.post('/add-room', authenticationMid, addRoom);
router.post('/delete-room', authenticationMid, deleteRoom);

module.exports = router;