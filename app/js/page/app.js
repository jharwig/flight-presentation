define(function (require) {

    'use strict';

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
            slides = localStorage.get('slides') || [],
            first = slides.length && slides[0];

        console.log(slides.length);

        $(document.body).append(template);

        Split.attachTo($('.split'), {
            Pane1: SlidesList,
            pane1Options: {
                slides: slides
            },
            Pane2: SlideEditor,
            pane2Options: {
                slide: first,
                aspectRatio: 1.6
            }
        });
    }

});
