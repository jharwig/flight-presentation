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
        if (this.attr.element.id) {
            var m = this.attr.element.id.match(/(\d+)$/),
                n = m && m.length === 2 && +m[1];

            if (n) {
                ID_INCREMENT = n + 1;
            }

        } else {
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
