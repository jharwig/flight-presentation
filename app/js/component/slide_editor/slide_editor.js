define(function (require) {

    'use strict';

    /**
     * Module dependencies
     */

    var defineComponent = require('flight/lib/component');
    var template = require('tpl!./slide_editor');
    var SlideEditorToolbar = require('./slide_editor_toolbar');
    var DragAndDrop = require('component/util/dnd');

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
            noSlideSelector: '.no-slide',
            allowEditing: true
        });

        this.after('initialize', function () {
            this.$node.addClass('slide-editor').html(template());

            this.on('click', {
                noSlideSelector: this.createSlide
            });
            this.on('slideUpdated', this.onSlideUpdated);
            this.on('setSlide', this.onSetSlide);
            this.on('elementUpdated', this.onElementUpdated);
            this.on('updateElement', this.onUpdateElement);
            this.on('changeTool', this.onChangeTool);
            this.on('dragenter', this.onDragEnter);
            this.on('dragover', this.onDragOver);
            this.on('drop', this.onDrop);
            this.on('dnd-uploading', this.onFileUploading);
            this.on('dnd-uploaded', this.onFileUploaded);

            if (this.attr.allowEditing) {
                this.on(document, 'selectSlide', this.onSelectSlide);
                this.on(window, 'resize', _.debounce(this.onResize.bind(this), 250));
                SlideEditorToolbar.attachTo(this.select('toolbarSelector'));
                this.on('click', {
                    contentSelector: this.addElement
                });
                _.defer(this.onResize.bind(this));
            }

            DragAndDrop.attachTo(this.select('contentSelector'));

            this.setSlide(this.attr.slide);
        });

        this.onFileUploading = function(event, data) {
            this.uploadInfo = data;
        };

        this.onFileUploaded = function(event, data) {
            var file = this.uploadInfo.file,
                key = file.type + '-' + file.name;

            this.trigger('storage-save', {
                key: key,
                value: data.result
            });

            this.trigger('elementUpdated', { 
                element: {
                    elementType: 'image',
                    value: key,
                    position: this.uploadInfo.position
                }
            });
        };

        this.onDragEnter = function(event) {
            event.preventDefault();
        };
        this.onDragOver = function(event) {
            event.preventDefault();
        };
        this.onDrop = function(event) {
            var e = event.originalEvent || event;
            event.stopPropagation();
        };

        this.setSlide = function(slide) {
            this.attr.slide = slide;
            this.$node.toggleClass('no-slide', !slide);
            this.select('contentSelector').empty();
            this.updateElements();
        };

        this.onResize = function(event) {
            var content = this.select('contentSelector'),
                width = content.width(),
                height = content.height(),
                ratio = width / height;
                

            if (this.attr.aspectRatio) {
                var desiredWidth = height * this.attr.aspectRatio;

                content.width(desiredWidth);
                ratio = this.attr.aspectRatio;
            }

            this.trigger('updateSlideAspectRatio', { ratio:ratio, width:width, height:height });
        };

        this.onUpdateElement = function(event, data) {
            if (!this.attr.slide.elements) {
                this.attr.slide.elements = {};
            }

            this.attr.slide.elements[data.element.id] = data.element;
            this.trigger('updateSlide', { slide:this.attr.slide });
        };

        this.onSetSlide = function(event, data) {
            this.setSlide(data.slide);
        };

        this.onSlideUpdated = function(event, data) {
            this.attr.slide = data.slide;
            this.updateElements();
        };

        this.updateElements = function() {
            var self = this,
                slide = this.attr.slide;

            Object.keys(slide.elements || []).forEach(function(elementKey) {
                self.trigger('elementUpdated', { element: slide.elements[elementKey] });
            });
        };

        this.onElementUpdated = function(event, data) {
            var self = this,
                element = data.element,
                elementNode = this.$node.find('.' + element.id);


            if (elementNode.length) { 
                this.trigger(elementNode, 'elementUpdated', data);
            } else {
                require(['component/slide_editor/elements/' + element.elementType], function(Element) {

                    var node = $('<div class="element" draggable="true"/>')
                        .css({
                            left: element.position.x * 100 + '%',
                            top: element.position.y * 100 + '%',
                        }).appendTo(self.select('contentSelector'));

                    Element.attachTo(node, {
                        allowEditing: self.attr.allowEditing,
                        element: element
                    });
                });
            }

            event.stopPropagation();
        };

        this.onSelectSlide = function(event, data) {
            this.setSlide(data.slide);
        };

        this.onChangeTool = function(event, data) {
            this.currentTool = data.tool;
        };

        this.createSlide = function(event) {
            this.trigger('createSlide');
        };

        this.addElement = function(event) {
            var content = this.select('contentSelector');

            if (!this.currentTool) {
                return;
            }

            if ($(event.target).is(content)) {
                var parent = this.$node,
                    parentWidth = parent.width(),
                    parentHeight = parent.height();

                this.trigger('elementUpdated', { 
                    element: {
                        elementType: this.currentTool,
                        position: {
                            x: event.offsetX / parentWidth,
                            y: event.offsetY / parentHeight
                        },
                        editing: true
                    }
                });

                this.onResize();
                this.currentTool = null;
            }
        };
    }

});
