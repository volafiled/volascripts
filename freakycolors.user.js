// ==UserScript==
// @name         Freaky Names
// @namespace    http://jew.dance/
// @version      0.5
// @description  ...and shit
// @author       RealDolos
// @match        https://volafile.io/r/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    "use strict";

    const colors = {
        "getddosed": "blue",
        "thejidf|jewmobile|mrshlomo": "pink",
        "auxo": "yellow",
        "dongmaster|doc": "#7aa2ff",
        "31337h4x0r|realdolos|vagfacetrm|robocuck|(?:Red|Dong|Immor|lg188)dolos": "white",
        "^kreg$": "hotpink",
        "^robo": "dodgerblue",
    };
    const r_colors = [];
    for (let name in colors) {
        r_colors.push([new RegExp(name, "i"), colors[name]]);
    }

    console.log("running", GM_info.script.name, GM_info.script.version);
    addEventListener("DOMContentLoaded", function domload(e) {
        removeEventListener("DOMContentLoaded", domload, true);

        const chatp = Room.prototype._extensions.chat.prototype;

        const addMessage = chatp.addMessage;
        chatp.addMessage = function(m, ...args) {
            try {
                for (let r of r_colors) {
                    if (r[0].test(m.nick)) {
                        for (let n = m.nick_elem; n; n = n.previousSibling) {
                            n.style.color = r[1];
                        }
                    }
                }
            }
            catch (ex) {
                console.error(m, ex);
            }
            return addMessage.apply(this, [m].concat(args));
        };
    }, true);
})();
