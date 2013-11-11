define(function (require) {

    'use strict';

    /**
     * Module dependencies
     */

    var defineComponent = require('flight/lib/component');
    var template = require('tpl!./slide_editor_toolbar');

    /**
     * Module exports
     */

    return defineComponent(editorToolbar);

    /**
     * Module function
     */

    function editorToolbar() {
        this.defaultAttrs({

        });

        this.after('initialize', function () {
            this.$node.html(template());
        });
    }

});
