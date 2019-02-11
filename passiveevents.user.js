// ==UserScript==
// @name        Passive events
// @namespace   https://volafile.org
// @icon        https://volafile.org/favicon.ico
// @author      topkuk productions
// @include     https://volafile.org/r/*
// @match       https://volafile.org/r/*
// @version     1
// @description Because performance!
// @grant       none
// @run-at      document-start
// ==/UserScript==

(function() {
  'use strict';
  const unfucked = Object.freeze(new Set([
    "resize",
    "wheel",
    "scroll",
    "mouseenter",
    "mousemove",
    "mouseexit",
    "mouseleave",
    "mousewheel",
    "touchmove",
    ]));
  const addEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, fn, opts, ...args) {
    if (unfucked.has(type)) {
      if (typeof opts == "boolean") {
        opts = {
          capture: opts,
          passive: true
        };
      }
      else if (opts && typeof opts === "object") {
        opts = Object.assign({}, opts, {passive: true});
      }
      else {
        opts = {"passive": true};
      }
    }
    return addEventListener.call(this, type, fn, opts, ...args);
  }
})();
