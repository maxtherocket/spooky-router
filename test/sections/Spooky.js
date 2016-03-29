var SpookyEl = require('spooky-element');

class Spooky extends SpookyEl {

    constructor(){
        super(require('../templates/Spooky.hbs'));
    }

}

module.exports = Spooky;