const express = require('express');
const router = express.Router();

const posts = require('../controller/posts');

const { isLoggedIn } = require('../middleware/middleware');


router.route('/')
	.get(isLoggedIn, posts.load)
	.post(isLoggedIn, posts.create);

router.route('/:id')
	.delete(isLoggedIn, posts.delete);

module.exports = router;