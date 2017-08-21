// ==UserScript==
// @name         you complete me!
// @namespace    https://volafile.org/
// @author       topkuk productions
// @icon         https://volafile.org/favicon.ico
// @version      5
// @description  So you can better ignore people
// @match        https://volafile.org/r/*
// @grant        none
// @require      https://cdn.rawgit.com/RealDolos/volascripts/6879f622f45d2b79dd9f004754c28ffa0075a12b/dry.js
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    console.log("running", GM_info.script.name, GM_info.script.version, dry.version);

    const always = [
        "RealDolos", "Dongmaster", "MercWMouth", "TheJIDF", "Kreg", "roboCOP", "Lain", "Heisenb3rg", "Red", "dad",
        "auxo", "MoDChatbot", "bain", "lmmortal", "someguy1992", "evilant", "Szeraton", "NEPTvola", "EffEff", ];
    let never = new Set(["Wombot", "News", "Network", "MOTD", "System", "CucklordSupreme", "Report", "VolaPG", "KakKakken", "Rogueian", "Log", "Twitter", "Record",]);
    const limit = 30;
    
    never = new Set(Array.from(never).map(e => e.toUpperCase()));
    
    const filter = function(current, e) {
        const u = e.toUpperCase();
        if (this.has(u) || never.has(u) || current === u) {
            return false;
        }
        this.add(u);
        return true;
    };
    
    const addn = dry.replaceLate("chat.chatInput", "addSuggestion", function(orig, str, ...args) {
        const current = dry.exts.user.name.toUpperCase();
        let e = this.suggestions;
        str = str.toString();
        const ustr = str.toUpperCase();
        if (!str || never.has(ustr) || e.indexOf(str) === 0 || ustr === current) {
            return;
        }
        // Delay stuff a bit to avoid people stealing completes; suggestion by the Redard
        setTimeout(() => {
            let newSuggestions = [...[str, ...e].slice(0, limit), ...always];
            try {
                newSuggestions = newSuggestions.filter(filter.bind(new Set(), current));
                this.suggestions = newSuggestions;
            }
            catch (ex) {
                console.error(ex);
            }
        }, 1000);
    });
    addn("");
    setTimeout(() => addn(""), 1000);
})();
