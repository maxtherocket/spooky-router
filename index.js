var mixes = require('mixes');
var _ = require('lodash');
var on = require('dom-event');
var ViewManager = require('spooky-view-manager');
var Route = require('route-parser');
var Signal = require('signals').Signal;
var model = require('spooky-model');
var SpookyElement = require('spooky-element');

var SpookyRouter = function(){

    this.onRouteNotFound = new Signal();
    this.onRouteChanged = new Signal();
    this.onParamsChanged = new Signal();
    
    this.width = 0;
    this.height = 0;

}

mixes(SpookyRouter, {

    init: function(container, initRoutes, width, height, overlapViews){

        this.container = container;
        this.routes = {};

        this.width = width;
        this.height = height;

        this.viewManager = new ViewManager(container, overlapViews);

        this.updateURL = true;

        // init routes
        if (initRoutes && _.isFunction(initRoutes)){
            initRoutes.call(this);
        }

        on(window, 'hashchange', this.hashChangeHandler.bind(this));
        // check if we have an empty hash string
        if (this.getHashPath() === ''){
            this.setHashPath('/');
        } else {
            // Detect initial path
            this.hashChangeHandler();
        }

        return this;
        
    },

    add: function(name, pattern, config){

        var route = {
            name: name,
            route: new Route(pattern),
            config: config
        }

        this.routes[name] = route;

        return this;

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
        var matched = false;
        _.each(this.routes, function(route, index){
            var match = route.route.match(path);
            if (match){
                matched = true;
                this.pathMatched(match, route);
                return false;
            }
        }.bind(this));
        // No match
        if (!matched){
            this.onRouteNotFound.dispatch(path);
        }
    },

    pathMatched: function(match, route){
        if (route == this.currentRoute){
            // The route is the same, meaning parameters have changed
            this.currentView.paramsChanged(match);
            return;
        }

        if (this.currentRoute.config.floatingView){
        	// TODO: Call a function on a floating view
        }

        if (route == this.viewManagerCurrentRoute){
        	// This would happen if we are returning from a floatingView route to a regular route

        	this.lastRoute = this.currentRoute;
        	this.currentRoute = route;

        	var previousView = this.currentView;
        	this.currentView = this.viewManager.currentView;
            // The route is the same, meaning parameters have changed
            this.currentView.paramsChanged(match);

            this.onRouteChanged.dispatch(route, match);

            return;
        }

        // set current route
        this.lastRoute = this.currentRoute;
        this.currentRoute = route;
        this.onRouteChanged.dispatch(route, match);
        // Change view
        if (route.config.view){
            var View = route.config.view;
            var configParams = route.config.params || {};
            var params = route.config.params = _.assign(configParams, match);
            if (View._spooky === true){
                var previousView = this.currentView;
                this.currentView = View;
                this.currentView.paramsChanged(params);
                if (this.currentView != previousView && !route.config.floatingView){
                    this.viewManager.changeView(this.currentView, false);
                    // Track the current route of the ViewManager to know which route the non-floating views are on
                    this.viewManagerCurrentRoute = this.currentRoute;
                }
            } else {
                var data = model.getContent(route.name);
                data = data || {};
                data = _.assign(data, route.config.data);
                this.currentView = new View(data);
                this.currentView.resize(this.width, this.height);
                this.currentView.paramsChanged(params);
                this.viewManager.changeView(this.currentView);
                // Track the current route of the ViewManager to know which route the non-floating views are on
                this.viewManagerCurrentRoute = this.currentRoute;
            }
        }
    },

    resize: function(w,h){
        this.width = w;
        this.height = h;
        this.viewManager.resize(w,h);
    }

});

module.exports = SpookyRouter;