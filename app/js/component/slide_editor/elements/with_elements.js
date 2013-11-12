define(function (require) {

  'use strict';

  var ID_PREFIX = 'element_',
      ID_INCREMENT = 0;

  /**
   * Module exports
   */

  return withElements;

  /**
   * Module function
   */

  function withElements() {
    this.defaultAttrs({

    });

    this.after('initialize', function () {
        if (!this.attr.element.id) {
            var prefix = this.describe;
            if (prefix) {
                prefix = prefix.replace(/[\s,]+/g, '').replace(/withElements/,'') + '_';
            }
            this.attr.element.id = (prefix || ID_PREFIX) + ID_INCREMENT++;
        }
    });

    this.after('initialize', function () {
        this.$node.addClass(this.attr.element.id);
    });
  }

});
