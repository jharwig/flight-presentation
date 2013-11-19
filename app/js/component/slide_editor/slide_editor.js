define(function (require) {

    'use strict';

    /**
     * Module dependencies
     */

    var defineComponent = require('flight/lib/component');
    var template = require('tpl!./slide_editor');
    var SlideEditorToolbar = require('./slide_editor_toolbar');
    var DragAndDrop = require('component/util/dnd');
    var withStorage = require('flight-storage/adapters/local-storage');

    /**
     * Module exports
     */

    return defineComponent(SlideEditor, withStorage);

    /**
     * Module function
     */

    function SlideEditor() {
        this.defaultAttrs({
            toolbarSelector: '.btn-toolbar',
            contentSelector: '.content',
            scalingSelector: '.scaling',
            elementSelector: '.element',
            noSlideSelector: '.no-slide',
            allowEditing: true
        });

        this.after('initialize', function () {
            this.$node.addClass('slide-editor').html(template());

            this.on('click', {
                noSlideSelector: this.createSlide,
                elementSelector: this.onElementClick
            });
            this.on('slideUpdated', this.onSlideUpdated);
            this.on('removeElement', this.onRemoveElement);
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
                this.onResize();
            }


            this.setScaling = _.debounce(this.setScaling.bind(this), 100);
            this.setScaling();

            DragAndDrop.attachTo(this.select('contentSelector'));

            this.setSlide(this.attr.slide);
        });

        this.onFileUploading = function(event, data) {
            this.uploadInfo = data;
        };

        this.setScaling = function() {
            var scaling = this.select('scalingSelector'),
                content = this.select('contentSelector'),
                containerSize = this.get('containerSize'),
                width = content.width();

            if (containerSize) {
                scaling.css('fontSize', width / containerSize * 100 + '%');
            } else {
                this.set('containerSize', width);
            }
        }

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
            this.onResize();
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
            this.select('scalingSelector').empty();
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
                width = desiredWidth;
                ratio = this.attr.aspectRatio;
            }

            this.setScaling();
            this.trigger('updateSlideAspectRatio', { ratio:ratio, width:width, height:height });
        };

        this.onUpdateElement = function(event, data) {
            if (!this.attr.slide.elements) {
                this.attr.slide.elements = {};
            }

            this.attr.slide.elements[data.element.id] = data.element;
            this.trigger('updateSlide', { slide:this.attr.slide });
            this.trigger('slideUpdated', { slide: this.attr.slide });
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
                slide = this.attr.slide,
                toRemove = this.select('elementSelector');

            Object.keys(slide.elements || []).forEach(function(elementKey) {
                toRemove = toRemove.not('.' + elementKey);
                self.trigger('elementUpdated', { element: slide.elements[elementKey] });
            });

            toRemove.remove();
        };

        this.onRemoveElement = function(event, data) {
            delete this.attr.slide.elements[data.element.id]
            this.trigger('updateSlide', { slide: this.attr.slide });
            this.trigger('slideUpdated', { slide: this.attr.slide });
            this.trigger('selectElement', {});
        };

        this.onElementUpdated = function(event, data) {
            var self = this,
                element = data.element,
                elementNode = this.$node.find('.' + element.id);


            if (elementNode.length) { 
                this.trigger(elementNode, 'elementUpdated', data);
            } else {
                require(['component/slide_editor/elements/' + element.elementType], function(Element) {

                    var node = $('<div class="element" ' + (self.attr.allowEditing ? ('draggable="true"') : '') + '"/>')
                        .css({
                            left: element.position.x * 100 + '%',
                            top: element.position.y * 100 + '%',
                        }).appendTo(self.select('scalingSelector'));

                    if (self.attr.allowEditing) {
                        node.attr('tabindex', 1);
                    }

                    Element.attachTo(node, {
                        allowEditing: self.attr.allowEditing,
                        element: element,
                        toolOptions: data.toolOptions
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
            this.currentToolOptions = data.toolOptions || {};
        };

        this.createSlide = function(event) {
            this.trigger('createSlide');
        };

        this.onElementClick = function(event) {
            if (!this.attr.allowEditing) return;

            var $target = $(event.target),
                elementNode = $target.closest('.element'),
                elementId = elementNode.data('elementId'),
                element = this.attr.slide.elements[elementId];

            this.trigger('selectElement', { element:element });
        };

        this.addElement = function(event) {
            var $target = $(event.target);

            debugger;
            if (!this.currentTool) {
                if ($target.closest('.element').length === 0) {
                    this.trigger('selectElement', {});
                }
                return;
            }

            var parent = this.$node,
                offset = parent.offset(),
                parentWidth = parent.width(),
                parentHeight = parent.height();

            this.trigger('elementUpdated', { 
                element: {
                    elementType: this.currentTool,
                    position: {
                        x: (event.offsetX - offset.left) / parentWidth,
                        y: (event.offsetY - offset.top) / parentHeight
                    },
                    editing: true
                },
                toolOptions: this.currentToolOptions
            });

            this.currentTool = null;
            this.onResize();
        };
    }

});
