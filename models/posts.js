const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const postSchema = new Schema({
	content: {
		type: String,
		required: true,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	createdBy: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
});


module.exports = mongoose.model('Post', postSchema);