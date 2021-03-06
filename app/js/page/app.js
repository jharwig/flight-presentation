define(function (require) {

    'use strict';

    var ASPECT_RATIO = 1.6;
    var SLIDE_CONTENT = require('tpl!./slide_content');

    /**
     * Module dependencies
     */
    var Split = require('component/split');
    var template = require('tpl!./app');
    var SlidesList = require('component/slides_list');
    var SlideEditor = require('component/slide_editor/slide_editor');
    var StorageManager = require('flight-storage/manager');
    var LocalStorageManager = require('flight-storage/adapters/local-storage');

    /**
     * Module exports
     */

    return initialize;

    /**
     * Module function
     */

    function initialize() {

        StorageManager.attachTo(document, {
            adapter: 'local-storage',
            saveEvent: 'storage-save',
            getEvent: 'storage-get',
            clearEvent: 'storage-clear'
        });

        var localStorage = new LocalStorageManager(),
            slides = localStorage.get('slides');

        if (!slides) {
            var importJson = JSON.parse(SLIDE_CONTENT({}));
            Object.keys(importJson).forEach(function(key) {
                if (key === 'slides') {
                    slides = importJson[key];
                }
                localStorage.set(key, importJson[key]);
            });
        }
        var first = slides.length && slides[0];

        $(document.body)
            .on('scroll', function(e) { this.scrollLeft = 0; this.scrollTop = 0;e.preventDefault(); e.stopPropagation(); return false; })
            .on('keydown', function(e) {
                if (e.which === 8 && !$(e.target).is('input,textarea,*[contenteditable]')) {
                    e.preventDefault();
                }
            })
            .append(template);


        Split.attachTo($('.split'), {
            Pane1: SlidesList,
            pane1Options: {
                slides: slides,
                aspectRatio: ASPECT_RATIO
            },
            Pane2: SlideEditor,
            pane2Options: {
                slide: first,
                aspectRatio: ASPECT_RATIO
            }
        });
    }

});
