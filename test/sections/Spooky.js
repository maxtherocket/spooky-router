var SpookyEl = require('spooky-element');
var router = require('../..');

class Spooky extends SpookyEl {

    constructor(){
        super(require('../templates/Spooky.hbs'));
    }

}

module.exports = Spooky;