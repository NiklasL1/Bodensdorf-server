// import mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BookingSchema = new Schema(
	{
		userID: { type: Schema.Types.ObjectId, required: false },
		airBnB: { type: Boolean, required: true },
		arriveEpoch: { type: Number, required: true },
		departEpoch: { type: Number, required: true },
		arriveStr: { type: String, min: 10, max: 10, required: true },
		departStr: { type: String, min: 10, max: 10, required: true },
		totalPrice: { type: Number, required: true },
		prepayment: { type: Number, required: true },
		amtPaid: { type: Number, required: true },
		amtOwed: { type: Number, required: true },
		people: { type: Number, required: true },
		name: { type: String, required: false },
		reminderStatus: { type: String, required: false },
	},
	{ timestamps: true }
);

const Booking = mongoose.model("Booking", BookingSchema);

exports.Booking = Booking;
exports.BookingSchema = BookingSchema;
