define(function (require) {

  'use strict';

  /**
   * Module dependencies
   */

  var Split = require('component/split');

  /**
   * Module exports
   */

  return initialize;

  /**
   * Module function
   */

  function initialize() {
      Split.attachTo(document.body);
  }

});
