var Router = require('../index');
var boo = require('./boo');

var initRoutes = function(){
    this.add( 'boo', '/boo', {view:boo, updateURL:true} );
}

var router = new Router(document.body, initRoutes, {});
router.init();

// var generated = router.generatePath('boo', {boo:'AAA', baa:'BBB'});
// console.log('generated: ', generated);

router.go('boo');
