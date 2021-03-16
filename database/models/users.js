// import mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema(
	{
		username: { type: String, min: 1, max: 30, required: true },
		password: { type: String, min: 1, max: 30, required: true },
		fName: { type: String, min: 1, max: 30, required: true },
		lName: { type: String, min: 1, max: 30, required: true },
		email: { type: String, min: 1, max: 30, required: true },
		telNo: { type: String, required: true },
	},
	{ timestamps: true }
);

const User = mongoose.model("user", UserSchema);

module.exports = User;
