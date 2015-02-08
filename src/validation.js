/*jslint node: true */
"use strict";

var validate = require("validate.js");

var validIPRegex = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/;
var validURLRegex = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:\/\S*)?$/i;
var validEmailRegex = /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/;

// valid submission constraint
module.exports.localConfigConstraints = {
	s3Bucket: { presence:true},
	s3Key: { presence:true},
	awsAccessKey: { presence:true},
	awsSecretKey: { presence:true}
};

// valid submission constraint
module.exports.remoteConfigConstraints = {
	vhosts: {presence:true},
	phoneHome: {presence:true},
	"phoneHome.from": { presence:true, email: true},
	"phoneHome.to": { presence:true},
	"phoneHome.service": { presence:true, format: /^[\w-\._]+$/},
	"phoneHome.user": { presence:true, length: {minimum:3}},
	"phoneHome.pass": { presence:true, length: {minimum:3}}
};

// valid vhosts constraint
module.exports.vhostConstraints = {
	name: {presence:true},
	dnsNames: {presence:true, array:true},
	origins: { presence:true, array:true},
	resolver: { presence:true, format:validIPRegex},
	workerProcesses: {numericality: {onlyInteger: true, greaterThanOrEqualTo: 1}},
	workerConnections: {numericality: {onlyInteger: true, greaterThanOrEqualTo: 1}},
	clientMaxBodySize: {format: /(\d+)([MKGT])/i},
	wafErrorURL: {presence:true, format:validURLRegex},
	gatewayTimeoutURL: {presence:true, format:validURLRegex },
	gzip: {format: /^(on|off)$/i},
	naxsiAdditionalRules: {array:true}
};


validate.validators.array = function(value, options, key, attributes) {

	if(!value)
		return;

	if(value.constructor !== Array)
		return "is not an array";
};

validate.validators.url = function(value, options, key, attributes) {

	if(!value)
		return;

	if(!validURLRegex.matches(value))
		return "is not a valid URL";

};

validate.validators.emailCSV = function(value, options, key, attributes) {

	if(!value)
		return;

	var valueList = value.explode(",");

	valueList.forEach(function(email) {
		if(!validEmailRegex.matches(email))
			return "is not a valid email csv list";
	});

};