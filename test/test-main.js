'use strict';

var tests = Object.keys(window.__karma__.files).filter(function (file) {
  return (/\.spec\.js$/.test(file));
});

requirejs.config({
  // Karma serves files from '/base'
  baseUrl: '/base',

  paths: {
    'flight': 'app/bower_components/flight',
    'flight-storage': 'app/bower_components/flight-storage/lib',
    'component': 'app/js/component',
    'highlight': 'app/bower_components/highlightjs/highlight.pack',
    'page': 'app/js/page',
    'text': 'app/bower_components/requirejs-text/text',
    'hogan': 'app/bower_components/requirejs-hogan-plugin/hogan',
    'tpl': 'app/bower_components/requirejs-hogan-plugin/hgn',
    'rangy': 'app/bower_components/rangy/rangy-core'
  },

  shim: {
    'rangy': { exports:'rangy' },
    'highlight': { exports: 'hljs' }
  },

  // ask Require.js to load these files (all our tests)
  deps: tests,

  // start test run, once Require.js is done
  callback: window.__karma__.start
});
