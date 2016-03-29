var SpookyEl = require('spooky-element');

class Boo extends SpookyEl {

    constructor(data){
        super(require('../templates/Boo.hbs'), data);
    }

}

module.exports = Boo;