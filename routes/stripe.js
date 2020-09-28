// Importing express
const express = require("express");
// Importing the router
const router = express.Router();
const stripe = require("stripe")(
	"sk_test_51HJwTAKuLkk2F1U97GRH3SlNqdgvapCu4yWL0LmMmPHpQ6qGCKtYC7d7QhNT3ryjxOjoNH8nONvpGC6gWHxF4e3z004M2cPo3l"
);
const { v4: uuidv4 } = require("uuid");

router
	.get("/", (req, res) => {
		res.send("it works");
	})

	.post("/", (req, res) => {
		const { product, token } = req.body;
		console.log("product", product);
		console.log("price", product.price);
		const idempotencyKey = uuidv4();

		return stripe.customers
			.create({
				email: token.email,
				source: token.id,
			})
			.then((customer) => {
				stripe.charges.create(
					{
						amount: product.price * 100,
						currency: "eur",
						customer: customer.id,
						receipt_email: token.email,
						description: `purchase of ${product.name}`,
						statement_descriptor: "Custom descriptor",
						// shipping: {
						//     name: token.card.name,
						//     address:{
						//         country: token.card.address_country
						//     }
						// }
					},
					{ idempotencyKey }
				);
			})
			.then((result) => res.status(200).json(result))
			.catch((err) => console.log(err));
	});

module.exports = router;
