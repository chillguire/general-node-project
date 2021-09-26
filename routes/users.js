const express = require('express');
const router = express.Router();

const users = require('../controller/users');

const { isLoggedIn } = require('../middleware/middleware');


router.route('/')
	.get(isLoggedIn, users.load);

module.exports = router;