'use strict';

define(
  [
    'flight/lib/component'
  ],

  function(defineComponent) {

    return defineComponent(mailControlsDebug);

    function mailControlsDebug() {

        this.defaultAttrs({
            buttonSelector: 'button'
        });

        this.after('initialize', function() {

            this.on('click', {
                buttonSelector: this.onButton
            })
        });

        this.onButton = function(event) {
            var ids = [];
            if ($(event.target).hasClass('fake')) {
                ids.push('fake_message');
            }

            this.trigger('uiMailItemSelectionChanged', { selectedIds:ids });
        }
    }
  }
);
