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

        this.on('dragstart', this.onDragStart);
        this.on('dragend', this.onDragEnd);
    });

    this.onDragEnd = function(event) {
        var e = event.originalEvent || event;
        var parent = this.$node.offsetParent();
        var offset = parent.offset(); 
        var dragPosition = {
            x: e.clientX - offset.left,
            y: e.clientY - offset.top - this.$node.height()
        };
        var element = this.attr.element;
        
        element.position.x = dragPosition.x / parent.width();
        element.position.y = dragPosition.y / parent.height();

        this.$node.css('opacity', 1.0);
        // Notify list
        this.trigger('updateElement', { element:element });
        // Notify self
        this.trigger('elementUpdated', { element:element });
    };

    this.onDragStart = function(event) {
        this.$node.css('opacity', 0.5);
        return true;
    };

    this.after('initialize', function () {
        this.$node.addClass(this.attr.element.id);
    });
  }

});
