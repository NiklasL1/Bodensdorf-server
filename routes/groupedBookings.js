// Importing express
const express = require("express");
const mongoose = require("mongoose");
// Importing the router
const router = express.Router();
// importing schema for project objects
const GroupedBooking = require("../database/models/groupedBookings");

// GET api/<YOUR-DATA-TYPE>
// GET api/<YOUR-DATA-TYPE>/:id
// POST api/<YOUR-DATA-TYPE>
// PUT api/<YOUR-DATA-TYPE>/:id
// DELETE api/<YOUR-DATA-TYPE>/:id

router
	.get("/", (async (req, res, next) => {
		await GroupedBooking.find()
			.then(allDocuments => res.json(allDocuments))
			.catch(err => next(new Error(err)))
	}))	
	.get("/byUser/:userID", async (req, res, next) => {
		const { userID } = req.params;
		await GroupedBooking.find({ userID })
			.then((allDocuments) => res.json(allDocuments))
			.catch((err) => next(new Error(err)));
	})
	.get("/byBooking/:bookingID", async (req, res, next) => {
		// Taking id out of params by destructuring
		const { bookingID } = req.params;
		// findOne instead of one stops searching after the first matching item is found, improving search times
		// const result = await Review.findOne({_id:id});
		// findById to specifically search for object by unique ID
		await GroupedBooking.findById(bookingID)
			.then((result) => res.json(result))
			.catch((err) => next(new Error(err)));
	})	

	.post("/:userID", async (req, res, next) => {
		const { userID } = req.params;
		//pushing the product id into every element is redundant since it's already in the top level grouped object, but might be useful for other functionality
		const newBooking = { ...req.body};
		GroupedBooking.findOneAndUpdate(
			{ userID },
			{ $push: { bookings: newBooking } },
			{ upsert: true, new: true }
		)
			.then((response) => res.json(response))
			.catch((err) => next(new Error(err)));
	})

	.put("/:bookingID", async (req, res, next) => {
		const { bookingID } = req.params;
		await GroupedBooking.findByIdAndUpdate(
			bookingID,
			{ ...req.body },
			{ new: true, useFindAndModify: false }
		)
			.then((updatedDocument) => res.json(updatedDocument))
			.catch((err) => next(new Error(err)));
	})

	.delete("/:bookingID", async (req, res, next) => {
		const { bookingID } = req.params;
		await GroupedBooking.findByIdAndDelete(bookingID, { useFindAndModify: false })
			.then((response) => res.json(response))
			.catch((err) => next(new Error(err)));
	});

module.exports = router;
