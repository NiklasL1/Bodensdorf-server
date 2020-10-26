const express = require("express");

const router = express.Router();

const { resolve } = require("path");

// This is your real test secret API key.

const stripe = require("stripe")(
	"sk_test_51HJwTAKuLkk2F1U97GRH3SlNqdgvapCu4yWL0LmMmPHpQ6qGCKtYC7d7QhNT3ryjxOjoNH8nONvpGC6gWHxF4e3z004M2cPo3l"
);

router.use(express.static("."));

const calculateOrderAmount = (price) => {
	// Replace this constant with a calculation of the order's amount

	// Calculate the order total on the server to prevent

	// people from directly manipulating the amount on the client

	return price*100;
};

router.post("/create-payment-intent", async (req, res) => {
	const { price } = req.body;

	// Create a PaymentIntent with the order amount and currency

	const paymentIntent = await stripe.paymentIntents.create({
		amount: calculateOrderAmount(price),
		currency: "eur",
	});

	res.send({
		clientSecret: paymentIntent.client_secret,
	});
});

module.exports = router;

// router.listen(4000, () => console.log("Node server listening on port 4000!"));
