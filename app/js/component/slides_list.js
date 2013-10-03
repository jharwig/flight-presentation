define(function (require) {

  'use strict';

  /**
   * Module dependencies
   */

  var defineComponent = require('flight/lib/component');

  /**
   * Module exports
   */

  return defineComponent(slidesList);

  /**
   * Module function
   */

  function slidesList() {
    this.defaultAttrs({

    });

    this.after('initialize', function () {
        this.$node.html('List');

    });
  }

});
