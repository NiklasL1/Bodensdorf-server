// Importing express
const express = require("express");
// Importing the router
const router = express.Router();
// importing schema for project objects
const User = require("../database/models/users");

// GET api/<YOUR-DATA-TYPE>
// GET api/<YOUR-DATA-TYPE>/:id
// POST api/<YOUR-DATA-TYPE>
// PUT api/<YOUR-DATA-TYPE>/:id
// DELETE api/<YOUR-DATA-TYPE>/:id

router
	.get("/", async (req, res, next) => {
		await User.find()
			.then((allDocuments) => res.json(allDocuments))
			.catch((err) => next(new Error(err)));
	})
	.get("/:id", async (req, res, next) => {
		// Taking id out of params by destructuring
		const { id } = req.params;
		// findOne instead of one stops searching after the first matching item is found, improving search times
		// const result = await User.findOne({_id:id});
		// findById to specifically search for object by unique ID
		await User.findById(id)
			.then((result) => res.json(result))
			.catch((err) => next(new Error(err)));
	})
	.post("/", async (req, res, next) => {
		const doc = { ...req.body, createdAt: Date.now() };
		await User.create(doc)
			.then((newDocument) => res.json(newDocument))
			.catch((err) => next(new Error(err)));
	})
	.put("/:id", async (req, res, next) => {
		const { id } = req.params;
		await User.findByIdAndUpdate(
			id,
			{ ...req.body },
			{ new: true, useFindAndModify: false }
		)
			.then((updatedDocument) => res.json(updatedDocument))
			.catch((err) => next(new Error(err)));
	})

	.delete("/:id", async (req, res, next) => {
		const { id } = req.params;
		await User.findByIdAndDelete(id, { useFindAndModify: false })
			.then((response) => res.json(response))
			.catch((err) => next(new Error(err)));
	});

module.exports = router;
