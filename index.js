var mixes = require('mixes');
var isUndefined = require('is-undefined');
var isFunction = require('is-function');
var _assign = require('lodash.assign');
var on = require('dom-events').on;
var ViewManager = require('spooky-view-manager');
var Route = require('route-parser');
var Signal = require('signals').Signal;
var model = require('spooky-model');
var SpookyElement = require('spooky-element');
var createHistory = require('history').createBrowserHistory

var SpookyRouter = function() {
    this.onRouteNotFound = new Signal();
    this.onRouteChanged = new Signal();
    this.onParamsChanged = new Signal();
    this.width = 0;
    this.height = 0;
}

mixes(SpookyRouter, {

    init: function(container, initRoutes, width, height, overlapViews) {
      this.container = container;
      this.routes = {};
      this.width = width;
      this.height = height;
      this.viewManager = new ViewManager(container, overlapViews);
      this.updateURL = true;
      // init routes
      if (initRoutes && isFunction(initRoutes)) {
          initRoutes.call(this);
      }
      // Create history
      this.history = createHistory({
          basename: '', // The base URL of the app (see below) 
          forceRefresh: false
      });
      this.hashChangeHandler = this.hashChangeHandler.bind(this);
      this.history.listen(this.hashChangeHandler);
      this.hashChangeHandler();
      return this;
    },

    add: function(name, pattern, config) {
      config = config || {};
      var route = {
          name: name,
          route: new Route(pattern),
          config: config,
          history: {}
      }
      this.routes[name] = route;
      return this;
    },

    hashChangeHandler: function() {
      var path = this.history.location.pathname;
      this.matchPath(path);
    },

    getHashPath: function() {
      var path = this.history.location.pathname
      return path;
    },

    pushPath: function(path) {
      this.history.push(path);
    },

    go: function(name, params, updateURL) {
      // if updateURL is not defined, use router
      if (isUndefined(updateURL)) {
          updateURL = this.updateURL;
      }
      var path = this.generatePath(name, params);
      if (!path) return;
      // Check if route parameters have an updateURL property
      var route = this.routes[name];
      if (route && route.config && route.config.updateURL === false) {
          // Make sure not to update hash
          updateURL = false;
      }
      // Sometimes the hash path might still be the same,
      // For example when the new section has a updateURL set to false and we want to go back
      if (updateURL && this.getHashPath() !== path) {
          this.pushPath(path);
      } else {
          this.matchPath(path);
      }
    },

    generatePath: function(name, params) {
      var route = this.routes[name];
      if (route) {
          return route.route.reverse(params);
      }
    },

    matchPath: function(path) {
      var matched = false;
      for (var routeKey in this.routes) {
          var route = this.routes[routeKey];
          var match = route.route.match(path);
          if (match) {
              matched = true;
              this.pathMatched(match, route);
              return false;
          }
      }
      // No match
      if (!matched) {
          this.onRouteNotFound.dispatch(path);
      }
    },

    pathMatched: function(match, route) {
      var configParams = route.config.params || {};
      var params = _assign(configParams, match);
      route.history.params = match;
      if (route == this.currentRoute) {
          // The route is the same, meaning parameters have changed
          if (isFunction(this.currentView.paramsChanged)) this.currentView.paramsChanged(params);
          return;
      }
      // Update params
      //route.config.params = match;
      if (this.currentRoute && this.currentRoute.config && this.currentRoute.config.floatingView) {
          // TODO: Call a function on a floating view
      }
      if (route == this.viewManagerCurrentRoute) {
          // This would happen if we are returning from a floatingView route to a regular route
          this.lastRoute = this.currentRoute;
          this.currentRoute = route;
          var previousView = this.currentView;
          this.currentView = this.viewManager.currentView;
          // The route is the same, meaning parameters have changed
          if (isFunction(this.currentView.paramsChanged)) this.currentView.paramsChanged(params);
          this.onRouteChanged.dispatch(route, params);
          return;
      }
      // set current route
      this.lastRoute = this.currentRoute;
      this.currentRoute = route;
      this.onRouteChanged.dispatch(route, params);
      // Change view
      if (route.config.view) {
          var View = route.config.view;
          if (View instanceof SpookyElement && View._isSpookyElement === true) {
              var previousView = this.currentView;
              this.currentView = View;
              if (isFunction(this.currentView.paramsChanged)) this.currentView.paramsChanged(params);
              if (this.currentView != previousView && !route.config.floatingView) {
                  this.viewManager.changeView(this.currentView, false);
                  // Track the current route of the ViewManager to know which route the non-floating views are on
                  this.viewManagerCurrentRoute = this.currentRoute;
              }
          } else {
              var data = model.getContent(route.name);
              data = data || {};
              data = _assign(data, route.config.data);
              this.currentView = new View(data);
              this.currentView.resize(this.width, this.height);
              if (isFunction(this.currentView.paramsChanged)) this.currentView.paramsChanged(params);
              this.viewManager.changeView(this.currentView);
              // Track the current route of the ViewManager to know which route the non-floating views are on
              this.viewManagerCurrentRoute = this.currentRoute;
          }
      }
    },

    resize: function(w, h) {
      this.width = w;
      this.height = h;
      this.viewManager.resize(w, h);
    }

});

module.exports = new SpookyRouter();