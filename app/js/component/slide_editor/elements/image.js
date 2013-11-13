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
        });

        this.setImageSrc = function() {
            var field = this.$node, //select('editableSelector'),
                storageKey = this.attr.element.value,
                oldSrc = field.css('backgroundImage'),
                dataUri = this.get(storageKey);

            if (dataUri && oldSrc !== dataUri) {
                var i = new Image();
                i.onload = function() {
                    field.css({
                        //width: i.naturalWidth,
                        //height: i.naturalHeight,
                        backgroundImage: 'url("' + dataUri + '")'
                    });
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
