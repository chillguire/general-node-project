const express = require('express');
const router = express.Router();

const chat = require('../controller/chat');

const { isLoggedIn } = require('../middleware/middleware');


router.route('/chats')
	.get(isLoggedIn, chat.renderChatList);

router.route('/chats/new')
	.get(isLoggedIn, chat.renderNewForm);

router.route('/chats/:id')
	.get(isLoggedIn, chat.renderChatView);

router.route('/api/chat')
	.get(isLoggedIn, chat.loadChats)
	.post(isLoggedIn, chat.create);


router.route('/api/chat/:id')
	.get(isLoggedIn, chat.loadChat)
	.put(isLoggedIn, chat.updateName);

router.route('/api/chat/:id/messages')
	.get(isLoggedIn, chat.loadMessages);

router.route('/api/chat/:id/markAsRead')
	.put(isLoggedIn, chat.markAsRead);

router.route('/api/messages')
	.post(isLoggedIn, chat.createMessage);

module.exports = router;