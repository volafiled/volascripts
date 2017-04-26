// ==UserScript==
// @name         Unnotify reports
// @namespace    http://not.jew.dance/
// @version      0.6
// @description  because it's annoying
// @author       RealDolos
// @match        https://volafile.io/r/*
// @match        https://volafile.org/r/*
// @grant        none
// @require      https://rawgit.com/RealDolos/volascripts/db222e0a836c6da9d5593c7fc93941c0e7a9d2a1/dry.js
// @run-at       document-start
// ==/UserScript==

dry.once("dom", () => {
    "use strict";
    console.log("running", GM_info.script.name, GM_info.script.version, dry.version);
    const BLACK = /\.(txt|html?|rtf|docx?|xlsx?|exe|rar|zip) @|periscopefollower/;

    new class extends dry.MessageFilter {
        showMessage(orig, nick, message, options) {
            if (nick === "Report" && options.staff) {
                options.notify = options.highlight = false;
                if (message[0] && message[0].value && message[0].value.includes("Enabled notifications in this room")) {
                    return false;
                }
                if (message[1] && message[1].value) {
                    let text = message[1].value;
                    if (text.includes("BLACKLIST") && BLACK.test(text)) {
                        console.error(message);
                        return false;
                    }
                }
                return;
            }
            if (nick === "Log" && options.staff) {
                options.notify = options.highlight = false;
            }
        }
    }();
});
