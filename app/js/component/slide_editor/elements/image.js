define(function (require) {

    'use strict';

    /**
     * Module dependencies
     */

    var defineComponent = require('flight/lib/component');
    var template = require('tpl!./image');
    var withElements = require('./with_elements');
    var withStorage = require('flight-storage/adapters/local-storage');

    /**
     * Module exports
     */

    return defineComponent(ImageElement, withElements, withStorage);

    /**
     * Module function
     */

    function ImageElement() {
        this.defaultAttrs({
           // editableSelector: '.editable'
        });

        this.after('initialize', function () {
            //this.$node.html(template());
            this.$node.addClass('image');

            this.on('elementUpdated', this.onElementUpdated);

            this.setImageSrc();

            //this.trigger('updateElement', { element:this.attr.element });
        });

        this.setImageSrc = function() {

            if (this.imageSet) return;

            var field = this.$node, //select('editableSelector'),
                storageKey = this.attr.element.value,
                dataUri = this.get(storageKey);

            if (dataUri) {
                this.imageSet = true;
                console.log('setting', this.node);

                var i = new Image(), self = this;
                i.onload = function() {
                    field.css({
                        backgroundImage: 'url("' + dataUri + '")'
                    });
                    self.trigger('updateElement', { element: self.attr.element });
                };
                i.src = dataUri;
            }
        };

        this.onElementUpdated = function(event, data) {
            event.stopPropagation();

            this.attr.element = data.element;

            this.reposition();
            this.setImageSrc();
        };
    }
});
