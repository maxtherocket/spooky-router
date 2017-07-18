var SpookyEl = require('spooky-element');
var Router = require('../..');

class Boo extends SpookyEl {

    constructor(data){
        super(require('../templates/Boo.hbs'), data);
        this.link = this.find('.link');
        this.link.on('click', (e) => {
        	e.preventDefault();
         	Router.go('spooky', {id:16});
        });
    }

}

module.exports = Boo;