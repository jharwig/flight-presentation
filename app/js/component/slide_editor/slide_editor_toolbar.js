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
            toolSelector: '.tools',
            textToolsSelector: '.align'
        });

        this.after('initialize', function () {
            this.$node.html(template());

            this.select('textToolsSelector').hide();

            this.on('click', {
                toolSelector: this.onToolClick,
                textToolsSelector: this.onTextToolClick
            })
            this.on(document, 'selectElement', this.onSelectElement);
        });

        this.onSelectElement = function(event, data) {
            var tools = this.select('textToolsSelector');

            if (data.element) {
                if (data.element.elementType === 'text') {
                    tools.find('button').each(function() {
                        var name = $(this).data('tool');
                        $(this).toggleClass('active', data.element.align === name);
                    });
                    tools.show();
                }
            } else {
                tools.hide();
            }
        };

        this.onTextToolClick = function(event) {
            this.select('textToolsSelector').find('.active').removeClass('active');

            var tool = $(event.target).closest('button')
                .addClass('active')
                .data('tool');
            this.trigger('toolSelected', { key:'align', value:tool });
        };

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
