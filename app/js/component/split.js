define(function (require) {

    'use strict';

    /**
     * Module dependencies
     */

    var defineComponent = require('flight/lib/component');

    /**
     * Module exports
     */

    Split.LAYOUTS = {
        HORIZONTAL: 'h',
        VERTICAL: 'v' 
    };

    return defineComponent(Split);

    /**
     * Module function
     */

    function Split() {

        this.defaultAttrs({
            layout: Split.LAYOUTS.HORIZONTAL
        });

        this.after('initialize', function () {
            if (this.attr.layout !== Split.LAYOUTS.HORIZONTAL) {
                throw "Layout not supported";
            }

            if (!this.attr.Pane1 || !this.attr.Pane2) {
                throw "pane1Selector and pane2Selector are required";
            }

            this.attr.Pane1.attachTo($('<div class="split-1">').appendTo(this.$node));
            this.attr.Pane2.attachTo($('<div class="split-2">').appendTo(this.$node));

            this.$node.addClass('layout-' + this.attr.layout);
        });
    }
});
