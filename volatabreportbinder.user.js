// ==UserScript==
// @name         Vola Tab Report Binder
// @version      1
// @namespace    https://volafile.org
// @icon         https://volafile.org/favicon.ico
// @author       Hefty Chungus
// @match        https://volafile.org/r/*
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require      https://raw.githubusercontent.com/volafiled/volascripts/master/dry.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
/* globals dry */
dry.once("dom", () => {
  'use strict';
  console.log("running", GM.info.script.name, GM.info.script.version, dry.version);
  const ke = new KeyboardEvent("keydown", {
    key: "Enter", keyCode: "13"
  });
  const bindtab = "bindmehere";
  const ci = document.getElementById("chat_input");
  new class extends dry.Commands {
    bindreports() {
      localStorage.setItem(bindtab, window.location.href);
      dry.appendMessage("Binder", "Reports are bound to this tab now");
      ci.value = "/reports";
      ci.dispatchEvent(ke);
    }
  }();
  new class extends dry.MessageFilter {
    showMessage(orig, nick, message, options) {
      let tabbind = localStorage.getItem(bindtab);
      if ("Log" === nick && tabbind === window.location.href) {
        if (message[0].hasOwnProperty("value")) {
          let match = message[0].value.match(`${dry.exts.user.info.nick} joined`);
          if (!!match && !!dry.exts.user.info.staff) {
            ci.value = "/reports";
            ci.dispatchEvent(ke);
          }
        }
      }
    }
  }();
});