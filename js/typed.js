!function($) {
    "use strict";

    // Constructor for Typed effect
    const TypedEffect = function(elementSelector, options) {
        // Store the element and merge options with defaults
        this.element = $(elementSelector);
        this.options = $.extend({}, $.fn.typed.defaults, options);

        // Check if the element is an input field
        this.isInputField = this.element.is("input");

        // Determine if the cursor should be shown
        this.attribute = this.options.attr;
        this.showCursor = this.isInputField ? false : this.options.showCursor;

        // Initial content of the element
        this.elementContent = this.attribute ? this.element.attr(this.attribute) : this.element.text();

        // Set options and defaults
        this.contentType = this.options.contentType;
        this.typeSpeed = this.options.typeSpeed;
        this.startDelay = this.options.startDelay;
        this.backSpeed = this.options.backSpeed;
        this.backDelay = this.options.backDelay;
        this.strings = this.options.strings;

        // Track positions
        this.charPosition = 0;
        this.stringPosition = 0;
        this.stopPoint = 0;
        this.loop = this.options.loop;
        this.loopCount = this.options.loopCount;
        this.currentLoop = 0;
        this.isStopped = false;
        this.cursorCharacter = this.options.cursorChar;

        // Start building the effect
        this.build();
    };

    // Prototype methods for TypedEffect
    TypedEffect.prototype = {
        constructor: TypedEffect,

        // Initialize typing effect after delay
        init: function() {
            const self = this;
            self.timeout = setTimeout(function() {
                self.typewrite(self.strings[self.stringPosition], self.charPosition);
            }, self.startDelay);
        },

        // Build the cursor and initialize typing
        build: function() {
            if (this.showCursor) {
                this.cursor = $('<span class="typed-cursor">' + this.cursorCharacter + '</span>');
                this.element.after(this.cursor);
            }
            this.init();
        },

        // Handle typing the string character by character
        typewrite: function(currentString, currentPosition) {
            if (!this.isStopped) {
                const typingSpeed = Math.round(70 * Math.random()) + this.typeSpeed;
                const self = this;

                // Typing effect logic
                self.timeout = setTimeout(function() {
                    let delay = 0;
                    let remainingText = currentString.substr(currentPosition);

                    // Handle ^ delay marker in the string
                    if (remainingText.charAt(0) === "^" && /^\^\d+/.test(remainingText)) {
                        const delayValue = (remainingText.match(/^\^\d+/)[0]).replace(/\^/, "");
                        remainingText = remainingText.substring(delayValue.length);
                        delay = parseInt(delayValue);
                    }

                    // Handle HTML tags and special characters
                    if (self.contentType === "html") {
                        const char = currentString.substr(currentPosition).charAt(0);
                        if (char === "<" || char === "&") {
                            let htmlTag = "";
                            let endChar;
                            for (endChar = char === "<" ? ">" : ";"; currentString.substr(currentPosition).charAt(0) !== endChar;) {
                                htmlTag += currentString.substr(currentPosition).charAt(0);
                                currentPosition++;
                            }
                            currentPosition++;
                            htmlTag += endChar;
                        }
                    }

                    // Set next timeout for typing or backspacing
                    self.timeout = setTimeout(function() {
                        if (currentPosition === currentString.length) {
                            // When the string is fully typed
                            self.options.onStringTyped(self.stringPosition);

                            if (self.stringPosition === self.strings.length - 1) {
                                self.options.callback();
                                self.currentLoop++;

                                if (!self.loop || self.currentLoop === self.loopCount) {
                                    return;
                                }
                            }

                            // Start backspacing after a delay
                            self.timeout = setTimeout(function() {
                                self.backspace(currentString, currentPosition);
                            }, self.backDelay);
                        } else {
                            // Continue typing the next character
                            if (currentPosition === 0) {
                                self.options.preStringTyped(self.stringPosition);
                            }
                            const typedText = currentString.substr(0, currentPosition + 1);
                            if (self.attribute) {
                                self.element.attr(self.attribute, typedText);
                            } else if (self.isInputField) {
                                self.element.val(typedText);
                            } else if (self.contentType === "html") {
                                self.element.html(typedText);
                            } else {
                                self.element.text(typedText);
                            }

                            currentPosition++;
                            self.typewrite(currentString, currentPosition);
                        }
                    }, delay);
                }, typingSpeed);
            }
        },

        // Handle backspacing the string
        backspace: function(currentString, currentPosition) {
            if (!this.isStopped) {
                const backspacingSpeed = Math.round(50 * Math.random()) + this.backSpeed;
                const self = this;

                // Backspacing logic
                self.timeout = setTimeout(function() {
                    if (self.contentType === "html" && currentString.substr(currentPosition).charAt(0) === ">") {
                        let htmlTag = "";
                        for (; currentString.substr(currentPosition).charAt(0) !== "<";) {
                            htmlTag -= currentString.substr(currentPosition).charAt(0);
                            currentPosition--;
                        }
                        currentPosition--;
                        htmlTag += "<";
                    }

                    const updatedText = currentString.substr(0, currentPosition);

                    // Update the element's content during backspace
                    if (self.attribute) {
                        self.element.attr(self.attribute, updatedText);
                    } else if (self.isInputField) {
                        self.element.val(updatedText);
                    } else if (self.contentType === "html") {
                        self.element.html(updatedText);
                    } else {
                        self.element.text(updatedText);
                    }

                    // Continue backspacing or start typing the next string
                    if (currentPosition > self.stopPoint) {
                        currentPosition--;
                        self.backspace(currentString, currentPosition);
                    } else {
                        self.stringPosition++;
                        if (self.stringPosition === self.strings.length) {
                            self.stringPosition = 0;
                            self.init();
                        } else {
                            self.typewrite(self.strings[self.stringPosition], currentPosition);
                        }
                    }
                }, backspacingSpeed);
            }
        },

        // Reset the typing effect
        reset: function() {
            const self = this;
            clearInterval(self.timeout);
            const elementId = this.element.attr("id");
            this.element.after('<span id="' + elementId + '"/>');
            this.element.remove();
            if (typeof this.cursor !== "undefined") {
                this.cursor.remove();
            }
            self.options.resetCallback();
        }
    };

    // jQuery plugin for Typed effect
    $.fn.typed = function(options) {
        return this.each(function() {
            const element = $(this);
            let typedEffectInstance = element.data("typed");
            const optionType = typeof options === "object" && options;

            if (!typedEffectInstance) {
                element.data("typed", typedEffectInstance = new TypedEffect(this, optionType));
            }

            if (typeof options === "string") {
                typedEffectInstance[options]();
            }
        });
    };

    // Default options for Typed effect
    $.fn.typed.defaults = {
        typeSpeed: 25,
        startDelay: 0,
        backSpeed: 7,
        backDelay: 2000,
        loop: false,
        loopCount: false,
        showCursor: true,
        cursorChar: "|",
        attr: null,
        contentType: "html",
        callback: function() {},
        preStringTyped: function() {},
        onStringTyped: function() {},
        resetCallback: function() {}
    };
}(window.jQuery);

// Additional function to start a new typing effect
function newTyped() {}

$(function() {
    // Initialize typed effect on the element with ID 'typed'
    $("#typed").typed({
        strings: [
            "From the land of ramen and cherry blossoms, now residing in the land of saunas and reindeer!",
            "Mastering the art of coding and coffee consumption at Tampere University of Applied Sciences.",
            "Rocking the service sector as an entrepreneur in Finland for 15 years.",
            "Balancing coding with a love for cooking and travel—blending software development with global exploration.",
        ],
        contentType: "html",
        loop: true,
        resetCallback: function() {
            newTyped();
        }
    });

    // Reset button functionality
    $(".reset").click(function() {
        $("#typed").typed("reset");
    });
});
