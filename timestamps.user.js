// ==UserScript==
// @name         Vola Timestamps
// @namespace    http://not.jew.dance/
// @version      1.0
// @description  Dongo said to make this
// @author       RealDolos
// @match        https://volafile.io/r/*
// @grant        none
// @require      https://rawgit.com/RealDolos/volascripts/064d22df5566bda12d222822584b87dcc6a43d45/dry.js
// @run-at       document-start
// ==/UserScript==

dry.once("dom", () => {
    "use strict";
    console.log("running", GM_info.script.name, GM_info.script.version, dry.version);

    const style = document.createElement("style");
    style.textContent = `
.username.timestamp {
  -moz-user-select: none;
  user-select: none;
  display: inline-block;
  /*padding: 0;*/
  whites-pace: pre-wrap;
}
[timestamps="false"] .username.timestamp {
  display: none;
}
`;
    document.body.appendChild(style);

    const config_key = `${dry.config.room_id}-timestamps`;
    let enabled = localStorage.getItem(config_key);
    enabled = enabled !== "disabled";

    dry.replaceEarly("chat", "showMessage", function(orig, nick, message, options, ...args) {
        if (!options.timestamp) {
            options.timestamp = Date.now();
        }
        return orig(...[nick, message, options].concat(args));
    });
    dry.replaceEarly("chat", "addMessage", function(orig, m, ...args) {
        try {
            if (m.nick && m.options && m.options.timestamp) {
                let span = document.createElement("span");
                span.classList.add("timestamp", "username");
                let d = new Date(m.options.timestamp);
                span.textContent = d.toLocaleString("en-US", {
                    hour12: false,
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                }) + " |";
                span.setAttribute("title", d.toLocaleString("eu"));
                m.timestamp_elem = span;
                m.elem.insertBefore(span, m.elem.firstChild);
            }
        }
        catch (ex) {
            console.error(m, ex);
        }
        return orig(...[m].concat(args));
    });
    new class extends dry.Commands {
        ts(e) {
            enabled = !enabled;
            localStorage.setItem(config_key, enabled ? "enabled" : "disabled");
            document.body.setAttribute("timestamps", "" + enabled);
            return true;
        }
    }();
});
