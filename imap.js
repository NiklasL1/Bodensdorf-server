const imaps = require("imap-simple");
const simpleParser = require("mailparser").simpleParser;
const _ = require("lodash");
const fetch = require("node-fetch");
const schedule = require("node-schedule");
const moment = require("moment");
require("dotenv").config();
const fs = require("fs");
require('https').globalAgent.options.ca = require('ssl-root-cas').create();

console.log("Starting job schedule.");

schedule.scheduleJob("30 03 * * *", () => {
	var config = {
		imap: {
			user: process.env.MAIL_USER_2,
			password: process.env.MAIL_PSWD_2,
			host: process.env.MAIL_IMAP,
			port: 993,
			tls: true,
			tlsOptions: {
				rejectUnauthorized: false,
			},
			authTimeout: 30000,
		},
	};

	imaps
		.connect(config)
		.then(function (connection) {
			return connection.openBox("INBOX").then(function () {
				var searchCriteria = ["UNSEEN"];

				var fetchOptions = {
					bodies: ["HEADER", "TEXT"],
					markSeen: false,
				};

				return connection
					.search(searchCriteria, fetchOptions)
					.then(function (messages) {
						messages.forEach(function (item) {
							var all = _.find(item.parts, { which: "TEXT" });
							var id = item.attributes.uid;
							var idHeader = "Imap-Id: " + id + "\r\n";
							simpleParser(idHeader + all.body, (err, parsed) => {
								// access to the whole mail object
								// console.log("text:", parsed.text);
								let nameArray = parsed.text.match(/\– (.*?) kommt/);
								let priceArray = parsed.text.match(
									/(?<=Gesamtbetrag\n\n)(.*?)(?=€)/
								);
								let guestsArray = parsed.text.match(
									/(?<=Gäste\n\n)(.*?)(?=\n\n\n\nGäste)/
								);
								let asciiText = Buffer.from(parsed.text, "utf8").toString(
									"ascii"
								);
								let cleanText = asciiText.replace(/b/g, "");
								let dateSection = cleanText.match(
									/(?<=Gesamte Unterkunft)(.*?)(GC\$ste)/s
								);

								if (nameArray && priceArray && guestsArray && dateSection) {
									let cleanDates = dateSection[1].replace(/\s+|\0/g, "");
									let datesArray = cleanDates.match(
										/(\d{2}|\d{1})\.(\w+)(\d{4})(.*?g|.*?h)(\d{2}|\d{1})\.(\w+)(\d{4})/s
									);

									let arriveDay = datesArray[1];
									let arriveMonth = datesArray[2];
									let arriveYear = datesArray[3];
									let departDay = datesArray[5];
									let departMonth = datesArray[6];
									let departYear = datesArray[7];

									let name = nameArray[1];
									let price = priceArray[1].replace(",", ".");
									let guestsRaw = guestsArray[1];
									let guests = !guestsRaw.match(/[a-zA-Z]/)
										? guestsRaw
										: JSON.stringify(
												parseInt(guestsRaw.match(/(^\d)(.*?\s)(\d)/)[1], 10) +
													parseInt(guestsRaw.match(/(^\d)(.*?\s)(\d)/)[3], 10)
										  );

									console.log("name:", name);
									console.log("price:", price);
									console.log("guests:", guests);
									console.log("arriveDay:", arriveDay);
									console.log("arriveMonth:", arriveMonth);
									console.log("arriveYear:", arriveYear);
									console.log("departDay:", departDay);
									console.log("departMonth:", departMonth);
									console.log("departYear:", departYear);

									const monthToNumber = (month) => {
										if (month.startsWith("Jan")) {
											return "01";
										} else if (month.startsWith("Feb")) {
											return "02";
										} else if (month.endsWith("rz")) {
											return "03";
										} else if (month.startsWith("Apr")) {
											return "04";
										} else if (month.startsWith("Mai")) {
											return "05";
										} else if (month.startsWith("Jun")) {
											return "06";
										} else if (month.startsWith("Jul")) {
											return "07";
										} else if (month.startsWith("Aug")) {
											return "08";
										} else if (month.startsWith("Sep")) {
											return "09";
										} else if (month.startsWith("Okt")) {
											return "10";
										} else if (month.startsWith("Nov")) {
											return "11";
										} else if (month.startsWith("Dez")) {
											return "12";
										}
									};

									let arriveDate = `${arriveDay}-${monthToNumber(
										arriveMonth
									)}-${arriveYear}`;
									let departDate = `${departDay}-${monthToNumber(
										departMonth
									)}-${departYear}`;
									let arriveEpoch = moment(arriveDate, "DD-MM-YYYY").valueOf();
									let departEpoch = moment(departDate, "DD-MM-YYYY").valueOf();

									const doc = {
										airBnB: true,
										totalPrice: price,
										prepayment: price,
										amtPaid: price,
										amtOwed: 0,
										arriveStr: arriveDate,
										departStr: departDate,
										arriveEpoch: arriveEpoch,
										departEpoch: departEpoch,
										people: guests,
										name: name,
										createdAt: Date.now(),
									};

									let url =
										process.env.APP_LOCATION === "development"
											? new URL("/", process.env.APP_DEV_API)
											: new URL("/", process.env.APP_PROD_LOCAL_API);
									let server = new URL("/api/bookings/", url);

									const create = () => {
										fetch(server, {
											method: "post",
											headers: {
												Accept: "application/json, text/plain, */*",
												"Content-Type": "application/json",
											},
											body: JSON.stringify({ ...doc }),
										})
											.then(console.log("created booking:", doc))
											.catch((error) => {
												fs.appendFile(
													"IMAPlog.txt",
													`The booking ${JSON.stringify({ ...doc })} failed to write on ${moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a")} ERROR MESSAGE: ${error}\r\n\n`,
													function (err) {
														if (err) console.error("Problem marking message as seen");
													}
												);
											});
									};
									create();
								}
								if (err) {
									console.log("error:", err);
								}
							});
							return connection.addFlags(id, "Seen", (err) => {
								if (err) {
									fs.appendFile(
										"IMAPlog.txt",
										`Problem marking message as seen at ${moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a")} ERROR MESSAGE: ${err}\r\n\n`,
										function (err) {
											if (err) console.error("Error writing file", err);
										}
									);
								}
							});
						});
					});
			});
		})
		.catch((error) => {
			fs.appendFile(
				"IMAPlog.txt",
				`Error connecting to mail server at ${moment(Date.now()).format("MMMM Do YYYY, h:mm:ss a")} ERROR MESSAGE: ${error}\r\n\n`,
				function (err) {
					if (err) console.error("Error writing file", err);
				}
			);
		});
});