define(function (require) {

    'use strict';

    /**
     * Module dependencies
     */

    var Split = require('component/split');
    var template = require('tpl!./app');
    var SlidesList = require('component/slides_list');
    var SlideEditor = require('component/slide_editor/slide_editor');

    /**
     * Module exports
     */

    return initialize;

    /**
     * Module function
     */

    function initialize() {

        $(document.body).append(template);

        Split.attachTo($('.split'), {
            Pane1: SlidesList,
            Pane2: SlideEditor
        });
    }

});
