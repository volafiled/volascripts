// ==UserScript==
// @name         Room Title Quirks
// @namespace    https://not.jew.dance
// @version      2
// @author       Polish potato
// @icon         https://volafile.org/favicon.ico
// @match        https://volafile.org/r/*
// @require      https://cdn.jsdelivr.net/gh/volafiled/volascripts@a9c0424e5498deea9fd437c15b2137c3bec07c61/dry.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
/* globals dry */

dry.once("load", () => {
  'use strict';

  const room_name = document.getElementById("room_name");
  const default_color = room_name.style.color;

  const setOrUnsetPadlock = function(config) {
    if (!dry.exts.user.info.admin) {
      console.error("This only works for mods because " +
      "password is visible in the config for them");
      return false;
    }
    if (config.password) {
      room_name.textContent = dry.config.name + " 🔒";
    }
    else {
      room_name.textContent = dry.config.name;
    }
  };

  dry.exts.connection.on("config", cfg => {
    if (cfg.disabled === true) {
      room_name.style.color = "red"; // is dead
    }
    else {
      room_name.style.color = default_color;
    }
    setOrUnsetPadlock(cfg);
  });
});
