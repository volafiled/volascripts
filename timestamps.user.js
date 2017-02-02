// ==UserScript==
// @name         Vola Timestamps
// @namespace    http://not.jew.dance/
// @version      1.1
// @description  Dongo said to make this
// @author       RealDolos
// @match        https://volafile.io/r/*
// @grant        none
// @require      https://rawgit.com/RealDolos/volascripts/db222e0a836c6da9d5593c7fc93941c0e7a9d2a1/dry.js
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
}
[timestamps="false"] .username.timestamp {
  display: none;
}
`;
    document.body.appendChild(style);

    const config_key = `${dry.config.room_id}-timestamps`;
    let enabled = localStorage.getItem(config_key);
    enabled = enabled !== "disabled";

    new class extends dry.MessageFilter {
        showMessage(orig, nick, message, options) {
            if (!options.timestamp) {
                options.timestamp = Date.now();
            }
        }
        addMessage(orig, m) {
            if (!m.nick || !m.options || !m.options.timestamp) {
                return;
            }
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
    }();
    new class extends dry.Commands {
        ts(e) {
            enabled = !enabled;
            localStorage.setItem(config_key, enabled ? "enabled" : "disabled");
            document.body.setAttribute("timestamps", "" + enabled);
            return true;
        }
    }();
});
