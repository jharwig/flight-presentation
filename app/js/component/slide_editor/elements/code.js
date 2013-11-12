define(function (require) {

  'use strict';

  /**
   * Module dependencies
   */

  var defineComponent = require('flight/lib/component');
  var template = require('tpl!./code');
  var withElements = require('./with_elements');
  var highlight = require('highlight');

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
          .on('change keyup', this.onChange.bind(this))
          .on('change blur', this.updateHighlighting.bind(this));

          if (this.attr.allowEditing) {
              field.attr('disabled', false);
          }
          if (this.attr.element.editing) {
              field.focus();
              this.attr.element.editing = false;
          }

          this.updateHighlighting = _.debounce(this.updateHighlighting.bind(this), 500, true);
          this.updateHighlighting();
      });

      this.onElementUpdated = function(event, data) {
          event.stopPropagation();

          this.attr.element = data.element;

          var p = data.element.position;

          this.$node.css({
              left: p.x * 100 + '%',
              top: p.y * 100 + '%'
          });

          this.updateHighlighting();
      };

      this.onChange = function(event) {
          this.attr.element.value = this.select('editableSelector')[0].innerText;

          this.trigger('updateElement', { element: this.attr.element });
      };

      this.updateHighlighting = function() {
          var code = this.select('editableSelector'),
              text = code[0].innerText;

          code.empty().text(this.attr.element.value);

          highlight.highlightBlock(code[0]);
      };
  }

});
