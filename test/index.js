var Router = require('../index');

var initRoutes = function(){
    this.add( 'boo', '/', {view:require('./sections/Boo'), updateURL:true} );
    this.add( 'spooky', '/spooky/:id', {view:require('./sections/Spooky'), updateURL:true} );
}

require('spooky-model').init( {boo:{greeting:'BOO!'}} );

Router.init(document.body, initRoutes);

// var generated = router.generatePath('boo', {boo:'AAA', baa:'BBB'});
// console.log('generated: ', generated);

//router.go('boo');
