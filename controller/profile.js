const User = require('../models/user');
const Post = require('../models/posts');

const multer = require('multer');
const upload = multer({
	dest: 'uploads/',
	fileFilter: function (req, file, callback) {
		const filetypes = /jpeg|jpg|png/;

		const mimeType = filetypes.test(file.mimetype);

		if (mimeType || file.mimetype === 'image/png') {
			return callback(null, true);
		}
		callback(null, false);
		return callback(new Error('El archivo subido no es una imagen válida'));
	}
}).single('avatar');

const path = require('path');
const fs = require('fs');


module.exports.load = async (req, res) => {
	const payload = {
		pageTitle: 'uwu',
		currentUser: req.user,
	}
	try {
		const user = await User.findOne({ username: req.params.username });
		if (user) {
			payload.profileUser = user;
			return res.status(200).render('profile/home', payload);
		}
		return res.sendStatus(404);
	} catch (error) {
		console.log(error.message);
		return res.status(500).end();
	}
}

module.exports.uploadAvatar = async (req, res) => {
	upload(req, res, async function (error) {
		try {
			if (error || !req.file) {
				return res.sendStatus(400);
			}

			const filePath = `/uploads/images/${req.file.filename}.png`;
			const saveLocation = path.join(__dirname, `../${filePath}`);

			fs.rename(req.file.path, saveLocation, function (error) {
				if (error) {
					console.log('4');
					return res.sendStatus(400);
				}
			});

			await User.findByIdAndUpdate(req.user.id, { avatar: filePath }, { new: true });
			res.sendStatus(204);
		} catch (error) {
			console.log(error.message);
			return res.status(500).end();
		}
	});
}

