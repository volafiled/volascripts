// ==UserScript==
// @name         Lain is annoying
// @namespace    https://volafile.org/
// @version      3
// @description  He really is
// @author       topkuk productions
// @match        https://volafile.org/r/*
// @grant        unsafeWindow
// @require      https://rawgit.com/RealDolos/volascripts/1dd689f72763c0e59f567fdf93865837e35964d6/dry.js
// @run-at       document-start
// @icon         https://volafile.org/favicon.ico
// ==/UserScript==

dry.once("dom", () => {
    "use strict";
    function unannoy() {}

    for (let m of ["showAdultWarning", "showOldRoom"]) {
        try {
            dry.replaceEarly("messages", m, unannoy);
        }
        catch (ex) {
            console.log("coun't bind", m);
        }
    }
});
