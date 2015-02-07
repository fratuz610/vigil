/*jslint node: true */
"use strict";

var async = require('async');
var Mustache = require('mustache');
var fs = require('fs');
var exec = require('child_process').exec;

var templateFile = "templates/nginx.conf.mustache";
var nginxOutputFile = "/etc/nginx/nginx.conf";

module.exports = function(phoneHomeService) {

	var _self = this;

	this.update = function(config, callback) {

		// we got a new configuration

		// we load the template file
		var templateContent; 
		try {
			templateContent = fs.readFileSync(templateFile, {encoding: "UTF-8"});
		} catch(err) {
			return callback(new Error("Error loading template file: '" + templateFile + "': " + err));
		}

		// we run the template with a combination of data + variables
		var output = Mustache.render(templateContent, config);

		// we output the content to the nginx configuration file
		try {
			fs.writeFileSync(nginxOutputFile, output);
		} catch(err) {
			return callback(new Error("Error writing nginx configurtion file: '" + nginxOutputFile + "': " + err));
		}

		// we reload the config
		exec("service nginx reload 2>&1", function (error, stdout, stderr) {

			if(error)
				callback(new Error("Unable to reload nginx service: " + error));

			callback();
		});

	};



};