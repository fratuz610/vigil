/*jslint node: true */
"use strict";

var fs = require('fs');
var yaml = require('js-yaml');
var validate = require("validate.js");
var aws = require('aws-sdk');

var validation = require("./validation.js");

var _localConfig;
var _localConfigLastModified;

var _remoteConfig;
var _remoteConfigEtag;

var _remoteBusy = false;

module.exports = function(nginxService, phoneHome) {
	
	this.updateLocal = function() {

		var newLastModified;
		try {
			newLastModified = fs.statSync("config.yaml").mtime;
		} catch(e) {
			return console.error("Config: Unable to read config file last modified date because: " + e);
		}

		if(_localConfigLastModified && newLastModified <= _localConfigLastModified)
			return;

		console.log("Config: reading local configuration");

		var staticConfig;
		try {
		  staticConfig = fs.readFileSync("config.yaml");
		} catch (e) {
		  return console.error("Config: Unable to read config file config.yaml because: " + e);
		}

		console.log("Config: Successfully read local config file " + staticConfig.length + " bytes");

		var possibleLocalConfig;

		try {
		  possibleLocalConfig = yaml.safeLoad(staticConfig);
		} catch (e) {
		  return console.error("Config: Unable to parse local config file: " + e);
		}

		var validationResults = validate(possibleLocalConfig, validation.localConfigConstraints, {flatten:true});

		if(validationResults)
			return console.error("Config: Unable to validate configuration because: " + validationResults.join(","));

		console.log("Config: local configuration updated");

		// we are safe now
		_localConfig = possibleLocalConfig;
		_localConfigLastModified = newLastModified;
	};

	this.updateRemote = function() {

		// if there is no local configuration, we can't read the remote one
		if(!_localConfig || _remoteBusy)
			return;

		_remoteBusy = true;

		//console.log("Config: updating remote configuration");

		var s3 = new aws.S3({
			accessKeyId: _localConfig.awsAccessKey, 
			secretAccessKey: _localConfig.awsSecretKey,
			sslEnabled: false
		});

		var params = {
			Bucket: _localConfig.s3Bucket,
			Key: _localConfig.s3Key
		};

	  s3.getObject(params, function(err, data) { 

	  	_remoteBusy = false;

	  	if(err)
	  		return console.error("Config: Unable to update remote config: " + err);

	  	// we check if the ETag matches
	  	if(_remoteConfigEtag && _remoteConfigEtag === data.ETag)
	  		return;

			console.log("Config: Successfully read remote config file " + data.Body.length + " bytes");

			var possibleRemoteConfig;

			try {
			  possibleRemoteConfig = yaml.safeLoad(data.Body);
			} catch (e) {
			  return console.error("Config: Unable to parse remote config file: " + e);
			}

			var validationResults = validate(possibleRemoteConfig, validation.remoteConfigConstraints, {flatten:true});

			if(validationResults)
				return console.error("Config: Unable to validate remote configuration because: " + validationResults.join(","));

			var vhostError;

			possibleRemoteConfig.vhosts.forEach(function(vhost) {
				var validationResults = validate(vhost, validation.vhostConstraints, {flatten:true});

				if(validationResults)
					vhostError = "Config: Unable to validate remote configuration because: " + validationResults.join(",");
			});

	  	if(vhostError)
	  		return console.error(vhostError);

	  	// we are safe now
	  	_remoteConfig = possibleRemoteConfig;
	  	_remoteConfigEtag = data.ETag

	  	console.log("Config: remote configuration updated, updating nginx");

	  	// we update the configuration
	  	nginxService.update(_remoteConfig, function(error) {

	  		if(error)
	  			return phoneHome.phoneHome(_remoteConfig.phoneHome, "ERROR", "Unable to update nginx configuration: " + error)

	  		return phoneHome.phoneHome(_remoteConfig.phoneHome, "NEW CONFIG", "Nginx configuration updated\n\n" + yaml.safeDump(_remoteConfig));
	  	});

	  });
	};

	this.getLocal = function() { return _localConfig; };
	this.getRemote = function() { return _remoteConfig; };

	// we update the local configuration every 10 seconds
	setInterval(this.updateLocal, 10000);
	setImmediate(this.updateLocal);

	// we update the remote configuration every 10 seconds
	setInterval(this.updateRemote, 10000);

}