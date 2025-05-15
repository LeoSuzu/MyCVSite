(function($) {
    "use strict";

    const TypedEffect = function(el, options) {
        this.$el = $(el);
        this.options = $.extend({}, $.fn.typed.defaults, options);
        this.strings = this.options.strings;
        this.index = 0;
        this.char = 0;
        this.loopCount = 0;
        this.init();
    };

    TypedEffect.prototype = {
        init: function() {
            if (this.options.showCursor) {
                this.$cursor = $('<span class="typed-cursor">' + this.options.cursorChar + '</span>');
                this.$el.after(this.$cursor);
            }
            this.type();
        },

        type: function() {
            const current = this.strings[this.index];
            const nextChar = current.substring(0, this.char + 1);
            this.updateElement(nextChar);
            this.char++;

            if (this.char <= current.length) {
                setTimeout(() => this.type(), this.options.typeSpeed);
            } else {
                setTimeout(() => this.backspace(), this.options.backDelay);
            }
        },

        backspace: function() {
            const current = this.strings[this.index];
            const nextChar = current.substring(0, this.char - 1);
            this.updateElement(nextChar);
            this.char--;

            if (this.char >= 0) {
                setTimeout(() => this.backspace(), this.options.backSpeed);
            } else {
                this.index = (this.index + 1) % this.strings.length;
                if (!this.options.loop && this.index === 0) return;
                setTimeout(() => this.type(), this.options.startDelay);
            }
        },

        updateElement: function(text) {
            if (this.options.contentType === "html") {
                this.$el.html(text);
            } else {
                this.$el.text(text);
            }
        }
    };

    $.fn.typed = function(options) {
        return this.each(function() {
            if (!$.data(this, "typed")) {
                $.data(this, "typed", new TypedEffect(this, options));
            }
        });
    };

    $.fn.typed.defaults = {
        strings: [],
        typeSpeed: 50,
        backSpeed: 25,
        backDelay: 1500,
        startDelay: 500,
        loop: true,
        showCursor: true,
        cursorChar: "|",
        contentType: "html"
    };
})(jQuery);

// Init
$(function() {
    $("#typed").typed({
        strings: [
            "From the land of ramen and cherry blossoms, now residing in the land of saunas and reindeer!",
            "Mastering the art of coding and coffee consumption at Tampere University of Applied Sciences.",
            "Rocking the service sector as an entrepreneur in Tampere Finland for 15 years.",
            "Balancing coding with a love for cooking and travel—blending software development with global exploration."
        ]
    });
});
