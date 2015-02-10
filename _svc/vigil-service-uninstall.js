var Service = require('node-linux').Service;

var serviceName = 'vigil';

// Create a new service object
var svc = new Service({
  name:serviceName,
  description: 'The vigil nginx/waf solution',
  script: __dirname + '/../vigil.js',
  user: "www-data",
  group: "www-data"
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
  console.log('Uninstall complete for ' + serviceName);
  console.log('The service exists: ',svc.exists);
});

// Uninstall the service.
svc.uninstall();