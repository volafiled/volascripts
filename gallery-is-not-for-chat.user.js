// ==UserScript==
// @name         gallery is not for chat
// @version      2
// @description  It really is not!
// @namespace    https://volafile.org
// @icon         https://volafile.org/favicon.ico
// @author       topkuk productions
// @match        https://volafile.org/r/*
// @grant        none
// @require      https://cdn.jsdelivr.net/gh/volafiled/volascripts@a9c0424e5498deea9fd437c15b2137c3bec07c61/dry.min.js
// @run-at       document-start
// ==/UserScript==
/* globals dry */

dry.once("load", () => {
  "use strict";
  const $ = sel => document.querySelector(sel);
  const style = document.createElement("style");
  style.textContent = `
.blur {
    -webkit-filter: none;
    -moz-filter:  none;
    -o-filter: none;
    -ms-filter: none;
    filter: none;
}
.blur #call_to_action_container,
.blur #files_scroller,
.blur #radio_container {
    -webkit-filter: blur(5px);
    -moz-filter: blur(5px);
    -o-filter: blur(5px);
    -ms-filter: blur(5px);
    filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius='5');
}
`;
  document.body.appendChild(style);
  const g = dry.exts.gallery;
  const scroll_files = function(e) {
    if (e.deltaY > 0) {
      g.next();
    }
    else {
      g.previous();
    }
  };
  const frame = $("#files_frame");
  const gframe = $("#gallery_frame");
  gframe.addEventListener("wheel", scroll_files, {passive: true});
  frame.appendChild(gframe);
});
