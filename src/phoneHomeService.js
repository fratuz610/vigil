/*jslint node: true */
"use strict";

var nodemailer = require('nodemailer');
var validate = require("validate.js");

module.exports = function(config) {

	var _self = this;

	// valid submission constraint
	var phoneHomeConstraints = {
		from: { presence:true, email: true},
		to: { presence:true},
		service: { presence:true, format: /^[\w-\._]+$/},
		user: { presence:true, length: {minimum:3}},
		pass: { presence:true, length: {minimum:3}}
	};

	this.phoneHome = function(bodyContent, callback) {

		var validationResults = validate(config.phoneHome, phoneHomeConstraints, {flatten:true});

		if(validationResults)
			return callback(new Error("Unable to send phoneHome email because: " + validationResults.join(",")));

		var toList = config.phoneHome.to.split(',');

		toList.forEach(function(item) {
			if(!_self.isValidEmailAddress(item))
				return callback(new Error("Unable to send phoneHome email because recipient email address " + item + " doesn't appear to be valid"));
		});

		// create reusable transporter object using SMTP transport
		var transporter = nodemailer.createTransport({
		    service: config.phoneHome.service,
		    auth: {
		        user: config.phoneHome.user,
		        pass: config.phoneHome.pass
		    }
		});

		// setup e-mail data with unicode symbols
		var mailOptions = {
		    from: 'Vigil configuration mailer <'+config.phoneHome.from+'>', // sender address
		    to: toList.join(','), // list of receivers
		    subject: '['+ _data.instanceId + '] Yoda run results', // Subject line
		    text: bodyContent // plaintext body
		};

		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info){
			
		    if(error)
		        return callback(new Error("Unable to send phoneHome email because: " + error));

		    callback();
		});

	};

	this.isValidEmailAddress = function(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
	};
	
};