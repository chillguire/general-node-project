const Notification = require('../models/notification');


module.exports.load = async (req, res) => {
	try {
		const notifications = await Notification.find({ toUser: req.session.user.id, opened: false })
			.populate('toUser')
			.populate('fromUser')
			.sort({ updatedAt: -1 });

		res.status(200).send(notifications);
	} catch (error) {
		console.log(error.message);
		return res.status(500).end();
	}
}