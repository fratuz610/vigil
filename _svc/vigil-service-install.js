var Service = require('node-linux').Service;

var serviceName = 'vigil';

// Create a new service object
var svc = new Service({
  name:serviceName,
  description: 'The vigil nginx/waf solution',
  script: __dirname + '/../vigil.js',
  user: "root",
  group: "root"
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
	console.log("Service '"+ serviceName+"' installed correctly");
  svc.start();
});

svc.on('start',function(){
	console.log("Service '"+ serviceName+"' correctly started");
});

svc.install();