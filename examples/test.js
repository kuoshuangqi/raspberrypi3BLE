
var noble = require('../index');
const deviceModule = require('..').device;
const cmdLineProcess = require('./lib/cmdline');
console.log('noble');
var sensor;

//trying to connect AWS and also scan for the device contains certain UUID
noble.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {

      cmdLineProcess('connect aws with device', process.argv.slice(2), initDevice);
      noble.startScanning("09876543210987654321098765432109", true);
  } else {
    noble.stopScanning();
  }
});

noble.on('scanStart', function() {
  console.log('on -> scanStart');
});

noble.on('scanStop', function() {
  console.log('on -> scanStop');
});

//when discovered device 
noble.on('discover', function(peripheral){
  console.log('on-discover:' + peripheral.address);

  //trying to connect device
  peripheral.connect(function(error){
    console.log('connected to peripheral: ' + peripheral.uuid);
    
    //trying to find the service of certain UUID
    peripheral.discoverServices(['09876543210987654321098765432109'], function(error, services) {
      var temperatureService = services[0];
      console.log('discover temperature service' + services);

      //trying to find characteristics of certain UUID 
      temperatureService.discoverCharacteristics(['12345678901234567890123456789012'], function(error, characteristics) {
	var temperatureChar = characteristics[0];
	console.log('discover temperature character');
	
	//set the sensor to notify data
	temperatureChar.notify(true, function(error) {
	  console.log('temperature notification on');
	});

	temperatureChar.on('read', function(data, isNotification){

	//publish data when get the sensor data	
	console.log('temperature is :' + data);
	var mydata = data + "";
	var tempHumi = mydata.split(",");
	var pubData = "";
	pubData = pubData + "\"humidity\":" + tempHumi[1] + ","; 
	pubData = pubData + "\"temperature\":" + tempHumi[0] + ",";
	sensor.publish('raspberry3/gateway/wiced', //JSON.stringify(
	      "{" + pubData + "\"macaddress\":\"" + peripheral.uuid + "\",\"timestamp\":\"" + new Date().getTime() + "\"}" 
	    );
	console.log("publish one data", pubData);
	  
	});
	});
      });    
    });

  peripheral.on('disconnect', function(error, peripheral){
    console.log('disconnected from peripheral : ' ); 
  });
});


module.exports = initDevice;

//init device when trying to connect AWS
function initDevice(args){
   console.log('in initDevice the args is ', args.Protocol);
   sensor = deviceModule({
      keyPath: args.privateKey,
      certPath: args.clientCert,
      caPath: args.caCert,
      clientId: args.clientId,
      region: args.region,
      baseReconnectTimeMs: args.baseReconnectTimeMs,
      keepalive: args.keepAlive,
      protocol: args.Protocol,
      port: args.Port,
      host: args.Host,
      debug: args.Debug
   });
   
   console.log('in initDevice the global sensor is', sensor);
   return sensor;
}


