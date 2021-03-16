// Importing express
const express = require("express");
// Importing the router
const router = express.Router();
require("dotenv").config();
let nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
	host: process.env.MAIL_HOST,
	port: 587,
	secure: false,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PSWD,
	},
	tls: {
		// do not fail on invalid certs
		rejectUnauthorized: false,
	},
});

// verifying the connection configuration
transporter.verify(function (error, success) {
	if (error) {
		console.log(error);
	} else {
		console.log("Server is ready to take our messages!");
	}
});

router.post("/access", (req, res, next) => {
	var email = req.body.email;
	var subject = req.body.subject;
	var content = req.body.content;

	if (
		subject === "Registration confirmation - Lake Ossiach holiday apartment" ||
		subject === "Konto angelegt - Ossiacher See Ferienwohnung"
	) {
		var mail = {
			from: process.env.MAIL_USER,
			to: email,
			subject: subject,
			text: content,
			// html: stuff
		};
	} else {
		var mail = {
			from: process.env.MAIL_USER,
			to: email,
			bcc: "heidi@tomlittle.org",
			subject: subject,
			text: content,
			// html: stuff
		};
	}

	transporter.sendMail(mail, (err, data) => {
		if (err) {
			res.json({
				status: "fail",
			});
		} else {
			res.json({
				status: "success",
			});
		}
	});
});

module.exports = router;
