var SpookyEl = require('spooky-element');

class Boo extends SpookyEl {

    constructor(data){
        this.template = require('../templates/Boo.hbs');
        super(data);
    }

}

module.exports = Boo;