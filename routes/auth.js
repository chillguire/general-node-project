const express = require('express');
const router = express.Router();

const auth = require('../controller/auth');

const { isLoggedOut } = require('../middleware/middleware');


router.route('/register')
	.get(isLoggedOut, auth.renderRegisterForm)
	.post(isLoggedOut, auth.register);

router.route('/login')
	.get(isLoggedOut, auth.renderLoginForm)
	.post(isLoggedOut, auth.login);


module.exports = router;