// ==UserScript==
// @name         you complete me!
// @namespace    https://not.jew.dance/
// @version      0.8
// @description  Everybody hate a swede today!
// @author       Your mom
// @match        https://volafile.io/r/*
// @match        https://volafile.org/r/*
// @grant        none
// @require      https://rawgit.com/RealDolos/volascripts/a9c0424e5498deea9fd437c15b2137c3bec07c61/dry.js
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    console.log("running", GM_info.script.name, GM_info.script.version, dry.version);

    const always = ["Dongmaster", "MercWMouth", "murcmoth", "TheJIDF", "Kreg", "roboCOP", "lain"];
    const never = new Set(["Wombot", "News", "Network", "MOTD", "System", "CucklordSupreme", "Report", "VolaPG", "KakKakken", "Rogueian", "Log", "Twitter",]);
    const limit = 25;

    const addn = dry.replaceLate("chat.chatInput", "addSuggestion", function(orig, str, ...args) {
        let e = this.suggestions;
        if (never.has(str.toString()) || e.indexOf(str) === 0) {
            return;
        }
        this.suggestions = dry.unique([...dry.unique([str, ...e].filter(e => !never.has(e))).slice(0, limit), ...always]);
    });
    addn("");
    setTimeout(() => addn(""), 1000);
})();
