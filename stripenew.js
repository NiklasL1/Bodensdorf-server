const express = require("express");

const app = express();

const { resolve } = require("path");

// This is your real test secret API key.

const stripe = require("stripe")(
	"sk_test_51HJwTAKuLkk2F1U97GRH3SlNqdgvapCu4yWL0LmMmPHpQ6qGCKtYC7d7QhNT3ryjxOjoNH8nONvpGC6gWHxF4e3z004M2cPo3l"
);

app.use(express.static("."));

app.use(express.json());

const calculateOrderAmount = (items) => {
	// Replace this constant with a calculation of the order's amount

	// Calculate the order total on the server to prevent

	// people from directly manipulating the amount on the client

	return 1400;
};

app.post("/create-payment-intent", async (req, res) => {
	const { items } = req.body;

	// Create a PaymentIntent with the order amount and currency

	const paymentIntent = await stripe.paymentIntents.create({
		amount: calculateOrderAmount(items),

		currency: "eur",
	});

	res.send({
		clientSecret: paymentIntent.client_secret,
	});
});

app.listen(4242, () => console.log("Node server listening on port 4242!"));
