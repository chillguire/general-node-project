module.exports.isLoggedIn = function (req, res, next) {
	if (!(req.session && req.session.user)) {
		return res.redirect('/login');
	}
	next();
}

module.exports.isLoggedOut = function (req, res, next) {
	if ((req.session && req.session.user)) {
		return res.redirect('/');
	}
	next();
}