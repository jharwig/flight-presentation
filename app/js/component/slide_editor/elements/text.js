define(function (require) {

  'use strict';

  /**
   * Module dependencies
   */

  var defineComponent = require('flight/lib/component');
  var template = require('tpl!./text');

  /**
   * Module exports
   */

  return defineComponent(text);

  /**
   * Module function
   */

  function text() {
    this.defaultAttrs({
        editableSelector: '.editable'
    });

    this.after('initialize', function () {
        this.$node.html(template());

        this.select('editableSelector').focus();
    });
  }

});
