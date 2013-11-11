'use strict';

requirejs.config({
  baseUrl: '',
  urlArgs: "bust=" + (new Date()).getTime(), 
  paths: {
    'flight': 'bower_components/flight',
    'component': 'js/component',
    'page': 'js/page',
    'text': 'bower_components/requirejs-text/text',
    'hogan': 'bower_components/requirejs-hogan-plugin/hogan',
    'tpl': 'bower_components/requirejs-hogan-plugin/hgn'
  }
});

require(
  [
    'flight/lib/compose',
    'flight/lib/registry',
    'flight/lib/advice',
    'flight/lib/logger',
    'flight/lib/debug'
  ],

  function(compose, registry, advice, withLogging, debug) {
    debug.enable(true);
    compose.mixin(registry, [advice.withAdvice, withLogging]);

    require(['page/app'], function(initializeApp) {
      initializeApp();
    });
  }
);
