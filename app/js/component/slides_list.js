define(function (require) {

    'use strict';

    /**
     * Module dependencies
     */

    var defineComponent = require('flight/lib/component');

    /**
     * Module exports
     */

    return defineComponent(SlidesList);

    /**
     * Module function
     */

    function SlidesList() {
        this.defaultAttrs({

        });

        this.after('initialize', function () {
            this.$node.html('List');
        });
    }

});
