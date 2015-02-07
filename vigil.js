/*jslint node: true */
"use strict";


var dgram = require("dgram");
var server = dgram.createSocket("udp4");

var accessItemRegex = /##(.*?)##/g;

//create an event listener for when a syslog message is recieved
server.on("message", function (msg, rinfo) {

	//console.log("Got '" + msg + "' from " + rinfo.address.toString());

	// $remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent" "$http_x_forwarded_for"

	var match, results = [];
	while (match = accessItemRegex.exec(msg)) {
    results.push(match[1]);   // save first captured parens sub-match into results array
	}

	var accessLogItem = {
		remoteAddr: results[0],
		timeLocal: new Date(results[1]).getTime(),
		uri: results[2],
		status: results[3],
		bytesSent: results[4],
		reqTime: results[5],
		referer: results[6],
		userAgent: results[7],
		forwardedFor: results[8]
	};

	console.log(JSON.stringify(accessLogItem));
	
}); 


//create an event listener to tell us that the has successfully opened the syslog port and is listening for messages
server.on("listening", function () {
  var address = server.address();
  console.log("server listening " + address.address + ":" + address.port);  

});

//bind the server to port 514 (syslog)
server.bind(8514);