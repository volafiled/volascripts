// ==UserScript==
// @name         Vola Timestamps
// @version      3
// @description  Dongo said to make this
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
