!function($) {
    "use strict";

    // Constructor function for Typed effect
    const TypedEffect = function(element, options) {
        this.element = $(element);  // Target HTML element
        this.options = $.extend({},
            $.fn.typed.defaults,
            options);  // Merging default and user-defined options
        this.isInput = this.element.is("input");  // Check if the element is an input field
        this.attribute = this.options.attr;  // Attribute to change (if specified)
        this.showCursor = !this.isInput && this.options.showCursor;  // Only show cursor if it's not an input field
        this.contentType = this.options.contentType;  // Type of content (text or HTML)
        this.typeSpeed = this.options.typeSpeed;  // Speed of typing
        this.startDelay = this.options.startDelay;  // Delay before starting typing
        this.backSpeed = this.options.backSpeed;  // Speed of backspacing
        this.backDelay = this.options.backDelay;  // Delay before backspacing starts
        this.strings = this.options.strings;  // Array of strings to type
        this.currentStringPos = 0;  // Current position in the string
        this.currentArrayPos = 0;  // Current position in the array of strings
        this.loopCount = this.options.loopCount;  // Number of times to loop
        this.currentLoop = 0;  // Current loop count
        this.isStopped = false;  // Flag to stop the typing
        this.cursorChar = this.options.cursorChar;  // Cursor character
        this.build();
    };

    // Prototype methods for the TypedEffect
    TypedEffect.prototype = {
        constructor: TypedEffect,

        // Initialize the typing effect
        init: function() {
            const self = this;
            self.timeout = setTimeout(function() {
                self.typewrite(self.strings[self.currentArrayPos], self.currentStringPos);
            }, self.startDelay);  // Start typing after the delay
        },

        // Build the cursor and initialize typing
        build: function() {
            if (this.showCursor) {
                this.cursor = $('<span class="typed-cursor">' + this.cursorChar + "</span>");
                this.element.after(this.cursor);  // Add the cursor after the target element
            }
            this.init();  // Start the typing effect
        },

        // Type each character
        typewrite: function(currentString, currentPos) {
            if (!this.isStopped) {
                const randomDelay = Math.round(70 * Math.random()) + this.typeSpeed;  // Random delay for more human-like typing
                const self = this;

                self.timeout = setTimeout(function() {
                    let delayAdjustment = 0;
                    const remainingString = currentString.substr(currentPos);  // Remaining part of the string

                    // Handle delay commands in the string (e.g., "^1000")
                    if (remainingString.charAt(0) === "^" && /^\^\d+/.test(remainingString)) {
                        const delayValue = remainingString.match(/^\^\d+/)[0].replace("^", "");
                        delayAdjustment = parseInt(delayValue);
                    }

                    // Handle HTML tags or entities
                    if (self.contentType === "html") {
                        const charAtPosition = currentString.substr(currentPos).charAt(0);
                        if (charAtPosition === "<" || charAtPosition === "&") {
                            let htmlSnippet = "";
                            const endChar = charAtPosition === "<" ? ">" : ";";
                            while (currentString.substr(currentPos).charAt(0) !== endChar) {
                                htmlSnippet += currentString.substr(currentPos).charAt(0);
                                currentPos++;
                            }
                            currentPos++;
                        }
                    }

                    // Continue typing the string
                    self.timeout = setTimeout(function() {
                        if (currentPos === currentString.length) {
                            self.options.onStringTyped(self.currentArrayPos);  // String fully typed

                            // Handle looping
                            if (self.currentArrayPos === self.strings.length - 1) {
                                self.options.callback();  // Call the callback function
                                self.currentLoop++;

                                if (!self.options.loop || self.currentLoop === self.loopCount) {
                                    return;  // Exit if not looping or loop count reached
                                }
                            }

                            // Start backspacing
                            self.timeout = setTimeout(function() {
                                self.backspace(currentString, currentPos);
                            }, self.backDelay);
                        } else {
                            if (currentPos === 0) {
                                self.options.preStringTyped(self.currentArrayPos);  // Before typing each string
                            }

                            const currentSubstr = currentString.substr(0, currentPos + 1);  // Get substring up to current position
                            if (self.attribute) {
                                self.element.attr(self.attribute, currentSubstr);
                            } else if (self.isInput) {
                                self.element.val(currentSubstr);  // Update value for input elements
                            } else if (self.contentType === "html") {
                                self.element.html(currentSubstr);  // Update HTML content
                            } else {
                                self.element.text(currentSubstr);  // Update text content
                            }

                            currentPos++;  // Move to next character
                            self.typewrite(currentString, currentPos);  // Continue typing
                        }
                    }, delayAdjustment || randomDelay);
                }, randomDelay);
            }
        },

        // Backspace function to delete characters
        backspace: function(currentString, currentPos) {
            if (!this.isStopped) {
                const randomDelay = Math.round(50 * Math.random()) + this.backSpeed;
                const self = this;

                self.timeout = setTimeout(function() {
                    if (self.contentType === "html" && currentString.substr(currentPos).charAt(0) === ">") {
                        let htmlSnippet = "";
                        while (currentString.substr(currentPos).charAt(0) !== "<") {
                            htmlSnippet -= currentString.substr(currentPos).charAt(0);
                            currentPos--;
                        }
                        currentPos--;
                    }

                    const updatedString = currentString.substr(0, currentPos);  // Get updated substring
                    if (self.attribute) {
                        self.element.attr(self.attribute, updatedString);
                    } else if (self.isInput) {
                        self.element.val(updatedString);  // Update value for input
                    } else if (self.contentType === "html") {
                        self.element.html(updatedString);  // Update HTML
                    } else {
                        self.element.text(updatedString);  // Update text content
                    }

                    if (currentPos > self.stopNum) {
                        currentPos--;  // Move back one character
                        self.backspace(currentString, currentPos);  // Continue backspacing
                    } else {
                        self.currentArrayPos++;
                        if (self.currentArrayPos === self.strings.length) {
                            self.currentArrayPos = 0;  // Reset to first string if looped
                            self.init();  // Start over
                        } else {
                            self.typewrite(self.strings[self.currentArrayPos], currentPos);  // Start typing next string
                        }
                    }
                }, randomDelay);
            }
        },

        // Reset the typed effect
        reset: function() {
            clearInterval(this.timeout);  // Clear any ongoing timeouts
            const elementId = this.element.attr("id");
            this.element.after('<span id="' + elementId + '"/>');
            this.element.remove();  // Remove the current element
            if (typeof this.cursor !== "undefined") {
                this.cursor.remove();  // Remove the cursor if it exists
            }
            this.options.resetCallback();  // Call the reset callback
        }
    };

    // jQuery plugin definition
    $.fn.typed = function(option) {
        return this.each(function() {
            const element = $(this);
            let typedInstance = element.data("typed");
            const options = typeof option === "object" && option;

            if (!typedInstance) {
                element.data("typed", new TypedEffect(this, options));  // Create new instance
            }

            if (typeof option === "string") {
                typedInstance[option]();  // Call method if string option passed
            }
        });
    };

    // Default options for the plugin
    $.fn.typed.defaults = {
        typeSpeed: 30,
        startDelay: 0,
        backSpeed: 10,
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

// Function to re-initialize the typed effect
function newTyped() {}

// Initialize the typed effect on page load
$(function() {
    $("#typed").typed({
        strings: [
            "From the land of ramen and cherry blossoms, now residing in the land of saunas and reindeers!",
            "Mastering the art of coding and coffee consumption at Tampere University of Applied Sciences.",
            "Been rockin' the service sector as an entrepreneur in Tampere, Finland for 15 years.",
            "Balancing coding with a love for cooking and travel, my tech journey seamlessly combines software development and exploration.",
            "From crafting software to savoring hand-ground coffee, I blend my passion for technology with life's adventures."
        ],
        contentType: "html",  // Use HTML content type
        loop: true,  // Loop the strings
        resetCallback: function() {
            newTyped();  // Reset the typed effect when reset button is clicked
        }
    });

    // Reset button functionality
    $(".reset").click(function() {
        $("#typed").typed("reset");
    });
});
