// ==UserScript==
// @name         Vola Timestamps
// @namespace    http://not.jew.dance/
// @version      0.3
// @description  Dongo said to make this
// @author       RealDolos
// @match        https://volafile.io/r/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    console.log("running", GM_info.script.name, GM_info.script.version);

    addEventListener("DOMContentLoaded", function domload(e) {
        removeEventListener("DOMContentLoaded", domload, true);

        const chatp = Room.prototype._extensions.chat.prototype;

        const showMessage = chatp.showMessage;
        chatp.showMessage = function(nick, message, options, ...args) {
            if (!options.timestamp) {
                options.timestamp = Date.now();
            }
            return showMessage.apply(this, [nick, message, options].concat(args));
        };

        const addMessage = chatp.addMessage;
        chatp.addMessage = function(m, ...args) {
            try {
                if (m.nick && m.options && m.options.timestamp) {
                    let span = document.createElement("span");
                    span.classList.add("timestamp", "username");
                    span.style.display = "inline-block";
                    span.style.float = "left";
                    span.style.paddingRight = "6px";
                    let d = new Date(m.options.timestamp);
                    span.textContent = d.toLocaleString("en-US", {
                        hour12: false,
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                    }) + "|";
                    span.setAttribute("title", d.toLocaleString("eu"));
                    m.timestamp_elem = span;
                    m.elem.insertBefore(span, m.elem.firstChild);
                }
            }
            catch (ex) {
                console.error(m, ex);
            }
            return addMessage.apply(this, [m].concat(args));
        };
    }, true);
})();
