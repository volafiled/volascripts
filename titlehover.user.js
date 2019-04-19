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
  function splitIntoLines(input, len) {
    // thanks, stacko! https://stackoverflow.com/a/6632755/8774873
    len = len || 40;
    let temp;
    let lineSoFar = "";
    const output = [];
    const addWordOntoLine = function(line, word, i) {
      if (line.length !== 0 && i > 1) {
        line += ", ";
      }
      return line += word;
    };
    for (let i = 0; i < input.length;) {
      // check if adding this word would exceed the len
      temp = addWordOntoLine(lineSoFar, input[i], i);
      if (temp.length > len) {
        if (lineSoFar.length === 0) {
          lineSoFar = temp;     // force to put at least one word in each line
          i++;                  // skip past this word now
        }
        output.push(lineSoFar);   // put line into output
        lineSoFar = "";           // init back to empty
      }
      else {
        lineSoFar = temp;         // take the new word
        i++;                      // skip past this word now
      }
    }
    if (lineSoFar.length > 0) {
      output.push(lineSoFar);
    }
    return output.join("\n");
  }

  dry.exts.connection.on("config", cfg => {
    if (typeof cfg.owner === "string" || room_owner) {
      room_owner = cfg.owner ? `${cfg.owner} is the room owner` : room_owner;
    }
    else {
      room_owner = "Room has no owner";
    }
    if (Array.isArray(cfg.janitors)) {
      cfg.janitors.unshift("\nJanitors: ");
      jannies = cfg.janitors.length > 1 ? `${splitIntoLines(cfg.janitors, 36)}` : "";
    }
    room_title.title = `${room_owner}${jannies}`;
  });
});
