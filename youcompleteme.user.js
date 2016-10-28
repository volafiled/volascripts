// ==UserScript==
// @name         you complete me!
// @namespace    https://not.jew.dance/
// @version      0.3
// @description  Everybody hate a swede today!
// @author       Your mom
// @match        https://volafile.io/r/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    console.log("running", GM_info.script.name, GM_info.script.version);

    const always = ["Dongmaster", "MercWMouth", "murcmoth", "TheJIDF", "Kreg", "roboCOP", "lain", "Hillary", "Trump"];
    const never = new Set(["News", "MOTD", "System", "CucklordSupreme", "Report", "VolaPG", "KakKakken"]);
    const limit = 25;
    const exts = Room.prototype._extensions.connection.prototype.room.extensions;
    exts.chatInput.addNickname = function(t) {
        let e = this.nicknames;
        if (never.has(t.toString()) || e.indexOf(t) === 0) {
            return;
        }
        this.nicknames = [t, ...e, ...always].filter(function(e) {
            return !!e && !never.has(e) && (!this.has(e) && !!this.add(e));
        }, new Set()).slice(-limit);
    };

    // initialization order is for white Argentinians-hack
    exts.chatInput.addNickname("");
    setTimeout(() => exts.chatInput.addNickname(""), 1000);
})();
