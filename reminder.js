const schedule = require("node-schedule");
const fetch = require("node-fetch");
const moment = require("moment");
const fs = require("fs");
const dedent = require("dedent-js");
require("dotenv").config();

console.log("Starting reminder app.");

schedule.scheduleJob("30 04 * * *", () => {

const e10Days = 864000000;
// const e100Days = 8640000000;
const e30Days = 2592000000;

const getBookings = async () => {
	let url =
		process.env.APP_LOCATION === "development"
			? new URL("/", process.env.APP_DEV_API)
			: new URL("/", process.env.APP_PROD_LOCAL_API);
	let bookingsServer = new URL("/api/bookings/", url);
	const response = await fetch(bookingsServer).catch((error) => {
		fs.appendFile(
			"ReminderLog.txt",
			`Failed to fetch bookings on ${moment(Date.now()).format(
				"MMMM Do YYYY, h:mm:ss a"
			)} ERROR MESSAGE: ${error}\r\n\n`
		);
	});
	const data = await response.json();
	return data;
};

const getUsers = async () => {
	let url =
		process.env.APP_LOCATION === "development"
			? new URL("/", process.env.APP_DEV_API)
			: new URL("/", process.env.APP_PROD_LOCAL_API);
	let usersServer = new URL("/api/users/", url);
	const response = await fetch(usersServer).catch((error) => {
		fs.appendFile(
			"ReminderLog.txt",
			`Failed to fetch users on ${moment(Date.now()).format(
				"MMMM Do YYYY, h:mm:ss a"
			)} ERROR MESSAGE: ${error}\r\n\n`
		);
	});
	const data = await response.json();
	return data;
};

const checkReminders = async () => {
	getUsers().then((users) => {
		// console.log(users);
		getBookings().then((bookings) => {
			bookings
				.filter(
					(object) =>
						object.amtOwed > 0 &&
						object.arriveEpoch - e30Days - Date.now() < e10Days &&
						object.airBnB === false &&
						object.reminderStatus === undefined &&
						object.reminderStatus !== "overdue"
				)
				.forEach((booking) => {
					let userObject = users.find((user) => user._id === booking.userID);
					console.log("this is the email:", userObject.email);

					const sendReminderEmail = async () => {
						const response = await fetch(
							process.env.REACT_APP_LOCATION === "development"
								? `${process.env.APP_DEV_API}/api/mail/access`
								: `${process.env.APP_PROD_LOCAL_API}/api/mail/access`,
							{
								method: "POST",
								headers: {
									"Content-type": "application/json",
								},
								body: JSON.stringify({
									email: userObject.email,
									subject:
										userObject.language === "en"
											? "Payment reminder - Lake Ossiach holiday apartment"
											: "Zahlungserinnerung - Ossiacher See Ferienwohnung",
									content:
										userObject.language === "en"
											? dedent(
													`Dear ${userObject.fName} ${userObject.lName},\r

										Please don't forget to pay the balance of ${
											booking.amtOwed
										}€ for your booking at our holiday apartment on Lake Ossiach! It is due next week on ${moment(
														booking.arriveEpoch - e30Days
													).format("DD.MM.YYYY")}.\r

										To make the remaining payment, please log in to your account and click on the "My Account" icon, the rightmost icon in the menu on the top right of your screen. You will see a list of your bookings and can click on the "Pay balance" button to pay the oustanding amount for your booking. Thank you!\r
										
										Booking details:

										Arrival: ${moment(booking.arriveStr, "DD-MM-YYYY").format("DD.MM.YYYY")}
										Departure: ${moment(booking.departStr, "DD-MM-YYYY").format("DD.MM.YYYY")}
										Guests: ${booking.people}
										Total cost: ${booking.totalPrice}€
										Paid: ${booking.amtPaid}€
										Outstanding payment amount: ${booking.amtOwed}€
										Outstanding payment due date: ${moment(booking.arriveEpoch - e30Days).format(
											"DD.MM.YYYY"
										)}
										
										Should you fail to make the remaining payment by the due date, your reservation may be cancelled.\r
										
										Please note that check-in is from 16:00 to 19:00 o'clock on the day of arrival and check-out is by 10:00 on the day of departure.\r								
										
										For any further inquiries about your stay, please contact heidi@tomlittle.org, or send a Signal (WhatsApp) or text message to +4915111353000, if possible in a timely manner. It may take up to a week for you to receive an answer to an e-mail.\r
										
										We thank you for your booking and hope you have a fantastic stay in our apartment!\r
										
										Kind Regards,\r
										
										The Holzapfel-Littles\r

										---										
										https://ossiachersee-ferienwohnung.de/`
											  )
											: dedent(
													`Sehr geehrte(r) ${userObject.fName} ${
														userObject.lName
													},\r

										bitte denken Sie an die Restzahlung von ${
											booking.amtOwed
										}€ für Ihren Aufenthalt in unser Ferienwohnung am Ossiacher See! Diese ist nächste Woche am ${moment(
														booking.arriveEpoch - e30Days
													).format("DD.MM.YYYY")} fällig.\r

										Bitte zahlen Sie indem Sie sich in Ihrem Konto anmelden und dann auf den "Mein Konto" Knopf klicken. Dieser befindet sich in dem Menu oben rechts, nachdem Sie sich angemeldet haben. Sie sehen dann eine Liste Ihrer Buchungen und können die Zahlung tätigen, indem Sie auf "Restbetrag zahlen" klicken. Vielen Dank!\r
										
										Buchungsdetails:

										Ankunft: ${moment(booking.arriveStr, "DD-MM-YYYY").format("DD.MM.YYYY")}
										Abreise: ${moment(booking.departStr, "DD-MM-YYYY").format("DD.MM.YYYY")}
										Gäste: ${booking.people}
										Gesamtpreis: ${booking.totalPrice}€
										Gezahlt: ${booking.amtPaid}€
										Ausstehende Zahlung: ${booking.amtOwed}€
										Fällig am: ${moment(booking.arriveEpoch - e30Days).format("DD.MM.YYYY")}
										
										Sollten Sie bis zu dem Fälligkeitsdatum die restliche Zahlung nicht erbracht haben, könnte Ihre Reservierung storniert werden.\r
										
										Bitte beachten Sie die Check-in und Check-out Zeiten: 16:00 bis 19:00 Uhr am Ankunftstag und bis 10:00 am Abreisetag.\r								
										
										Für weitere Fragen senden Sie uns bitte eine E-mail an heidi@tomlittle.org, oder per Signal (WhatsApp) oder SMS an +4915111353000. Möglichst nicht zu kurzfristig, da es in machen Fällen bis zu einer Woche dauern könnte, bis Sie auf E-mails eine Antwort erhalten.\r
										
										Vielen Dank für Ihre Buchung und wir wünschen Ihnen eine fantastische Zeit in unserer Wohnung!\r
										
										Mit freundlichen Grüßen,\r
										
										Familie Holzapfel-Little\r

										---										
										https://ossiachersee-ferienwohnung.de/`
											  ),
								}),
							}
						);
						const resData = await response.json();
						if (resData.status === "success") {
							console.log("email message sent successfully");

							const update = () => {
								let updatedBooking = booking;
								updatedBooking.reminderStatus = "10DaySent";
								fetch(
									process.env.REACT_APP_LOCATION === "development"
										? `${process.env.APP_DEV_API}/api/bookings/${booking._id}`
										: `${process.env.APP_PROD_LOCAL_API}/api/bookings/${booking._id}`,
									{
										method: "put",
										headers: {
											Accept: "application/json, text/plain, */*",
											"Content-Type": "application/json",
										},
										body: JSON.stringify({ ...updatedBooking }),
									}
								)
									.then((res) => res.json())
									.then((res) => console.log(res))
									.catch((error) => {
										fs.appendFile(
											"ReminderLog.txt",
											`Failed to update ${userObject.fName} ${
												userObject.fName
											}'s booking from ${booking.arriveStr} to ${
												booking.departStr
											} as 10 DAY REMINDER on ${moment(Date.now()).format(
												"MMMM Do YYYY, h:mm:ss a"
											)} ERROR MESSAGE: ${error}\r\n\n`
										);
									});
							};

							update();
						} else if (resData.status === "fail") {
							fs.appendFile(
								"ReminderLog.txt",
								`Failed to send reminder email to ${userObject.fName} ${
									userObject.lName
								} at ${userObject.email} on ${moment(Date.now()).format(
									"MMMM Do YYYY, h:mm:ss a"
								)} ERROR MESSAGE: ${error}\r\n\n`
							);
						}
					};
					sendReminderEmail();
				});
			bookings
				.filter(
					(object) =>
						object.amtOwed > 0 &&
						object.arriveEpoch - e30Days < Date.now() &&
						object.airBnB === false &&
						object.reminderStatus === "10DaySent" &&
						object.reminderStatus !== undefined
				)
				.forEach((overdueBooking) => {
					let overdueUser = users.find(
						(user) => user._id === overdueBooking.userID
					);
					// console.log("this is the email:", overdueUser.email);

					const sendOverdueEmail = async () => {
						const response = await fetch(
							process.env.REACT_APP_LOCATION === "development"
								? `${process.env.APP_DEV_API}/api/mail/access`
								: `${process.env.APP_PROD_LOCAL_API}/api/mail/access`,
							{
								method: "POST",
								headers: {
									"Content-type": "application/json",
								},
								body: JSON.stringify({
									email: "heidi@tomlittle.org",
									subject: `Bodensdorf Wohnung - ${overdueUser.fName} ${overdueUser.lName} hat nicht rechtzeitig bezahlt`,
									content: dedent(
										`Hallo Mama,\r

									${overdueUser.fName} ${
											overdueUser.lName
										} hat die Zahlungsfrist für seine/ihre Buchung nicht eingehalten. Die Restzahlung von ${
											overdueBooking.amtOwed
										}€ war am ${moment(
											overdueBooking.arriveEpoch - e30Days
										).format("DD.MM.YYYY")} fällig.
									
									Hier sind die vollständigen Buchungsdetails:

									Ankunft: ${moment(overdueBooking.arriveStr, "DD-MM-YYYY").format("DD.MM.YYYY")}
									Abreise: ${moment(overdueBooking.departStr, "DD-MM-YYYY").format("DD.MM.YYYY")}
									Gäste: ${overdueBooking.people}
									Gesamtpreis: ${overdueBooking.totalPrice}€
									Gezahlt: ${overdueBooking.amtPaid}€
									Ausstehende Zahlung: ${overdueBooking.amtOwed}€
									Fällig am: ${moment(overdueBooking.arriveEpoch - e30Days).format("DD.MM.YYYY")}
									
									Und hier sind die Kontaktdaten der Person:

									E-mail: ${overdueUser.email}
									Telefon: ${overdueUser.telNo}
									Sprache (bei Kontoerstellung): ${
										overdueUser.language === "en" ? "Englisch" : "Deutsch"
									} 
									
									Hab einen tollen Tag!
									
									Niklas`
									),
								}),
							}
						);
						const resData = await response.json();
						if (resData.status === "success") {
							console.log("email message sent successfully");

							const update = () => {
								let updatedBooking = overdueBooking;
								updatedBooking.reminderStatus = "overdue";
								fetch(
									process.env.REACT_APP_LOCATION === "development"
										? `${process.env.APP_DEV_API}/api/bookings/${overdueBooking._id}`
										: `${process.env.APP_PROD_LOCAL_API}/api/bookings/${overdueBooking._id}`,
									{
										method: "put",
										headers: {
											Accept: "application/json, text/plain, */*",
											"Content-Type": "application/json",
										},
										body: JSON.stringify({ ...updatedBooking }),
									}
								)
									.then((res) => res.json())
									.then((res) => console.log(res))
									.catch((error) => {
										fs.appendFile(
											"ReminderLog.txt",
											`Failed to update ${overdueUser.fName} ${
												overdueUser.fName
											}'s booking from ${overdueBooking.arriveStr} to ${
												overdueBooking.departStr
											} as OVERDUE on ${moment(Date.now()).format(
												"MMMM Do YYYY, h:mm:ss a"
											)} ERROR MESSAGE: ${error}\r\n\n`
										);
									});
							};

							update();
						} else if (resData.status === "fail") {
							fs.appendFile(
								"ReminderLog.txt",
								`Failed to send reminder email to Mama about ${
									overdueUser.fName
								} ${overdueUser.fName}'s overdue booking on ${moment(
									Date.now()
								).format(
									"MMMM Do YYYY, h:mm:ss a"
								)} ERROR MESSAGE: ${error}\r\n\n`
							);
						}
					};
					sendOverdueEmail();
				});
		});
	});
};

checkReminders();

});
