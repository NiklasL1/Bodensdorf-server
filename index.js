// Importing express
const express = require("express");
// declaring router
const usersRouter = require("./routes/users");
const bookingsRouter = require("./routes/bookings");
const groupedBookingsRouter = require("./routes/groupedBookings");
const stripeRouter = require("./routes/stripe")
const passportRouter = require("./routes/passport")
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
// forcing https
var forceSsl = function (req, res, next) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(['https://', req.get('Host'), req.url].join(''));
    }
    return next();
 };
app.use(forceSsl);
// use cors
// http://localhost:3000
app.use(cors({
	origin: "https://ferienwohnung-ossiachersee.herokuapp.com",
	credentials: true
}));
// use the routers, these are the paths for all the different routers
app.use("/api/users", usersRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/groupedBookings", groupedBookingsRouter);
app.use("/api/payment", stripeRouter);
app.use("/api", passportRouter);
// error middleware, any next function passed an error will find this if there is an error
app.use((err, req, res, next) => {
	console.error(err.message)
	res.send(`An error has ocurred: ${err.message}`)
})
// express listening to node to keep it awake or listening. this is necessary for an api to keep it running at all times
app.listen(process.env.PORT, () =>
	console.log("CORS-enabled web server listening on port " + process.env.PORT || 80)
);

// add basic error handling to API
// make the routes of our second list ("bookings")
// in react application include a view to CRUED second list