const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const notificationSchema = new Schema({
	toUser: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	fromUser: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	notificationType: {
		type: String,
		trim: true,
	},
	opened: {
		type: Boolean,
		default: false,
	},
	contentID: Schema.Types.ObjectId,
}, { timestamps: true });

notificationSchema.statics.insertNotification = async function (toUser, fromUser, notificationType, contentID) {
	try {
		const data = {
			toUser: toUser,
			fromUser: fromUser,
			notificationType: notificationType,
			contentID: contentID,
		}

		await this.deleteOne(data);

		return this.create(data);
	} catch (error) {
		console.log(error);
	}
};

module.exports = mongoose.model('Notification', notificationSchema);