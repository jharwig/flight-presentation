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

    return defineComponent(Logger, withElements);

    /**
     * Module function
     */

    function Logger() {
        this.defaultAttrs({
            editableSelector: '.editable'
        });

        this.before('initialize', function(node, options) {
            if (!options.element.value) {
                options.element.value = [];
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
                .html('waiting for events...')
                .on('dblclick', this.onDoubleClick.bind(this));

            this.updateFontSize();
                
            if (this.attr.allowEditing) {

                if (this.attr.element.editing) {
                    this.trigger('changeEditing', { editing:true });
                    this.attr.element.editing = false;
                    this.trigger('updateElement', { element:this.attr.element });
                }
            }

            this.addEvents();
        });

        this.after('teardown', function(){
            $(document).off('.logger');
        });


        this.onDoubleClick = function(event) {
            var result = prompt("Please enter events to listen for on document",this.attr.element.value || '');
            this.attr.element.value = result && result.split(/\s*,\s*/) || [];

            this.trigger('updateElement', { element:this.attr.element });
        };

        this.onToolSelected = function(event, data) {
            if (data.element === this.attr.element) {
                this.attr.element[data.key] = data.value;
                this.trigger('updateElement', { element: this.attr.element });
            }
        };

        this.onChangeEditing = function(event, data) {
            if (data.editing) {
            } else {
            }
        };

        this.onElementUpdated = function(event, data) {
            event.stopPropagation();

            this.attr.element = data.element;

            this.addEvents();
            this.reposition();
            this.updateFontSize();
        };

        this.logEvent = function(event, data) {
            var field = this.select('editableSelector');

            if (data) {
                data = JSON.stringify(data);
            }

            if (field.text().toLowerCase() === 'waiting for events...') {
                field.empty();
            }
            this.select('editableSelector').prepend('<div>' + event.type + ', <small><code>' + (data || '{}') + '</code></small></div>')
        };

        this.addEvents = function() {
            var self = this;

            $(document).off('.logger');
            this.attr.element.value.forEach(function(e) {
                $(document).on(e + '.logger', self.logEvent.bind(self))
            });
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

    }
});
