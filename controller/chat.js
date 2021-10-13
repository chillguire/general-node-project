const Chat = require('../models/chat');
const Message = require('../models/messages');
const Notification = require('../models/notification');
const User = require('../models/user');
const ObjectID = require('mongoose').Types.ObjectId;


module.exports.renderChatList = async (req, res) => {
	const payload = {
		pageTitle: 'uwu',
		currentUser: req.user,
	}

	res.status(200).render('chat/home', payload);
}

module.exports.renderNewForm = async (req, res) => {
	const payload = {
		pageTitle: 'uwu',
		currentUser: req.user,
	}

	res.status(200).render('chat/new', payload);
}

module.exports.renderChatView = async (req, res) => {
	try {
		const payload = {
			pageTitle: 'uwu',
			currentUser: req.user,
		}

		const chat = await Chat.findOne({ _id: req.params.id, users: { $elemMatch: { $eq: req.user.id } } }).populate('users');
		if (chat) {
			payload.chat = chat;
			return res.status(200).render('chat/details', payload);
		}
		return res.sendStatus(404);
	} catch (error) {
		console.log(error.message);
		return res.status(500).end();
	}
}

module.exports.create = async (req, res) => {
	try {
		if (!req.body.users || (req.body.users.length === 0)) {
			return res.status(400).end();
		}

		let isArrayValid = false;
		for (let i = 0; i < req.body.users.length; i++) {
			isArrayValid = ObjectID.isValid(req.body.users[i]);
			if (!isArrayValid) {
				break;
			}
		}
		const isSessionUserInChat = req.body.users.includes(req.user.id);
		if (!isArrayValid || isSessionUserInChat) {
			return res.status(400).end();
		}

		const users = req.body.users;
		users.push(req.user.id);
		users.sort();
		let chat = await Chat.findOne({ users: users });
		if (chat) {
			return res.status(200).send(chat);
		} else {
			const newChat = {
				users: users,
				isGroupChat: (req.body.users.length > 2) ? true : false,
			}

			chat = new Chat(newChat);
			await chat.save();
			return res.status(201).send(chat);
		}
	} catch (error) {
		console.log(error);
		return res.status(500).end();
	}
}

module.exports.loadChats = async (req, res) => {
	try {
		const chats = await Chat.find({ users: { $elemMatch: { $eq: req.user.id } } })
			.populate('users')
			.populate({
				path: 'latestMessage',
				populate: {
					path: 'sender',
				},
			})
			.sort({ updatedAt: 1 });
		res.status(200).send(chats);
	} catch (error) {
		console.log(error.message);
		return res.status(500).end();
	}
}

module.exports.updateName = async (req, res) => {
	try {
		if (!req.body.chatName.trim()) {
			return res.status(400).end();
		}

		await Chat.findByIdAndUpdate(req.params.id, { chatName: req.body.chatName });
		res.sendStatus(204);
	} catch (error) {
		console.log(error);
		return res.status(500).end();
	}
}

module.exports.loadChat = async (req, res) => {
	try {
		const chat = await Chat.findOne({ _id: req.params.id, users: { $elemMatch: { $eq: req.user.id } } }).populate('users');
		res.status(200).send(chat);
	} catch (error) {
		console.log(error.message);
		return res.status(500).end();
	}
}

module.exports.createMessage = async (req, res) => {
	try {
		if (!req.body.content.trim() || !req.body.chat) {
			return res.status(400).end();
		}

		//message id already exist, is id valid, 
		let newMessage = {
			sender: req.user.id,
			content: req.body.content.trim(),
			chat: req.body.chat,
		}

		message = new Message(newMessage);
		await message.save();
		message = await User.populate(message, { path: 'sender' });
		message = await Chat.populate(message, { path: 'chat' });

		const chat = await Chat.findByIdAndUpdate(req.body.chat, { latestMessage: message._id });
		for (let i = 0; i < chat.users.length; i++) {
			if (chat.users[i].equals(message.sender._id)) {
				continue;
			}

			Notification.insertNotification(chat.users[i], message.sender._id, "message", message.chat._id);
		}

		return res.status(201).send([message]);
	} catch (error) {
		console.log(error);
		return res.status(500).end();
	}
}

module.exports.loadMessages = async (req, res) => {
	try {
		const messages = await Message.find({ chat: req.params.id })
			.populate('sender')
			.sort({ updatedAt: 1 });

		res.status(200).send(messages);
	} catch (error) {
		console.log(error.message);
		return res.status(500).end();
	}
}

module.exports.markAsRead = async (req, res) => {
	try {
		await Message.updateMany({ chat: req.params.id }, { $addToSet: { readBy: req.user.id } });
		await Notification.updateMany({ contentID: req.params.id, toUser: req.user.id }, { opened: true });

		res.sendStatus(204);
	} catch (error) {
		console.log(error.message);
		return res.status(500).end();
	}
}