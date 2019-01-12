// ==UserScript==
// @name         Vola Tab Report Binder
// @version      1
// @namespace    https://volafile.org
// @icon         https://volafile.org/favicon.ico
// @author       Hefty Chungus
// @match        https://volafile.org/r/*
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require      https://cdn.jsdelivr.net/gh/volafiled/volascripts/dry.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
/* globals dry */
dry.once("dom", () => {
  'use strict';
  console.log("running", GM.info.script.name, GM.info.script.version, dry.version);
  const bindtab = GM.info.script.name;
  const tabbind = localStorage.getItem(bindtab);
  new class extends dry.Commands {
    bindreports() {
      localStorage.setItem(bindtab, config.room_id);
      dry.appendMessage("Binder", "Reports are bound to this tab now");
      dry.exts.connection.call("command", dry.exts.user.info.nick, "reports", "")
    }
  }();
  new class extends dry.MessageFilter {
    showMessage(orig, nick, message, options) {
      if (("Log" === nick || "Network" === nick) && tabbind === config.room_id) {
        if (!!dry.exts.user.info.admin) {
          dry.exts.connection.call("command", dry.exts.user.info.nick, "reports", "")
        }
      }
      return;
    }
  }();
});
