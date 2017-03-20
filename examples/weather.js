
var noble = require('../index');
var LCD = require('../lcdi2c.js');
const deviceModule = require('..').device;


console.log('noble');
var sensor;
var datachar = null;	
var status = "1";
var lcd = new LCD( 1, 0x38, 16, 2 );
lcd.createChar( 0,[ 0x1B,0x15,0x0E,0x1B,0x15,0x1B,0x15,0x0E] ).createChar( 1,[ 0x0C,0x12,0x12,0x0C,0x00,0x00,0x00,0x00] );
lcd.home();

noble.on('stateChange', function(state) {
  console.log('on -> stateChange: ' + state);

  if (state === 'poweredOn') {
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

  //noble.stopScanning();

  //trying to connect device
  peripheral.connect(function(error){
    console.log('connected to peripheral: ' + peripheral.uuid);
    
    //trying to find the service of certain UUID
    peripheral.discoverServices(['09876543210987654321098765432109'], function(error, services) {
      var temperatureService = services[0];
      console.log('discover temperature service' + services);

      //trying to find characteristics of certain UUID 
      temperatureService.discoverCharacteristics(['12345678901234567890123456789012'], function(error, characteristics) {

        datachar = characteristics[0];	

        this.changeInterval = setInterval(function(){
        var parameter = new Buffer(1);
        parameter.write(status);
        datachar.write(parameter, false, function(err) {
          if(!err){
  		
          }else{
            console.log("error");	 
          }
        });
	
        datachar.read(function(err) {
          if(err){
      	    console.log("err");
          }
        });
        }.bind(this), 2000);
      
        datachar.on('read', function(data, isNotification) {
	  var temp = data.toString();
          console.log(temp);
          lcd.clear()
          lcd.println(temp, 1);
        });	
      });    
    });

  peripheral.on('disconnect', function(error, peripheral){
    console.log('disconnected from peripheral : ' ); 
  });
});

});



var stdin = process.openStdin();
stdin.addListener("data", function(d){
  if(d.toString().trim() == "on"){
    console.log("trying to turn on"); 
    status = "1"; 
  }else if(d.toString().trim() == "off"){
    console.log("trying to turn off");
    status = "0";
  }else{
  }
});
