const User = require('../models/user');


module.exports.load = async (req, res) => {
	const search = {};
	if (req.query.searchTerm) {
		search.username = { $regex: req.query.searchTerm, $options: 'i' };
	}
	try {
		const users = await User.find(search);
		res.status(200).send(users);
	} catch (error) {
		console.log(error.message);
		return res.status(500).end();
	}
}