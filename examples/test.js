//const deviceModule = require().device;
//const cmdLineProcess = require('./lib/cmdlin');

var noble = require('../index');
const deviceModule = require('..').device;
const cmdLineProcess = require('./lib/cmdline');
console.log('noble');
var sensor;

noble.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {

// can only scan fo devices with the certain UUID
//    var serviceUuid = ['739298b687b64984a5dcbdc18b068985'];
//    var allowDup 
//    noble.startScanning(serviceUuid, allowDup);
      cmdLineProcess('connect aws with device', process.argv.slice(2), initDevice);
      noble.startScanning("09876543210987654321098765432109", true);
      noble.startScanning();
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

noble.on('discover', function(peripheral){
  console.log('on-discover:' + peripheral.address);
//  console.log('on-discover:' + peripheral);


  peripheral.connect(function(error){
    console.log('connected to peripheral: ' + peripheral.uuid);

//    peripheral.discoverServices(['739298b687b64984a5dcbdc18b068985'], function(error, services) {
    peripheral.discoverServices(['09876543210987654321098765432109'], function(error, services) {
//    peripheral.discoverServices(['180f'], function(error, services) {
      var temperatureService = services[0];
      console.log('discover temperature service' + services);

//      temperatureService.discoverCharacteristics(['33ef91133b55413eb553fea1eaada459'], function(error, characteristics) {
      temperatureService.discoverCharacteristics(['12345678901234567890123456789012'], function(error, characteristics) {
//      temperatureService.discoverCharacteristics(['2a19'], function(error, characteristics) {
	var temperatureChar = characteristics[0];
	console.log('discover temperature character');

	temperatureChar.notify(true, function(error) {
	  console.log('temperature notification on');
	});

	temperatureChar.on('read', function(data, isNotification){
	
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
	  
	 // console.log('temperature is :' + data + "  size " + data.length);
/*	  if(data.length == 7){
  	    console.log('receive temperature data', data);
   	    //humidity
	    var offset = 1;
	    var pubData = "";
	    if(data[0] & 4){
	      var d = (data[offset+1] * 256 + data[offset]) / 10;   
	      pubData = pubData + "\"humidity\":" + d + ","; 
	     // console.log('humidy is ', d);
	      offset += 2;
	    }
	    if(data[0] & 16){
	      var d = (data[offset+1] * 256 + data[offset]) / 10;
	      pubData = pubData + '"pressure":' + d + ",";
	     // console.log('pressure is ', d);
	      offset += 2;
	    }
	    if(data[0] & 32){
	      var d = (data[offset+1] * 256 + data[offset]) / 10 * 9 / 5 + 32;
	      pubData = pubData + "\"temperature\":" + d + ",";
	      //console.log('temperature is ', d);
	      offset += 2;
	    }
	//    console.log('the presure', (data[4] * 256 + data[3]) / 10);	    
	//    console.log('the humidity', (data[6] * 256 + data[5]) / 10);
	//    pubData = pubData.substring(0, pubData.length-1);
	    sensor.publish('raspberry3/gateway/wiced', //JSON.stringify(
	      "{" + pubData + "\"macaddress\":\"" + peripheral.uuid + "\",\"timestamp\":\"" + new Date().getTime() + "\"}" 
	    );
	    console.log("publish one data", pubData);
	  }
*/
	});
	});
      });    
    });

  peripheral.on('disconnect', function(error, peripheral){
    console.log('disconnected from peripheral : ' ); 
  });
//  peripheral.disconnect(function(error) {
//    console.log('disconnected from peripheral: ' + peripheral.uuid);
//  });
});

/*
sensor.on('connect', function() {
	   console.log('connect');
   });
sensor
   .on('close', function() {
	   console.log('close');
   });
sensor
   .on('offline', function() {
  	   console.log('offline');
   });
sensor
   .on('error', function(error) {
 	   console.log('error', error);
   });
sensor
   .on('message', function(topic, payload) {
   	   console.log('message', topic, payload.toString());
   });
*/

module.exports = initDevice;

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

//if (require.main === module) {
//   cmdLineProcess('connect aws with device', process.argv.slice(2), initDevice);
//}

