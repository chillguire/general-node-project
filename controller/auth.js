const User = require('../models/user');

const bcrypt = require('bcrypt')


module.exports.renderRegisterForm = (req, res) => {
	const payload = {
		pageTitle: 'Register',
	}

	return res.status(200).render('auth/register', payload);
}

module.exports.renderLoginForm = (req, res) => {
	const payload = {
		pageTitle: 'Login',
	}

	return res.status(200).render('auth/login', payload);
}

module.exports.register = async (req, res) => {
	const username = req.body.username.replace(/ /g, '');
	const password = req.body.password;
	const payload = {
		pageTitle: 'Register',
	}

	//check if req is appropiate
	if (!(username && password)) {
		//res.status(400).end();
		payload.error = 'Missing args';

		return res.status(400).render('auth/register', payload);
	}

	try {
		//check if resource already exists
		let user = await User.findOne({ username: username });
		if (user) {
			//res.status(409).end();
			payload.error = 'User already exists';

			return res.status(409).render('auth/register', payload);
		}

		//200!
		const hashedPassword = await bcrypt.hash(password, 10);

		user = new User({
			username,
			password: hashedPassword,
		});
		await user.save();

		req.session.user = {
			id: user._id,
			username: user.username,
		};

		//return res.status(200).send(user);
		return res.redirect('/');

	} catch (error) {
		const payload = {
			pageTitle: 'Register',
			error: error.message,
		}

		console.log(error.message);
		return res.status(500).render('auth/register', payload);
	}
}

module.exports.login = async (req, res) => {
	const username = req.body.username;
	const password = req.body.password;
	const payload = {
		pageTitle: 'Register',
	}

	//check if req is appropiate
	if (!(username && password)) {
		//res.status(400).end();
		payload.error = 'Missing args';

		return res.status(400).render('auth/login', payload);
	}

	try {
		const user = await User.findOne({ username: username });
		const isPasswordCorrect = user === null ? false : await bcrypt.compare(password, user.password);

		if (!(user && isPasswordCorrect)) {
			//res.status(401).end();
			payload.error = 'Invalid credentials';

			return res.status(401).render('auth/login', payload);
		}

		req.session.user = {
			id: user._id,
			username: user.username,
		};

		//return res.status(200).send(user);
		return res.redirect('/');

	} catch (error) {
		const payload = {
			pageTitle: 'Login',
			error: error.message,
		}

		console.log(error.message);
		return res.status(500).render('auth/login', payload);
	}
}

module.exports.logout = async (req, res) => {
	req.session.destroy(function (error) {
		res.send('/');
	});
}