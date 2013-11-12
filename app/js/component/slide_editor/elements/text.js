define(function (require) {

    'use strict';

    /**
     * Module dependencies
     */

    var defineComponent = require('flight/lib/component');
    var withElements = require('./with_elements');
    var template = require('tpl!./text');
    var rangy = require('rangy');

    /**
     * Module exports
     */

    return defineComponent(Text, withElements);

    /**
     * Module function
     */

    function Text() {
        this.defaultAttrs({
            editableSelector: '.editable'
        });

        this.after('initialize', function () {
            this.$node.html(template());

            this.on('elementUpdated', this.onElementUpdated);

            var field = this.select('editableSelector')
                .attr('disabled', true)
                .html(this.attr.element.value)
                .on('change keydown keyup', this.onChange.bind(this));
                
            if (this.attr.allowEditing) {
                field.attr('disabled', false);
            }
            if (this.attr.element.editing) {
                field.focus();
                this.attr.element.editing = false;
            }
        });

        this.onElementUpdated = function(event, data) {
            event.stopPropagation();

            var element = data.element;

            this.select('editableSelector').html(element.value)
            this.$node.css({
                left: element.position.x * 100 + '%',
                top: element.position.y * 100 + '%'
            });
        };

        this.onChange = function(event) {
            var sendChangeEvent = true;

            if (event.type === 'keydown' && event.metaKey) {
                var handled = true;
                sendChangeEvent = false;
                switch (event.which) {
                    case 66: document.execCommand('bold'); break;
                    case 73: document.execCommand('italics'); break;
                    case 79: document.execCommand('insertOrderedList'); break;
                    case 85: document.execCommand('insertUnorderedList'); break;
                        /*
                    case 187: 
                        debugger;
                        var selection = window.getSelection();
                        if (selection.rangeCount === 1) {
                            selection.getRangeAt(0).surroundContents(document.createElement('big'));
                            sendChangeEvent = true;
                        } else {
                            debugger;
                            rangy.createRange().selectNode(this.select('editableSelector')[0]).surroundContents(document.createElement('big'))
                        }
                        break;
                        */

                    default: handled = false;
                }

                if (handled) {
                    event.preventDefault();
                    event.stopPropagation();
                }
            }

            if (sendChangeEvent) {
                var $target = $(event.target);

                this.attr.element.value = $target.html();

                this.trigger('updateElement', { element: this.attr.element });
            }
        };
    }

});
