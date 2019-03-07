// ==UserScript==
// @name         Show Maintainers On Room Title Hover
// @namespace    https://not.jew.dance
// @version      3
// @description  Show da owner und jannies
// @author       Your mom
// @icon         https://volafile.org/favicon.ico
// @match        https://volafile.org/r/*
// @require      https://cdn.jsdelivr.net/gh/volafiled/volascripts@a9c0424e5498deea9fd437c15b2137c3bec07c61/dry.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
/* globals dry */

dry.once("load", () => {
  'use strict';
  const room_title = document.getElementById("name_container");
  let room_owner = "";
  let jannies = "";
  const parse_list = function(l) {
    let parsed = "";
    for (let i = 0, len = l.length; i < len; i++) {
      if (i < len) {
        parsed += `${l[i]}, `;
      }
      else {
        parsed += `${l[i]}`;
        return parsed;
      }
      if ((i + 1) % 3 === 0) {
        parsed += "\n";
      }
    }
    return parsed;
  };
  dry.exts.connection.on("config", cfg => {
    if (typeof cfg.owner === "string" || room_owner) {
      room_owner = cfg.owner ? `${cfg.owner} is the room owner` : room_owner;
    }
    else {
      room_owner = "Room has no owner";
    }
    if (Array.isArray(cfg.janitors)) {
      jannies = cfg.janitors.length ? `\nJanitors: ${parse_list(cfg.janitors)}` : "";
    }
    room_title.title = `${room_owner}${jannies}`;
  });
});
