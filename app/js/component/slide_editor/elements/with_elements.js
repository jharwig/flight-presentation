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

    this.before('initialize', function(node, options) {
        var element = options.element;

        if (element.id) {
            var m = element.id.match(/(\d+)$/),
                n = m && m.length === 2 && +m[1];

            if (n) {
                ID_INCREMENT = n + 1;
            }

        } else {
            var prefix = this.describe;
            if (prefix) {
                prefix = prefix.replace(/[\s,]+/g, '').replace(/withElements/,'') + '_';
            }
            element.id = (prefix || ID_PREFIX) + ID_INCREMENT++;
        }
    });

    this.after('initialize', function () {
        var element = this.attr.element;

        if (!element.size) {
            element.size = 0;
        }

        this.$node.data('elementId', this.attr.element.id);

        this.on('keydown', this.onKeyDown);
        this.on('dragstart', this.onDragStart);
        this.on('dragend', this.onDragEnd);
        this.on('drag', this.onDrag);

        this.on(document, 'selectElement', this.onSelectElement);
    });

    this.onKeyDown = function(event) {
        if (this.$node.find('*[contenteditable=true]').length) return;

        if (event.which === 8 && !$(event.target).attr('contenteditable')) {
            this.trigger('removeElement', { element:this.attr.element });
            stop();
        } else if (event.which === 189) {
            this.attr.element.size--;
            this.trigger('sizeChanged', { size:this.attr.element.size });
            this.trigger('updateElement', { element:this.attr.element });
            stop();
        } else if (event.which === 187) {
            this.attr.element.size++;
            this.trigger('sizeChanged', { size:this.attr.element.size });
            this.trigger('updateElement', { element:this.attr.element });
            stop();
        }

        //console.log(event.which);

        function stop() {
            event.stopPropagation();
            event.preventDefault();
        }
    };

    this.onSelectElement = function(event, data) {
        var self = this;

        if (this.attr.allowEditing) {
            if (data.element && data.element.id === this.attr.element.id) {
                this.$node.focus();
                this.$node.addClass('active');
                this.$node.on('click.makeEditable', function(event) {
                    event.stopPropagation();
                    self.trigger('changeEditing', { editing:true });
                });
            } else {
                this.$node.blur();
                this.$node.removeClass('active');
                self.trigger('changeEditing', { editing:false });
                this.$node.off('click.makeEditable')
            }
        }
    };

    this.reposition = function() {
        var p = this.attr.element.position;
        this.$node.css({
            left: p.x * 100 + '%',
            top: p.y * 100 + '%'
        });
    };

    this.onDragEnd = function(event) {
        var parent = this.$node.offsetParent();
        var element = this.attr.element;
        
        element.position.x += this.dragOffsetX / parent.width()
        element.position.y += this.dragOffsetY / parent.height()

        this.$node.css({
            opacity: 1.0,
            transform: 'none'
        });

        // Notify list
        this.trigger('updateElement', { element:element });
        // Notify self
        this.trigger('elementUpdated', { element:element });

        this.dragImage.remove();
    };

    this.onDragStart = function(event) {
        var oe = event.originalEvent || event;
            
        this.startPageX = oe.pageX;
        this.startPageY = oe.pageY;

        this.dragImage = $('<div/>').css({
            width:'10px',
            height: '10px',
            background: 'transparent'
        }).appendTo(document.body);
        oe.dataTransfer.setDragImage(this.dragImage[0], 10, 10);
        oe.dataTransfer.effectAllowed = 'move';

        this.$node.css('opacity', 0.5);
        return true;
    };

    this.onDrag = function(event) {
        var oe = event.originalEvent || event,
        left = oe.pageX - this.startPageX,
        top = oe.pageY - this.startPageY;

        this.dragOffsetX = left;
        this.dragOffsetY = top;

        this.$node.css({
            transform: 'translate(' + left + 'px, ' + top + 'px)'
        });
    };

    this.after('initialize', function () {
        this.$node.addClass(this.attr.element.id);
    });
  }

});
