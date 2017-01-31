//const deviceModule = require().device;
//const cmdLineProcess = require('./lib/cmdlin');

var noble = require('./index');




console.log('noble');

noble.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {

// can only scan fo devices with the certain UUID
//    var serviceUuid = ['739298b687b64984a5dcbdc18b068985'];
//    var allowDup 
//    noble.startScanning(serviceUuid, allowDup);
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

    peripheral.discoverServices(['739298b687b64984a5dcbdc18b068985'], function(error, services) {
//    peripheral.discoverServices(['180f'], function(error, services) {
      var temperatureService = services[0];
      console.log('discover temperature service' + services);

      temperatureService.discoverCharacteristics(['33ef91133b55413eb553fea1eaada459'], function(error, characteristics) {
//      temperatureService.discoverCharacteristics(['2a19'], function(error, characteristics) {
	var temperatureChar = characteristics[0];
	console.log('discover temperature character');

	temperatureChar.notify(true, function(error) {
	  console.log('temperature notification on');
	});

	temperatureChar.on('read', function(data, isNotification){
	 // console.log('temperature is :' + data + "  size " + data.length);
	  if(data.length == 7){
  	    console.log('receive temperature data', data);
   	    //humidity
	    var offset = 1;
	    if(data[0] & 4){
	      var d = (data[offset+1] * 256 + data[offset]) / 10;    
	      console.log('humidy is ', d);
	      offset += 2;
	    }
	    if(data[0] & 16){
	      var d = (data[offset+1] * 256 + data[offset]) / 10;
	      console.log('pressure is ', d);
	      offset += 2;
	    }
	    if(data[0] & 32){
	      var d = (data[offset+1] * 256 + data[offset]) / 10 * 9 / 5 + 32;
	      console.log('temperature is ', d);
	      offset += 2;
	    }
	//    console.log('the presure', (data[4] * 256 + data[3]) / 10);	    
	//    console.log('the humidity', (data[6] * 256 + data[5]) / 10);
	  }
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

