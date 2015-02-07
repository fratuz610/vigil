/*jslint node: true */
"use strict";

var yaml = require('js-yaml');
var validate = require("validate.js");
var validation = require("./validation.js");

var _localConfig;
var _localConfigLastModified;

var _remoteConfig;
var _remoteConfigEtag;

module.exports = function(nginxManager) {
	
	this.updateLocal = function() {

		var newLastModified;
		try {
			newLastModified = fs.statSync("config.yaml").mtime;
		} catch(e) {
			return console.error("Config: Unable to read config file last modified date because: " + e);
		}

		if(_localConfigLastModified && newLastModified < _localConfigLastModified)
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

		console.log("Config: local configuration updated, reading remote one");

		// we are safe now
		_localConfig = possibleLocalConfig;

		setImmediate(_self.updateRemote());
	};

	this.updateRemote = function() {

		aws.config.update({ 
			accessKeyId: _localConfig.accessKey, 
			secretAccessKey: _localConfig.secretKey,
			sslEnabled: false
		});

		var s3 = new aws.S3(); 

		var params = {
			Bucket: _localConfig.s3Bucket,
			Key: _localConfig.s3Key
		};

	  s3.getObject(params, function(err, data) { 

	  	if(err)
	  		return console.error("Config: Unable to update remote config: " + err);

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
					vhostError = "Config: Unable to validate remote configuration because: " + validationResults.join(","));
			});

	  	if(vhostError)
	  		return console.error(vhostError);

	  	// we are safe now
	  	_remoteConfig = possibleRemoteConfig;

	  	console.log("Config: remote configuration updated, updating nginx");

	  	nginxManager.update(_remoteConfig);

	  });
	};

	this.getLocal = function() { return _localConfig; };
	this.getRemote = function() { return _remoteConfig; };

}