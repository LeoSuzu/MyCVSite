!function(t) {
    "use strict";
    var s = function(s, o) {
        this.el = t(s);
        this.options = t.extend({}, t.fn.typed.defaults, o);
        this.isInput = this.el.is("input");
        this.attr = this.options.attr;
        this.showCursor = this.isInput ? !1 : this.options.showCursor;
        this.elContent = this.attr ? this.el.attr(this.attr) : this.el.text();
        this.contentType = this.options.contentType;
        this.typeSpeed = this.options.typeSpeed;
        this.startDelay = this.options.startDelay;
        this.backSpeed = this.options.backSpeed;
        this.backDelay = this.options.backDelay;
        this.strings = this.options.strings;
        this.strPos = 0;
        this.arrayPos = 0;
        this.stopNum = 0;
        this.loop = this.options.loop;
        this.loopCount = this.options.loopCount;
        this.curLoop = 0;
        this.stop = !1;
        this.cursorChar = this.options.cursorChar;
        this.build();
    };

    s.prototype = {
        constructor: s,
        init: function() {
            var t = this;
            t.timeout = setTimeout(function() {
                t.typewrite(t.strings[t.arrayPos], t.strPos);
            }, t.startDelay);
        },
        build: function() {
            if (this.showCursor === !0) {
                this.cursor = t('<span class="typed-cursor">' + this.cursorChar + "</span>");
                this.el.after(this.cursor);
            }
            this.init();
        },
        typewrite: function(t, s) {
            if (this.stop !== !0) {
                var o = Math.round(70 * Math.random()) + this.typeSpeed;
                var e = this;
                e.timeout = setTimeout(function() {
                    var o = 0;
                    var i = t.substr(s);
                    if ("^" === i.charAt(0)) {
                        var r = 1;
                        /^\^\d+/.test(i) && (i = /\d+/.exec(i)[0], r += i.length, o = parseInt(i));
                        t = t.substring(0, s) + t.substring(s + r);
                    }
                    if ("html" === e.contentType) {
                        var n = t.substr(s).charAt(0);
                        if ("<" === n || "&" === n) {
                            var a = "";
                            var h = "";
                            for (h = "<" === n ? ">" : ";"; t.substr(s).charAt(0) !== h;) {
                                a += t.substr(s).charAt(0);
                                s++;
                            }
                            s++;
                            a += h;
                        }
                    }
                    e.timeout = setTimeout(function() {
                        if (s === t.length) {
                            if (e.options.onStringTyped(e.arrayPos), e.arrayPos === e.strings.length - 1 && (e.options.callback(), e.curLoop++, e.loop === !1 || e.curLoop === e.loopCount))
                                return;
                            e.timeout = setTimeout(function() {
                                e.backspace(t, s);
                            }, e.backDelay);
                        } else {
                            if (0 === s)
                                e.options.preStringTyped(e.arrayPos);
                            var o = t.substr(0, s + 1);
                            if (e.attr)
                                e.el.attr(e.attr,o);
                            else if (e.isInput)
                                e.el.val(o);
                            else if ("html" === e.contentType)
                                e.el.html(o);
                            else
                                e.el.text(o);

                            s++;
                            e.typewrite(t, s);
                        }
                    }, o);
                }, o);
            }
        },
        backspace: function(t, s) {
            if (this.stop !== !0) {
                var o = Math.round(50 * Math.random()) + this.backSpeed;
                var e = this;
                e.timeout = setTimeout(function() {
                    if ("html" === e.contentType && ">" === t.substr(s).charAt(0)) {
                        var o = "";
                        for (; "<" !== t.substr(s).charAt(0);) {
                            o -= t.substr(s).charAt(0);
                            s--;
                        }
                        s--;
                        o += "<";
                    }
                    var i = t.substr(0, s);
                    if (e.attr)
                        e.el.attr(e.attr, i);
                    else if (e.isInput)
                        e.el.val(i);
                    else if ("html" === e.contentType)
                        e.el.html(i);
                    else
                        e.el.text(i);

                    if (s > e.stopNum) {
                        s--;
                        e.backspace(t, s);
                    } else if (s <= e.stopNum) {
                        e.arrayPos++;
                        if (e.arrayPos === e.strings.length) {
                            e.arrayPos = 0;
                            e.init();
                        } else {
                            e.typewrite(e.strings[e.arrayPos], s);
                        }
                    }
                }, o);
            }
        },
        reset: function() {
            var t = this;
            clearInterval(t.timeout);
            var s = this.el.attr("id");
            this.el.after('<span id="' + s + '"/>');
            this.el.remove();
            if (typeof this.cursor !== "undefined")
                this.cursor.remove();
            t.options.resetCallback();
        }
    };

    t.fn.typed = function(o) {
        return this.each(function() {
            var e = t(this);
            var i = e.data("typed");
            var r = typeof o === "object" && o;
            if (!i) {
                e.data("typed", i = new s(this, r));
            }
            if (typeof o === "string") {
                i[o]();
            }
        });
    };

    t.fn.typed.defaults = {
        typeSpeed: 50,
        startDelay: 0,
        backSpeed: 10,
        backDelay: 500,
        loop: !1,
        loopCount: !1,
        showCursor: !0,
        cursorChar: "|",
        attr: null,
        contentType: "html",
        callback: function() {},
        preStringTyped: function() {},
        onStringTyped: function() {},
        resetCallback: function() {}
    };
}(window.jQuery);

function newTyped() {}
$(function() {
    $("#typed").typed({
        // Change to edit type effect
        strings: ["From the land of ramen and cherry blossoms, now residing in the land of saunas and reindeers!", "Mastering the art of coding and coffee consumption at Tampere University of Applied Sciences.", "Been rockin' the service sector as an entrepreneur in Tampere, Finland for 15 years."],
        //typeSpeed: 100,
        //backDelay: 700,
        contentType: "html",
        loop: true,
        resetCallback: function() {
            newTyped();
        }
    });

    $(".reset").click(function() {
        $("#typed").typed("reset");
    });
});