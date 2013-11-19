define(function (require) {

    'use strict';

    /**
     * Module dependencies
     */

    var defineComponent = require('flight/lib/component');
    var template = require('tpl!./slide_editor_toolbar');
    var withStorage = require('flight-storage/adapters/local-storage');

    /**
     * Module exports
     */

    return defineComponent(editorToolbar, withStorage);

    /**
     * Module function
     */

    function editorToolbar() {
        this.defaultAttrs({
            toolSelector: '.tools',
            textToolsSelector: '.align,.color,.language',
            codeToolsSelector: '.language',
            saveToolsSelector: '.save'
        });

        this.after('initialize', function () {
            this.$node.html(template());

            this.select('textToolsSelector').hide();
            this.select('codeToolsSelector').hide();

            this.on('click', {
                toolSelector: this.onToolClick,
                textToolsSelector: this.onTextToolClick
            })
            this.on(document, 'selectElement', this.onSelectElement);

            this.select('saveToolsSelector').find('button')
                .attr('draggable', true)
                .on('dragstart', this.onSaveDragStart.bind(this));


            this.loadImages();
        });

        this.loadImages = function() {
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (/^image\//.test(key)) {
                    var displayName = key.substring(key.indexOf('-') + 1);
                    key.substring(key.indexOf('-') + 1)
                    this.$node.find('ul.images').append($('<li><a tabindex="-1" href="#">' + displayName + '</a></li>').data('key', key));
                }
            }
        };


        this.onSelectElement = function(event, data) {
            var tools = this.select('textToolsSelector');
            var languages = this.select('codeToolsSelector');

            if (data.element) {
                if (data.element.elementType === 'text' || data.element.elementType === 'code') {
                    tools.find('button').each(function() {
                        var name = $(this).data('tool');
                        $(this).toggleClass('active', data.element.align === name || data.element.color === name);
                    });
                    tools.show();

                    if (data.element.elementType === 'code') {
                        languages.find('button').each(function() {
                            var name = $(this).data('tool');
                            $(this).toggleClass('active', data.element.language === name);
                        });
                        languages.show();
                    }
                }
                this.selectedElement = data.element;
            } else {
                tools.hide();
                languages.hide();
            }
        };

        this.onSaveDragStart = function(event) {
            var oe = event.originalEvent || event;

            oe.dataTransfer.setData('text/plain', JSON.stringify(this.get('slides')));
        };

        this.onTextToolClick = function(event) {
            this.select('textToolsSelector').find('.active').removeClass('active');

            var tool = $(event.target).closest('button')
                    .addClass('active')
                    .data('tool'),
                name = $(event.target).closest('.btn-group').data('key');
            this.trigger('toolSelected', { key:name, value:tool, element:this.selectedElement });
        };

        this.onToolClick = function(event) {
            var $target = $(event.target),
                button = $target.closest('button'),
                toolName = button.data('tool');

            if (toolName) {
                if (toolName === 'image') {


                } else this.trigger('changeTool', { tool:toolName });
            } else {
                var key = $(event.target).closest('li').data('key');
                if (key) {
                    this.trigger('changeTool', { tool:'image', toolOptions: {key:key} });
                }
            }
        }
    }

});
