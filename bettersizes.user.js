// ==UserScript==
// @name         Better sizes
// @namespace    https://volafile.org/
// @icon         https://volafile.org/favicon.ico
// @version      1
// @description  Because lain
// @author       Me
// @match        https://volafile.org/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    var prettySize = (function(uselocale) {
        function toLocaleStringSupportsLocales() {
            var number = 0;
            try {
                number.toLocaleString('i');
            } catch (e) {
                return e.name === 'RangeError';
            }
            return false;
        }
        var fixer = uselocale && toLocaleStringSupportsLocales() ?
            function (digits) {
                return this.toLocaleString(undefined, {
                    minimumFractionDigits: digits,
                    maximumFractionDigits: digits,
                    useGrouping: false
                });
            } :
        Number.prototype.toFixed;
        var units = [
            ' B',
            ' KB',
            ' MB',
            ' GB',
            ' TB',
            ' PB',
            ' EB',
            ' MercoByte'
        ];
        return function prettySize(n) {
            var o = 0, f = 0, u;
            while (n > 1024) {
                n /= 1024;
                ++o;
            }
            if (!o) {
                return n.toFixed(0) + ' B';
            }
            u = units[o];
            if (n < 10) {
                f = 2;
            }
            else if (n < 100) {
                f = 1;
            }
            if (o > 3) {
                // large size force multiplier: adds +3cp
                ++f;
            }
            return fixer.call(n, f) + units[o];
        };
    })(false);

    function DOET() {
        if (window.format && window.format.prettySize) {
            window.format.prettySize = prettySize;
            return;
        }
        setTimeout(DOET, 0);
    }
    DOET();
})();
