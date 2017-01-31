var Noble = require('./lib/noble');
var bindings = require('./lib/resolve-bindings')();

module.exports = new Noble(bindings);
module.exports.device = require('./device');
module.exports.thingShadow = require('./thing');

