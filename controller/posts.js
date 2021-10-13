const User = require('../models/user');
const Post = require('../models/posts');


module.exports.load = async (req, res) => {
	const search = {};
	if (req.query.createdBy) {
		search.createdBy = req.query.createdBy;
	}
	try {
		const posts = await Post.find(search).populate('createdBy').sort({ 'createdAt': 1 });
		res.status(200).send(posts);
	} catch (error) {
		console.log(error.message);
		return res.status(500).end();
	}
}

module.exports.create = async (req, res) => {
	if (!req.body.content.trim()) {
		res.status(400).end();
	}

	let newPost = {
		content: req.body.content.trim(),
		createdBy: req.user.id,
	}
	const post = new Post(newPost);

	try {
		await post.save();
		newPost = await User.populate(post, { path: 'createdBy' });
		res.status(201).send([newPost]);
	} catch (error) {
		console.log(error.message);
		return res.status(500).end();
	}
}

module.exports.delete = async (req, res) => {
	try {
		await Post.findByIdAndDelete(req.params.id);
		res.status(204).send();
	} catch (error) {
		console.log(error.message);
		return res.status(500).end();
	}
}