// ==UserScript==
// @name         Unnotify reports
// @version      4
// @description  because it's annoying
// @namespace    https://volafile.org
// @icon         https://volafile.org/favicon.ico
// @author       topkuk productions
// @match        https://volafile.org/r/*
// @require      https://cdn.rawgit.com/RealDolos/volascripts/1dd689f72763c0e59f567fdf93865837e35964d6/dry.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

dry.once("dom", () => {
    "use strict";
    console.log("running", GM_info.script.name, GM_info.script.version, dry.version);
    const BLACK = /\.(txt|html?|rtf|docx?|xlsx?|exe|rar|zip)[ "]|periscopefollower/;

    new class extends dry.MessageFilter {
        showMessage(orig, nick, message, options) {
            if (typeof message !== "string" && ((nick === "Report" && options.staff) || (message && message[0] && message[0].href === "/reports"))) {
                options.notify = options.highlight = false;
                try {
                    let text = message.map(e => e.value || "").join("");
                    if (text.includes("BLACKLIST") && BLACK.test(text)) {
                        console.error(text);
                        return false;
                    }
                    return;
                }
                catch (ex) {
                    console.error("failed", message, ex);
                }
            }
            if (nick === "Log" && options.staff) {
                options.notify = options.highlight = false;
            }
        }
    }();
});
