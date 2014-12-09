var SpookyEl = require('spooky-element');

class Spooky extends SpookyEl {

    constructor(){
        this.template = require('../templates/Spooky.hbs');
        super();
    }

}

module.exports = Spooky;