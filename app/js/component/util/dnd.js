define(function (require) {

    'use strict';

    /**
     * Module dependencies
     */

    var defineComponent = require('flight/lib/component');

    /**
     * Module exports
     */

    return defineComponent(DragAndDrop);

    /**
     * Module function
     */

    function DragAndDrop() {

        this.after('initialize', function () {
            this.on('dragover', this.addClass);
            this.on('dragenter', this.addClass);
            this.on('dragleave', this.removeClass);
            this.on('drop', this.onDrop);
        });

        this.onDrop = function(event) {
            event.preventDefault();
            event.stopPropagation();

            var oe = event.originalEvent || event,
                position = { x: oe.clientX, y: oe.clientY };

            this.handleFilesDropped(oe.dataTransfer.files, position);
        };

        this.addClass = function(event) {
            this.$node.addClass('file-hover');
        };

        this.removeClass = function(event) {
            this.$node.removeClass('file-hover');
        };

        this.handleFilesDropped = function(files, position) {
            this.$node.removeClass('file-hover');

            if (files.length) {
                var file = files[0];

                debugger;
                if (/^image/.test(file.type)) {
                    var offset = this.$node.offset(),
                        width = this.$node.width,
                        height = this.$node.height;

                    position.x = (position.x - offset.left) / width;
                    position.y = (position.y - offset.top) / height;

                    this.trigger('dnd-uploading', { file:file, position:position });
                    _.defer(this.handleFileDrop.bind(this, file));
                }
            }
        };

        this.handleFileDrop = function(file) {
            var self = this, 
                reader = new FileReader();

            reader.onload = function (event) {
                self.trigger('dnd-uploaded', { result:event.target.result });
            };

            reader.readAsDataURL(file);
        };
    }
});
