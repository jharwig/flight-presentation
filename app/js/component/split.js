define(function (require) {

  'use strict';

  /**
   * Module dependencies
   */

  var defineComponent = require('flight/lib/component');
  var template = require('tpl!./split');
  var SlidesList = require('component/slides_list');
  var SlideEditor = require('component/slide_editor/slide_editor');

  /**
   * Module exports
   */

  return defineComponent(split);

  /**
   * Module function
   */

  function split() {
    this.defaultAttrs({
        slidesListSelector: '.slides-list',
        slideEditorSelector: '.slide-editor'
    });

    this.after('initialize', function () {
        this.$node.html(template());

        SlidesList.attachTo(this.select('slidesListSelector'));
        SlideEditor.attachTo(this.select('slideEditorSelector'));




    });
  }

});
