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

        this.before('initialize', function(node, options) {
            if (!options.element.value) {
                options.element.value = 'Enter Text';
            }

            if (!options.element.align) {
                options.element.align = 'left';
            }

            if (!options.element.color) {
                options.element.color = 'dark';
            }
        });

        this.after('initialize', function () {
            this.$node.html(template());

            this.on('elementUpdated', this.onElementUpdated);
            this.on('changeEditing', this.onChangeEditing);
            this.on('sizeChanged', this.onSizeChanged);
            this.on(document, 'toolSelected', this.onToolSelected);

            var field = this.select('editableSelector')
                .html(this.attr.element.value)
                .on('click', this.onClick)
                .on('change keydown keyup blur', this.onChange.bind(this));

            this.updateFontSize();
                
            if (this.attr.allowEditing) {

                if (this.attr.element.editing) {
                    this.trigger('changeEditing', { editing:true });
                    this.attr.element.editing = false;
                    this.trigger('updateElement', { element:this.attr.element });
                }
            }
        });

        this.onToolSelected = function(event, data) {
            if (data.element === this.attr.element) {
                this.attr.element[data.key] = data.value;
                this.trigger('updateElement', { element: this.attr.element });
            }
        };

        this.onChangeEditing = function(event, data) {
            if (data.editing) {
                this.select('editableSelector')
                    .attr('contenteditable', true)
                    .focus();
            } else {
                this.select('editableSelector').removeAttr('contenteditable');
            }
        };

        this.onElementUpdated = function(event, data) {
            event.stopPropagation();

            this.attr.element = data.element;

            this.reposition();
            this.updateFontSize();
            this.select('editableSelector').html(data.element.value);
        };

        this.updateFontSize = function(event, data) {
            this.select('editableSelector')
                .css('textAlign', this.attr.element.align)
                .css('fontSize', (5 + this.attr.element.size) + 'em');
            this.$node.toggleClass('color-light', this.attr.element.color === 'light');
            this.$node.toggleClass('color-alternate', this.attr.element.color === 'alternate');
        };

        this.onSizeChanged = function(event, data) {
            this.updateFontSize();
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

                if ((event.type === 'change' || event.type === 'blur') && $.trim($target.text()).length === 0) {
                    $target.html('Enter Text');
                    this.trigger('updateElement', { element: this.attr.element });
                }
            }
        };
    }

});
