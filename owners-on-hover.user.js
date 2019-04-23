// ==UserScript==
// @name         Room owner + janitor hover
// @namespace    https://not.jew.dance
// @version      4.1
// @description  Show da owner und janitors
// @author       Polish cuck
// @icon         https://volafile.org/favicon.ico
// @match        https://volafile.org/r/*
// @require      https://cdn.jsdelivr.net/gh/volafiled/volascripts@a9c0424e5498deea9fd437c15b2137c3bec07c61/dry.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
/* globals dry */

dry.once("load", () => {
  'use strict';
  function wrapLines(arr, len) {
    len = len || 40;
    let cur = "";
    const rv = [];
    for (let i of arr) {
      if (!i) {
        continue;
      }
      let n = cur ? `${cur}, ${i}` : i;
      if (n.length > len && cur) {
        rv.push(cur);
        cur = i;
        continue;
      }
      cur = n;
    }
    if (cur) {
      rv.push(cur);
    }
    return rv.join("\n");
  }

  const room_title = document.getElementById("name_container");

  dry.exts.connection.on("config", cfg => {
    let rv = [cfg.owner ? `Room owner: ${cfg.owner}` : "No owner"];
    if (Array.isArray(cfg.janitors) && cfg.janitors.length) {
      rv.push("Janitors:");
      rv.push(wrapLines(cfg.janitors.slice(0).sort(), 36));
    }
    room_title.title = rv.join("\n");
  });
});
