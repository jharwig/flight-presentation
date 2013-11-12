define(function (require) {

    'use strict';

    /**
     * Module dependencies
     */

    var defineComponent = require('flight/lib/component');
    var SlideEditor = require('component/slide_editor/slide_editor');
    var template = require('tpl!./slides_list');
    var increment = 0;

    /**
     * Module exports
     */

    return defineComponent(SlidesList);

    /**
     * Module function
     */

    function SlidesList() {

        this.defaultAttrs({
            slides:[],
            listSelector: 'ol'
        });

        this.after('initialize', function () {
            this.$node.addClass('slide-list').html(template());

            this.onUpdateSlideAspectRatio = _.debounce(this.onUpdateSlideAspectRatio.bind(this), 500);

            this.on(document, 'createSlide', this.onCreateSlide);
            this.on(document, 'updateSlide', this.onUpdateSlide);
            this.on(document, 'updateSlideAspectRatio', this.onUpdateSlideAspectRatio)
            this.on('updateSlideAspectRatio', this.onUpdateSlideAspectRatioInList)
        });

        this.onUpdateSlideAspectRatioInList = function(event) { 
            event.stopPropagation(); 
        };

        this.onUpdateSlideAspectRatio = function(event, data) {
            var listWidth = this.$node.width(),
                scale = listWidth / data.width;

            console.log(data)
            this.$node.find('li').css({
                    height: data.aspect / listWidth
                })
                .find('.content').css({
                    width: data.width,
                    height: data.height,
                    transform: 'scale(' + scale + ')'
                });
        };

        this.onCreateSlide = function(event, data) {
            var newSlide = this.defaultSlide(data && data.options);
            this.attr.slides.push(newSlide);
            this.trigger('selectSlide', { 
                index: this.attr.slides.length - 1, 
                slide: newSlide
            });

            SlideEditor.attachTo($('<li>').addClass(newSlide.id).appendTo(this.select('listSelector')), {
                allowEditing: false,
                slide: newSlide
            });
        };

        this.onUpdateSlide = function(event, data) {
            var slides = this.attr.slides;

            slides.forEach(function(slide, i) {
                if (slide.id === data.id) {
                    slides[i] = data;
                    return false;
                }
            });

            console.log('trigger', 'updateSlide', data);
            this.trigger(this.listElementForSlide(data.slide), 'slideUpdated', data);
        };

        this.listElementForSlide = function(slide) {
            return this.$node.find('.' + slide.id);
        };

        this.defaultSlide = function(options) {
            return $.extend({
                id: 'slide_' + increment++
            }, options || {});
        };
    }

});
