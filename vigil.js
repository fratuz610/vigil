/*jslint node: true */
"use strict";

//var EventEmitter = require('events').EventEmitter;
//var bus = Object.create(EventEmitter.prototype);

var Config = require('./src/config.js');
var HttpService = require('./src/httpService.js');
var NginxService = require('./src/nginxService.js');
var PhoneHome = require('./src/phoneHome.js');

// initialize services
var phoneHome = new PhoneHome();
var nginxService =new NginxService();

// initialize main engine
var config = new Config(nginxService, phoneHome);

