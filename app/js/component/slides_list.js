define(function (require) {

    'use strict';

    /**
     * Module dependencies
     */

    var defineComponent = require('flight/lib/component');
    var SlideEditor = require('component/slide_editor/slide_editor');
    var withStorage = require('flight-storage/adapters/local-storage');
    var template = require('tpl!./slides_list');
    var increment = 0;

    /**
     * Module exports
     */

    return defineComponent(SlidesList, withStorage);

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

            this.on(document, 'createSlide', this.onCreateSlide);
            this.on(document, 'updateSlide', this.onUpdateSlide);
            this.on(document, 'selectSlide', this.onSelectSlide);
            this.on(document, 'updateSlideAspectRatio', this.onUpdateSlideAspectRatio)
            this.on('updateSlideAspectRatio', this.onUpdateSlideAspectRatioInList)
            this.on('click', this.onClick);

            this.slides = this.attr.slides;
            this.slides.forEach(this.addSlide.bind(this));
            this.onUpdateSlideAspectRatio = _.debounce(this.onUpdateSlideAspectRatio.bind(this), 500);

            if (this.slides.length) {
                this.trigger('selectSlide', { index: 0, slide: this.slides[0] })
            }
        });

        this.onClick = function(event) {
            var $target = $(event.target),
                listElement = $target.closest('.slide-editor');
            if (listElement.length) {
                var index = this.select('listSelector').find('li').index(listElement);
                this.trigger('selectSlide', {
                    index: index,
                    slide: this.slides[index]
                });
            } else {
                this.trigger('createSlide');
            }
        };

        this.onUpdateSlideAspectRatioInList = function(event) { 
            event.stopPropagation(); 
        };

        this.onUpdateSlideAspectRatio = function(event, data) {
            var listWidth = this.$node.width(),
                scale = listWidth / data.width;

            this.$node.find('li').css({
                    height: listWidth / data.ratio
                })
                .find('.content').css({
                    width: data.width,
                    height: data.height,
                    transform: 'scale(' + scale + ')'
                });
        };

        this.onSelectSlide = function(event, data) {
            var list = this.select('listSelector');
            
            list.find('.active').removeClass('active')
            list.find('.slide-editor').eq(data.index).addClass('active');
        };

        this.onCreateSlide = function(event, data) {
            var newSlide = this.defaultSlide(data && data.options);
            this.slides.push(newSlide);
            this.addSlide(newSlide);
            this.trigger('selectSlide', { 
                index: this.slides.length - 1, 
                slide: newSlide
            });
        };

        this.addSlide = function(slide) {
            var idIncrement = slide.id.match(/(\d+)$/);
            if (idIncrement && idIncrement.length === 2) {
                var number = +idIncrement[1];
                increment = number + 1;
            }
            SlideEditor.attachTo($('<li>').addClass(slide.id + ' viewing').appendTo(this.select('listSelector')), {
                allowEditing: false,
                slide: slide
            });
        };

        this.onUpdateSlide = function(event, data) {
            var slides = this.slides;

            slides.forEach(function(slide, i) {
                if (slide.id === data.id) {
                    slides[i] = data;
                    return false;
                }
            });

            this.set('slides', slides);

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
