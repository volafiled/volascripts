// ==UserScript==
// @name         Freaky Names
// @namespace    http://jew.dance/
// @version      0.3
// @description  ...and shit
// @author       RealDolos
// @match        https://volafile.io/r/*
// @grant        none
// ==/UserScript==

"use strict";

const colors = {
  "getddosed": "blue",
  "thejidf|jewmobile": "pink",
  "auxo": "yellow",
  "31337h4x0r|realdolos|vagfacetrm|robocuck|(?:Red|Dong|Immor|lg188)dolos": "white"
};

console.log("running", GM_info.script.name, GM_info.script.version);

const target_chat = document.querySelector('#chat_messages');
(function() {
  const r_colors = [];
  for (let name in colors) {
    r_colors.push([new RegExp(name, "i"), colors[name]]);
  }

  const observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        let messages = mutation.addedNodes;
        for (let i = 0; i < messages.length; i++) {
          // This includes the person's IP address and timestamp
          // (if the timestamp script is installed)
          let username = messages[i].getElementsByClassName("username")[0];
          for (let r of r_colors) {
            if (r[0].test(username.textContent)) {
              username.style.color = r[1];
            }
          }
        }
    });
  });
  observer.observe(target_chat, {childList: true});
})();
