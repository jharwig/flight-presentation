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
            this.on('changeEditing', this.onChangeEditing);
            this.on('sizeChanged', this.onSizeChanged);

            this.setImageSrc();

            //this.trigger('updateElement', { element:this.attr.element });
        });

        this.onChangeEditing = function(event, data) {
            if (data.editing) {

            } else {
                var element = this.attr.element,
                    offsetParent = this.$node.offsetParent(),
                    w = this.$node.width(),
                    h = this.$node.height();

                if (element.width !== w || element.height !== h) {
                    var p = {
                        x: w / offsetParent.width(),
                        y: h / offsetParent.height()
                    };
                    this.snapPercent(p);
                    element.width = p.x;
                    element.height = p.y;
                    this.trigger('updateElement', { element:element });
                }
            }
        };

        this.onSizeChanged = function(event, data) {
            var offsetParent = this.$node.offsetParent(),
                element = this.attr.element,
                size = data.size * 25;
            element.width = size / offsetParent.width();
            element.height = size / offsetParent.width();
            this.$node.css({
                width: size,
                height: size
            })
            this.trigger('updateElement', { element:element });
        };

        this.setImageSrc = function() {

            if (this.imageSet) return;

            var field = this.$node, //select('editableSelector'),
                storageKey = this.attr.element.value,
                dataUri = this.get(storageKey);

            if (dataUri) {
                this.imageSet = true;

                var i = new Image(), self = this;
                i.onload = function() {
                    field.css({
                        backgroundImage: 'url("' + dataUri + '")',
                        width: self.attr.element.width * 100 + '%',
                        height: self.attr.element.height * 100 + '%'
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
