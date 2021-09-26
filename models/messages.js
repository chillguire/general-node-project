const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const messageSchema = new Schema({
	sender: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	content: {
		type: String,
		required: true,
		trim: true,
	},
	chat: {
		type: Schema.Types.ObjectId,
		ref: 'Chat',
		required: true,
	},
	readBy: [{
		type: Schema.Types.ObjectId,
		ref: 'User',
	}],
}, { timestamps: true });


module.exports = mongoose.model('Message', messageSchema);