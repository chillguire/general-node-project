const express = require('express');
const router = express.Router();

const profile = require('../controller/profile');

const { isLoggedIn } = require('../middleware/middleware');


router.route('/api/profile/avatar')
	.post(isLoggedIn, profile.uploadAvatar);

router.route('/profile/:username')
	.get(isLoggedIn, profile.load);

module.exports = router;