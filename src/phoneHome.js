/*jslint node: true */
"use strict";

var nodemailer = require('nodemailer');
var validate = require("validate.js");

module.exports = function() {

	var _self = this;

	this.phoneHome = function(phoneHome, subject, body) {

		// create reusable transporter object using SMTP transport
		var transporter = nodemailer.createTransport({
		    service: phoneHome.service,
		    auth: {
		        user: phoneHome.user,
		        pass: phoneHome.pass
		    }
		});

		// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: 'Vigil configuration mailer <'+phoneHome.from+'>', // sender address
		    to: phoneHome.to, // list of receivers
		    subject: 'Vigil notification: ' + subject, // Subject line
		    text: body // plaintext body
		};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info){
			
		    if(error)
		        return console.error("phoneHome: Unable to send email because: " + error);

		    return console.info("phoneHome: email correcting sent: " + JSON.stringify(info));
		});

	};
	
};