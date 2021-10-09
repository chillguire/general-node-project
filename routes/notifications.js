const express = require('express');
const router = express.Router();

const notifications = require('../controller/notifications');

const { isLoggedIn } = require('../middleware/middleware');


router.route('/api/notifications')
	.get(isLoggedIn, notifications.load);


module.exports = router;