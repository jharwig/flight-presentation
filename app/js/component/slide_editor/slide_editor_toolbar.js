define(function (require) {

    'use strict';

    /**
     * Module dependencies
     */

    var defineComponent = require('flight/lib/component');
    var template = require('tpl!./slide_editor_toolbar');

    /**
     * Module exports
     */

    return defineComponent(editorToolbar);

    /**
     * Module function
     */

    function editorToolbar() {
        this.defaultAttrs({
            toolSelector: '.tools'
        });

        this.after('initialize', function () {
            this.$node.html(template());

            this.on('click', {
                toolSelector: this.onToolClick
            })
        });

        this.onToolClick = function(event) {
            var $target = $(event.target),
                button = $target.closest('button'),
                toolName = button.data('tool');

            if (toolName) {
                this.trigger('changeTool', { tool:toolName });
            }
        }
    }

});
