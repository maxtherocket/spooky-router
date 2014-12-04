var mixes = require('mixes');
var urlPattern = require('url-pattern');
var _ = require('lodash');
var on = require('dom-event');
var ViewManager = require('spooky-view-manager');
var Route = require('route-parser');
var Signal = require('signals').Signal;
var model = require('spooky-model');

var SpookyRouter = function(container, initRoutes, overlapViews){

    this.container = container;
    this.routes = {};

    this.viewManager = new ViewManager(container, overlapViews);

    this.updateURL = true;

    this.onRouteNotFound = new Signal();
    this.onRouteChanged = new Signal();

    // init routes
    if (initRoutes && _.isFunction(initRoutes)){
        initRoutes.call(this);
    }
}

mixes(SpookyRouter, {

    init: function(watchURL){
        watchURL = (watchURL!==false);
        if (watchURL){
            on(window, 'hashchange', this.hashChangeHandler.bind(this));
            // check if we have an empty hash string
            if (this.getHashPath() === ''){
                this.setHashPath('/');
            } else {
                // Detect initial path
                this.hashChangeHandler();
            }
        }
    },

    add: function(name, pattern, config){

        var route = {
            name: name,
            route: new Route(pattern),
            config: config
        }

        this.routes[name] = route;

    },

    hashChangeHandler: function(){
        var path = this.getHashPath();
        this.matchPath(path);
    },

    getHashPath: function(){
        var hash = window.location.hash;
        var stripNumCharsFromBegining = 1;
        // Check for !
        if (hash.charAt(1) == '!'){
            stripNumCharsFromBegining = 2;
        }
        var path = hash.slice(stripNumCharsFromBegining, hash.length);
        return path;
    },

    setHashPath: function(path){
        window.location.hash = "!" + path;
    },

    go: function(name, params, updateURL){
        // if updateURL is not defined, use router
        if (_.isUndefined(updateURL)){
            updateURL = this.updateURL;
        }
        var path = this.generatePath(name, params);
        if (!path) return;
        // Check if route parameters have an updateURL property
        var route = this.routes[name];
        if (route && route.config && route.config.updateURL === false){
            // Make sure not to update hash
            updateURL = false;
        }
        // Sometimes the hash path might still be the same,
        // For example when the new section has a updateURL set to false and we want to go back
        if (updateURL && this.getHashPath() !== path){
            this.setHashPath(path);
        } else {
            this.matchPath(path);
        }
    },

    generatePath: function(name, params){
        var route = this.routes[name];
        if (route){
            return route.route.reverse(params);
        }
    },

    matchPath: function(path){
        _.each(this.routes, function(route, index){
            var match = route.route.match(path);
            if (match){
                this.pathMatched(match, route);
                return false;
            }
        }.bind(this));
        // No match
        this.onRouteNotFound.dispatch();
    },

    pathMatched: function(match, route){
        // set current route        
        this.currentRoute = route;
        this.onRouteChanged.dispatch(route);

        // Change view
        var View = route.config.view;
        var model = model.getContent[route.name];
        var instance = new View(model);
        this.viewManager.changeView(instance);
    }

});

module.exports = SpookyRouter;