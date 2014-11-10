'use strict';

requirejs.config({
  baseUrl: '',
  urlArgs: "bust=" + (new Date()).getTime(), 
  paths: {
    'flight': '../bower_components/flight',
    'flight-storage': '../bower_components/flight-storage/lib',
    'videojs': '../bower_components/videojs/dist/viewo-js/video',
    'component': 'js/component',
    'highlight': '../bower_components/highlightjs/highlight.pack',
    'page': 'js/page',
    'text': '../bower_components/requirejs-text/text',
    'hogan': '../bower_components/requirejs-hogan-plugin/hogan',
    'tpl': '../bower_components/requirejs-hogan-plugin/hgn',
    'rangy': '../bower_components/rangy/rangy-core'
  },
  shim: {
    'rangy': { exports:'rangy' },
    'highlight': { exports: 'hljs' }
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

    //debug.enable(true);
    //DEBUG.events.logByAction('trigger');
    //DEBUG.events.logAll();
    


    require(['page/app'], function(initializeApp) {
      initializeApp();
    });
  }
);
