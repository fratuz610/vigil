/*jslint node: true */
"use strict";

// make sure we are running from the local folder
process.chdir(__dirname);

var Config = require('./src/config.js');
var HttpService = require('./src/httpService.js');
var NginxService = require('./src/nginxService.js');
var PhoneHome = require('./src/phoneHome.js');

// initialize services
var phoneHome = new PhoneHome();
var nginxService =new NginxService();

// initialize main engine
var config = new Config(nginxService, phoneHome);

