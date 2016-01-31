var jwt = require("jsonwebtoken");
module.exports = {
	secret: "123abc",
	sign: function (payload, expires) {
		var self = this;

		return jwt.sign(payload, self.secret, { expiresIn: expires });
	}
};