const express = require("express");
const passport = require("passport");
// const passportLocal = require("passport-local").Strategy
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const session = require("express-session");
const bodyParser = require("body-parser");
const router = express.Router();
const User = require("../database/models/users");

//Middleware
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(
	session({
		secret: "secretcode",
		resave: true,
		saveUninitialized: true,
	})
);
router.use(cookieParser("secretcode"));
router.use(passport.initialize());
router.use(passport.session());
require("../passportConfig")(passport);

//End of Middleware

router.post("/login", (req, res, next) => {
	passport.authenticate("local", (err, user, info) => {
		if (err) throw err;
		if (!user) res.send("No user exists");
		else {
			req.login(user, (err) => {
				if (err) throw err;
				res.send("successfully authenticated");
				console.log(req.user);
			});
		}
	})(req, res, next);
});

router.post("/register", (req, res) => {
	User.findOne({ username: req.body.username }, async (err, doc) => {
		if (err) throw err;
		if (doc) res.send("User Already Exists");
		if (!doc) {
			const hashedPassword = await bcrypt.hash(req.body.password, 10);
			const newUser = new User({
				username: req.body.username,
				password: hashedPassword,
				fName: req.body.fName,
				lName: req.body.lName,
				email: req.body.email,
				telNo: req.body.telNo,
			});
			await newUser.save();
			res.send("User Created");
		}
	});
});

router.get("/user", (req, res) => {
	res.send(req.user);
});

router.get("/logout", (req, res) => {
	req.session.destroy();
});

module.exports = router;
