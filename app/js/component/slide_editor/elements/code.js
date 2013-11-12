define(function (require) {

  'use strict';

  /**
   * Module dependencies
   */

  var defineComponent = require('flight/lib/component');
  var template = require('tpl!./text');
  var withElements = require('./with_elements');

  /**
   * Module exports
   */

  return defineComponent(Code, withElements);

  /**
   * Module function
   */

  function Code() {
      this.defaultAttrs({
          editableSelector: '.editable'
      });

      this.after('initialize', function () {
          this.$node.html(template());

          this.on('elementUpdated', this.onElementUpdated);

          var field = this.select('editableSelector')
          .attr('disabled', true)
          .html(this.attr.element.value)
          .on('change keyup', this.onChange.bind(this));

          if (this.attr.allowEditing) {
              field.attr('disabled', false);
          }
          if (this.attr.element.editing) {
              field.focus();
              this.attr.element.editing = false;
          }
      });

      this.onElementUpdated = function(event, data) {
          event.stopPropagation();

          var element = data.element;

          this.select('editableSelector').html(element.value)
          .css({
              top: element.position.x * 100 + '%',
              left: element.position.y * 100 + '%'
          });
      };

      this.onChange = function(event) {
          var $target = $(event.target);

          this.attr.element.value = $target.html();

          this.trigger('updateElement', { element: this.attr.element });
      };
  }

});
