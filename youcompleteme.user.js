// ==UserScript==
// @name         you complete me!
// @namespace    https://volafile.org/
// @author       topkuk productions
// @icon         https://volafile.org/favicon.ico
// @version      3
// @description  So you can better ignore people
// @match        https://volafile.org/r/*
// @grant        none
// @require      https://cdn.rawgit.com/RealDolos/volascripts/6879f622f45d2b79dd9f004754c28ffa0075a12b/dry.js
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
