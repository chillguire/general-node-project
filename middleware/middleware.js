const jwt = require('jsonwebtoken');


module.exports.isLoggedIn = function (req, res, next) {
	const token = req.cookies['auth-token'];
	if (!token) {
		return res.redirect('/login');
	}
	const decodedToken = jwt.verify(token, process.env.SECRET || 'uwu');
	if (!decodedToken) {
		return res.redirect('/login');
	}

	req.user = decodedToken;
	next();
}

module.exports.isLoggedOut = function (req, res, next) {
	const token = req.cookies['auth-token'];
	if (token) {
		return res.redirect('/');
	}
	next();
}