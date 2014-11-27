var SpookyEl = require('spooky-element');

class Boo extends SpookyEl {

    constructor(){
        this.template = require('./templates/Boo.hbs');
        super();
    }

}

module.exports = Boo;