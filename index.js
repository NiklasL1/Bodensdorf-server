// Importing express
const express = require("express");
// const { forceDomain } = require('forcedomain');
// declaring router
const usersRouter = require("./routes/users");
const bookingsRouter = require("./routes/bookings");
const groupedBookingsRouter = require("./routes/groupedBookings");
// const stripeRouter = require("./routes/stripeOLD")
const passportRouter = require("./routes/passport");
const stripeNewRouter = require("./routes/stripeNew");
const nodemailerRouter = require("./routes/nodemailer");
// Importing cors
const cors = require("cors");
// import env file
require("dotenv").config();
// connect to database
require("./database/client");

// Initializing express as "app"
const app = express();
// return data from express as json
app.use(express.json());

// use cors
app.use(
	cors({
		origin:
			process.env.APP_LOCATION === "development"
				? process.env.APP_DEV_FRONTEND
				: process.env.APP_PROD_FRONTEND,
		credentials: true,
	})
);
// use the routers, these are the paths for all the different routers
app.use("/api/users", usersRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/groupedBookings", groupedBookingsRouter);
// app.use("/api/payment", stripeRouter);
app.use("/api", passportRouter);
app.use("/api/payments", stripeNewRouter);
app.use("/api/mail", nodemailerRouter);
// error middleware, any next function passed an error will find this if there is an error
app.use((err, req, res, next) => {
	console.error(err.message);
	res.send(`An error has ocurred: ${err.message}`);
});
// express listening to node to keep it awake or listening. this is necessary for an api to keep it running at all times
app.listen(process.env.PORT, () =>
	console.log(
		"CORS-enabled web server listening on port " + process.env.PORT || 80
	)
);

// add basic error handling to API
// make the routes of our second list ("bookings")
// in react application include a view to CRUED second list