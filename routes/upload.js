const express = require('express');
const router = express.Router();

const upload = require('../controller/upload');

const { isLoggedIn } = require('../middleware/middleware');


router.route('/images/:path')
	.get(isLoggedIn, upload.getAvatar);

module.exports = router;