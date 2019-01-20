// ==UserScript==
// @name         Owner On Room Name Hover
// @namespace    https://not.jew.dance
// @version      2
// @description  Show da owner
// @author       Your mom
// @icon         https://volafile.org/favicon.ico
// @match        https://volafile.org/r/*
// @require      https://cdn.jsdelivr.net/gh/volafiled/volascripts/dry.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
/* globals dry */

dry.once("load", () => {
  'use strict';
  String.prototype.capitalize = function() {
    return this[0].toUpperCase() + this.slice(1).toLowerCase();
  };
  const room_title = document.getElementById("name_container");
  dry.exts.connection.once("config", cfg => {
    if (!cfg.owner) {
      room_title.title = "Room has no owner";
    }
  });
  dry.exts.config.on("config_owner", owner => {
    if (owner) {
      room_title.title = `${owner.capitalize()} is the room owner`;
    }
    else {
      room_title.title = "Room has no owner";
    }
  });
});
