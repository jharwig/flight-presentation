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

    return defineComponent(SlideEditor);

    /**
     * Module function
     */

    function SlideEditor() {
        this.defaultAttrs({
            toolbarSelector: '.btn-toolbar',
            contentSelector: '.content',
            allowEditing: true
        });

        this.after('initialize', function () {
            this.$node.html(template());

            if (this.attr.allowEditing) {
                SlideEditorToolbar.attachTo(this.select('toolbarSelector'));
                this.on('click', this.onClick);
            }
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
