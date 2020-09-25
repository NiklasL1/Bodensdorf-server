// import mongoose
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const BookingSchema = require("./bookings").BookingSchema

const GroupedBookingSchema = new Schema(
	{
		bookings: { type: [BookingSchema], required: true },
		userID: { type: Schema.Types.ObjectId, required: true },
	},
	{ timestamps: true }
);

const GroupedBooking = mongoose.model("GroupedBooking", GroupedBookingSchema);

module.exports = GroupedBooking;
