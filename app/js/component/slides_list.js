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
            listSelector: 'ol',
            listItemSelector: 'li'
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
            this.slides.forEach(function(s) { this.addSlide(s); }.bind(this));
            this.onUpdateSlideAspectRatio = _.debounce(this.onUpdateSlideAspectRatio.bind(this), 500);

            if (this.slides.length) {
                this.trigger('selectSlide', { index: 0, slide: this.slides[0] });
            }

            var self = this;
            _.defer(function() {
                $(document.body)
                    .on('keydown', function(e) {
                        if ((e.which === 80||e.which==66) && !$(e.target).is('input,textarea,*[contenteditable]')) {
                            $(this)
                                .addClass('animations')
                                .on('webkitTransitionEnd', function() {
                                    $(this).removeClass('animations');
                                });

                            var presenting = $(this).toggleClass('presentation').hasClass('presentation');
                            self.isPresenting = presenting;
                            self.trigger('togglePresenting', { presenting:presenting });
                        }
                    });
            })

            this.on('keydown', this.onKeyDown);
            this.on(document, 'keydown', this.onDocumentKeyDown);
        });

        this.onKeyDown = function(event) {
            var handled = true;
            var active = this.$node.find('.active');
            var index = active.index();

            if (event.altKey) {
                switch (event.which) {
                    case 38: // Up
                        this.move(index, Math.max(0, index-1));
                        var prev = active.prev('li');
                        if (prev.length) active.insertBefore(prev).focus();
                        break;
                    case 40: // Down
                        this.move(index, Math.min(this.slides.length-1, index+2));
                        var next = active.next('li');
                        if (next.length) active.insertAfter(next).focus();
                        break;

                    case 73: // New Slide
                        var newSlide = this.defaultSlide();
                        this.slides.splice(index + 1, 0, newSlide);
                        this.addSlide(newSlide, active);

                    default: handled = false;
                }
            } else handled = false;

            if (handled) {
                event.stopPropagation();
                event.preventDefault();
            }
        };

        this.onDocumentKeyDown = function(event) {
            var handled = true;
            var active = this.$node.find('.active');
            var index = active.index();
            var newIndex;

            if ($(event.target).is('textarea,*[contenteditable]')) return;

            switch (event.which) {

                case 33:
                case 38: // Up
                    newIndex = Math.max(0, index -1)
                    break;

                case 34:
                case 40: // Down
                    newIndex = Math.min(this.slides.length-1, index+1);
                    break;
                default: handled = false;
            }

            if (newIndex !== undefined) {
                this.trigger('selectSlide', { index:newIndex, slide: this.slides[newIndex] });
            }

            if (handled) {
                event.preventDefault();
            }
        };

        this.onClick = function(event) {
            var $target = $(event.target),
                listElement = $target.closest('.slide-editor');
            if (listElement.length) {
                var index = this.select('listSelector').children('li').index(listElement);
                this.trigger('selectSlide', {
                    index: index,
                    slide: this.slides[index]
                });
            } else {
                this.trigger('createSlide');
            }
        };

        this.move = function(index, toIndex) {
            //    Array.prototype.move = function (index, howMany, toIndex) {
            var array = this.slides,
                howMany = 1,
                index = parseInt(index) || 0,
                index = index < 0 ? array.length + index : index,
                toIndex = parseInt(toIndex) || 0,
                toIndex = toIndex < 0 ? array.length + toIndex : toIndex,
                toIndex = toIndex <= index ? toIndex : toIndex <= index + howMany ? index : toIndex - howMany,
                moved;
     
            array.splice.apply(array, [toIndex, 0].concat(moved = array.splice(index, howMany)));

            this.set('slides', array);
        }

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
            this.previousRatio = data;
        };

        this.onSelectSlide = function(event, data) {
            if (!data.slide) return;

            var list = this.select('listSelector');

            list.find('.active').removeClass('active');
            var newItem = list.find('.slide-editor').eq(data.index);


            if (!this.isPresenting) {
                var scroll = newItem.offsetParent();
                var position = newItem.position();
                if (position) {
                    scroll.clearQueue().animate({
                        scrollTop: Math.max(0, newItem.position().top + scroll.scrollTop() - 100)
                    });
                }
            }
            
            newItem.addClass('active').attr('draggable', true);
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

        this.addSlide = function(slide, afterNode) {
            var idIncrement = slide.id.match(/(\d+)$/);
            if (idIncrement && idIncrement.length === 2) {
                var number = +idIncrement[1];
                increment = number + 1;
            }
            
            var li = $('<li tabindex=1>').addClass(slide.id + ' viewing');
            if (afterNode) {
                afterNode.after(li);
                li = afterNode.next('li');
            } else {
                li.appendTo(this.select('listSelector'));
            }

            SlideEditor.attachTo(li, {
                allowEditing: false,
                slide: slide
            });

            if (afterNode) {
                this.trigger(document, 'updateSlideAspectRatio', this.previousRatio);
            }
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
            while($('.slide_' + increment).length > 0) {
                increment++;
            }
            return $.extend({
                id: 'slide_' + increment
            }, options || {});
        };
    }

});
