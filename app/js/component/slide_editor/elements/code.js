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

      this.before('initialize', function(node, options) {
          if (!options.element.value) {
              options.element.value = 'Enter Code';
          }

          if (!options.element.align) {
              options.element.align = 'center';
          }

          if (!options.element.language) {
              options.element.language = 'javascript';
          }
      });

      this.after('initialize', function () {
          this.$node.html(template());


          this.on('elementUpdated', this.onElementUpdated);
          this.on('sizeChanged', this.onSizeChanged);
          this.on('changeEditing', this.onChangeEditing);
          this.on(document, 'toolSelected', this.onToolSelected);

          var field = this.select('editableSelector')
              .html(this.attr.element.value)
              .on('change keyup', this.onChange.bind(this))
              .on('change blur', this.updateHighlighting.bind(this));

          this.updateFontSize();

          if (this.attr.allowEditing) {
              if (this.attr.element.editing) {
                  this.trigger('changeEditing', { editing:true });
                  this.attr.element.editing = false;
                  this.trigger('updateElement', { element:this.attr.element });
              }
          }

          this.updateHighlighting = _.debounce(this.updateHighlighting.bind(this), 500, true);
          this.updateHighlighting();
      });

      this.onToolSelected = function(event, data) {
          if (data.element === this.attr.element) {
              this.attr.element[data.key] = data.value;
              this.trigger('updateElement', { element: this.attr.element });
          }
      };

      this.onElementUpdated = function(event, data) {
          event.stopPropagation();

          this.attr.element = data.element;

          this.reposition();
          this.updateFontSize();
          this.updateHighlighting();
      };

      this.updateFontSize = function(event, data) {
          if (this.attr.element.language === 'html') {
              this.attr.element.language = 'xml';
          }

          this.select('editableSelector')
              .removeClass('javascript html xml').addClass(this.attr.element.language)
              .css('fontSize', (3 + this.attr.element.size) + 'em');
      };

      this.onSizeChanged = function(event, data) {
          this.updateFontSize();
      };

      this.onChangeEditing = function(event, data) {
          if (data.editing) {
              this.select('editableSelector')
                  .attr('contenteditable', true)
                  .focus();
          } else {
              this.select('editableSelector').removeAttr('contenteditable');
          }
      };

      this.onChange = function(event) {
          this.attr.element.value = this.select('editableSelector')[0].innerText;

          if (event.type === 'change')
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
