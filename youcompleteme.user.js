// ==UserScript==
// @name         you complete me!
// @namespace    https://not.jew.dance/
// @version      0.6
// @description  Everybody hate a swede today!
// @author       Your mom
// @match        https://volafile.io/r/*
// @grant        none
// @require      https://rawgit.com/RealDolos/volascripts/064d22df5566bda12d222822584b87dcc6a43d45/dry.js
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    console.log("running", GM_info.script.name, GM_info.script.version, dry.version);

    const always = ["Dongmaster", "MercWMouth", "murcmoth", "TheJIDF", "Kreg", "roboCOP", "lain"];
    const never = new Set(["News", "Network", "MOTD", "System", "CucklordSupreme", "Report", "VolaPG", "KakKakken", "Rogueian", "Log"]);
    const limit = 25;

    const addn = dry.replaceLate("chatInput", "addNickname", function(orig, str, ...args) {
        let e = this.nicknames;
        if (never.has(str.toString()) || e.indexOf(str) === 0) {
            return;
        }
        this.nicknames = dry.unique([...dry.unique([str, ...e].filter(e => !never.has(e))).slice(0, limit), ...always]);
    });
    addn("");
    setTimeout(() => addn(""), 1000);
})();
