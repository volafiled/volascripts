// ==UserScript==
// @name        VolaPassiveScroll
// @namespace   https://volafile.org
// @description your passive weapon of choice
// @include     https://volafile.org/r/*
// @icon        https://volafile.org/favicon.ico
// @author      Buddy Boi
// @match       https://volafile.org/r/*
// @require     https://cdn.jsdelivr.net/gh/szero/simpler-scrollbar/simplerscrollbar.min.js
// @require     https://cdn.jsdelivr.net/gh/volafiled/volascripts/dry.js
// @grant       none
// @run-at      document-start
// @version     1
// ==/UserScript==
/* globals dry, SimplerScrollbar, GM */
dry.once("load", () => {
  "use strict";
  console.log("running", GM.info.script.name, GM.info.script.version);
  const $ = el => document.querySelector(el);
  const container = $("#files_frame");
  const wrapper = $("#files_scroller");
  const content = $("#files_content");
  SimplerScrollbar.initContainer({container, wrapper, content, rightOffset: 2});
  const new_scrollbar = $(".ss-scroll");
  new_scrollbar.classList.add("scroller-slider");
  wrapper.removeChild($("#files_scroller > .scroller-pane"));
});
