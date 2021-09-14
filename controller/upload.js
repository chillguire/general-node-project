const path = require('path');
const fs = require('fs');


module.exports.getAvatar = async (req, res) => {
	const image = path.join(__dirname, `../uploads/images/${req.params.path}`);
	if (fs.existsSync(image)) {
		res.sendFile(image);
	} else {
		res.sendFile(path.join(__dirname, `../uploads/images/default/default.jpg`));
	}
}