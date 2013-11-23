define(function (require) {

  'use strict';

  /**
   * Module dependencies
   */

  var defineComponent = require('flight/lib/component');
  var template = require('tpl!./comp');
  var withElements = require('./with_elements');

  /**
   * Module exports
   */

  return defineComponent(Component, withElements);

  /**
   * Module function
   */

  function Component() {
      this.defaultAttrs({
          editableSelector: '.editable'
      });


      this.before('initialize', function(node, options) {
            if (!options.element.width) {
                options.element.width = 200;
            }

            if (!options.element.height) {
                options.element.height = 200;
            }
      });

      this.after('initialize', function () {

          var compName = this.attr.element.compName;
          

          if (!compName) {
             if (this.attr.toolOptions) {
                 compName = this.attr.element.compName = this.attr.toolOptions.name;
             } else {
                 console.log('empty tool', this.attr.element)
                 return;
             }
          }

          var self = this;
          require([
              'tpl!component/slide_editor/comps/' + compName,
              'component/slide_editor/comps/' + compName
          ], function(componentTemplate, Component) {
              var content = $(template({}));
              content.append(componentTemplate({}))
              self.$node.html(content);

              Component.attachTo(self.$node.find('.attachTo'));
          });
          //this.$node.html('<div class="editable">testing</div>');


          this.on('elementUpdated', this.onElementUpdated);
          this.on('sizeChanged', this.onSizeChanged);
          this.on('changeEditing', this.onChangeEditing);
          //this.on(document, 'toolSelected', this.onToolSelected);

          var field = this.select('editableSelector')
              .on('change keyup', this.onChange.bind(this));

          this.on('blur', this.onChange);

          this.updateSize();

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

          this.updateSize();
          this.reposition();
      };

      this.updateSize = function() {
          this.$node.css({
              width: (this.attr.element.width) * 100 + '%',
              height: (this.attr.element.height) * 100 + '%'
          })
      };

      this.onSizeChanged = function(event, data) {
          var offsetParent = this.$node.offsetParent(),
          element = this.attr.element,
          size = data.size * 25;
          element.width = size / offsetParent.width();
          element.height = size / offsetParent.width();
          this.$node.css({
              width: size,
              height: size
          })
          this.trigger('updateElement', { element:element });
      };

      this.onChangeEditing = function(event, data) {
          if (data.editing) {
          } else {
              var element = this.attr.element,
                  offsetParent = this.$node.offsetParent(),
                  w = this.$node.width(),
                  h = this.$node.height();

              if (element.width !== w || element.height !== h) {
                  var p = {
                      x: w / offsetParent.width(),
                      y: h / offsetParent.height()
                  };
                  this.snapPercent(p);
                  element.width = p.x;
                  element.height = p.y;
                  this.trigger('updateElement', { element:element });
              }
          }
      };

      this.onChange = function(event) {
          this.attr.element.value = this.select('editableSelector')[0].innerText;

          if (event.type === 'change' || event.type === 'blur')
          this.trigger('updateElement', { element: this.attr.element });
      };


  }

});
