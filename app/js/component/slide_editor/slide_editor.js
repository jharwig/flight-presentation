define(function (require) {

  'use strict';

  /**
   * Module dependencies
   */

  var defineComponent = require('flight/lib/component');
  var template = require('tpl!./slide_editor');
  var SlideEditorToolbar = require('./slide_editor_toolbar');
  var TextElement = require('./elements/text');

  /**
   * Module exports
   */

  return defineComponent(slideEditor);

  /**
   * Module function
   */

  function slideEditor() {
    this.defaultAttrs({
        toolbarSelector: '.btn-toolbar',
        contentSelector: '.content'
    });

    this.after('initialize', function () {
        this.$node.html(template());

        SlideEditorToolbar.attachTo(this.select('toolbarSelector'));

        this.on('click', this.onClick);
    });

    this.onClick = function(event) {
        var content = this.select('contentSelector');

        console.log(event.fromElement, event.toElement);

        if ($(event.target).is(content)) {
            TextElement.attachTo(
                $('<div class="element"/>')
                    .css({
                        left: event.offsetX,
                        top: event.offsetY
                    })
                    .appendTo(this.select('contentSelector'))
            );
        }
    };
  }

});
