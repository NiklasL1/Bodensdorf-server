// Importing express
const express = require("express");
// Importing the router
const router = express.Router();
// importing schema for project objects
const Booking = require("../database/models/bookings").Booking

// GET api/<YOUR-DATA-TYPE>
// GET api/<YOUR-DATA-TYPE>/:id
// POST api/<YOUR-DATA-TYPE>
// PUT api/<YOUR-DATA-TYPE>/:id
// DELETE api/<YOUR-DATA-TYPE>/:id

router
    .get("/", (async (req, res, next) => {
        await Booking.find()
            .then(allDocuments => res.json(allDocuments))
            .catch(err => next(new Error(err)))
    }))
    .get("/:userID", (async (req, res, next) => {
        const { userID } = req.params;   
        await Booking.find({ userID })
            .then(allDocuments => res.json(allDocuments))
            .catch(err => next(new Error(err)))
    }))
    .post("/", (async (req, res, next) => {              
        const doc = {...req.body, createdAt: Date.now()}
        await Booking.create(doc)
            .then(newDocument => res.json(newDocument))
            .catch(err => next(new Error(err)))
    }))			
    .post("/:userID", (async (req, res, next) => { 
        const { userID } = req.params;       
        const doc = {...req.body, userID, createdAt: Date.now()}
        await Booking.create(doc)
            .then(newDocument => res.json(newDocument))
            .catch(err => next(new Error(err)))
    }))	
	.put("/:bookingID", (async(req, res, next) => {
        const {bookingID} = req.params        
        await Booking.findByIdAndUpdate(bookingID, { ...req.body }, {new:true, useFindAndModify:false})
            .then(updatedDocument => res.json(updatedDocument))
            .catch(err => next(new Error(err)))
	}))
		
	.delete("/:bookingID", (async (req, res, next) => {
        const {bookingID} = req.params
        await Booking.findByIdAndDelete(bookingID, {useFindAndModify:false})
            .then(response => res.json(response))
            .catch(err => next(new Error(err)))
    }))

module.exports = router;
