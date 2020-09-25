// import mongoose
const mongoose = require("mongoose");

// establishing a connection to the database
mongoose
	.connect(process.env.MONGO_URI, { 
		useNewUrlParser: true,
		useUnifiedTopology: true 
	})
	.then(() => console.log("Connected successfully to the db!"))
	.catch((err) => console.error(err));

const client = mongoose.connection;

client.on("error", (err) => {
	console.error(err);
});

module.exports = client;
