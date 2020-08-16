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

  dry.exts.connection.on("config", cfg => {
    if (dry.exts.user.info.admin && cfg.password !== undefined) {
      // This only works for mods because
      // password is visible in the config for them
      room_name.textContent = cfg.password ?
        `${dry.config.name} 🔒` : dry.config.name;
    }
    console.log(cfg.disabled);
    room_name.style.color = cfg.disabled === true ? "red" : default_color;
  });
});
