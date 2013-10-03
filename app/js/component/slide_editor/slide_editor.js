define(function (require) {

  'use strict';

  /**
   * Module dependencies
   */

  var defineComponent = require('flight/lib/component');
  var template = require('tpl!./slide_editor');
  var SlideEditorToolbar = require('./slide_editor_toolbar');

  /**
   * Module exports
   */

  return defineComponent(slideEditor);

  /**
   * Module function
   */

  function slideEditor() {
    this.defaultAttrs({
        toolbarSelector: '.btn-toolbar'
    });

    this.after('initialize', function () {
        this.$node.html(template());

        SlideEditorToolbar.attachTo(this.select('toolbarSelector'));
    });
  }

});
