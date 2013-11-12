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
    'tpl': 'bower_components/requirejs-hogan-plugin/hgn',
    'rangy': 'bower_components/rangy/rangy-core'
  },
  shims: {
    'rangy': { exports:'rangy' }
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
    compose.mixin(registry, [advice.withAdvice, withLogging]);

    debug.enable(true);
    DEBUG.events.logByAction('trigger');

    require(['page/app'], function(initializeApp) {
      initializeApp();
    });
  }
);
