// ==UserScript==
// @name         Vola Timestamps
// @version      11
// @description  Dongo said to make this
// @namespace    https://volafile.org
// @icon         https://volafile.org/favicon.ico
// @author       topkuk productions
// @match        https://volafile.org/r/*
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require      https://cdn.jsdelivr.net/gh/RealDolos/volascripts@1dd689f72763c0e59f567fdf93865837e35964d6/dry.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
/* globals dry */

dry.once("dom", () => {
  "use strict";
  console.log("running", GM.info.script.name, GM.info.script.version, dry.version);

  const style = document.createElement("style");
  style.textContent = `
.username.timestamp {
  font-size: 82%;
  padding-right: 1em;
}
[timestamps="false"] .username.timestamp {
  display: none;
}
`;
  document.body.appendChild(style);

  const config_key = `${dry.config.room_id}-timestamps`;
  const seconds_key = `timestamps-seconds`;
  let enabled = localStorage.getItem(config_key);
  let seconds = localStorage.getItem(seconds_key);
  enabled = enabled !== "disabled";
  document.body.setAttribute("timestamps", "" + enabled);
  seconds = seconds === "enabled";

  const SM = new Intl.DateTimeFormat("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: seconds ? "2-digit" : undefined
  });
  const LG = new Intl.DateTimeFormat("eu");

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
      const addTimestamp = function() {
        let span = document.createElement("span");
        span.classList.add("timestamp", "username", "unselectable");
        let d = new Date(m.options.timestamp);
        span.textContent = SM.format(d) + " ";
        span.setAttribute("title", LG.format(d));
        m.timestamp_elem = span;
        m.elem.insertBefore(span, m.elem.firstChild);
      };
      addTimestamp();
      const update = m.update.bind(m);
      m.update = function() {
        update();
        addTimestamp();
      };
    }
  }();
  new class extends dry.Commands {
    ts(e) {
      enabled = !enabled;
      localStorage.setItem(config_key, enabled ? "enabled" : "disabled");
      document.body.setAttribute("timestamps", "" + enabled);
      return true;
    }
    toggleseconds(e) {
      seconds = !seconds;
      localStorage.setItem(seconds_key, seconds ? "enabled" : "disabled");
      return true;
    }
  }();
});
