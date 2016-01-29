// ==UserScript==
// @name         Proper user names
// @namespace    http://jew.dance/
// @version      0.3
// @description  Properly name users
// @author       RealDolos
// @match        https://volafile.io/r/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

"use strict";

const replacements = [
    [/mercwmouth/gi, "NiggerOnly4Penis"],
    [/deadpool/gi, "PanSexFaggot"],
    [/mcgill/gi, "SuperMarky"],
    [/\bcounselor\b/gi, "CounselorPedro"],
    [/\bLewdBot\b/gi, "Dungmaster"]
];

WebSocket = window.WebSocket = (function(ws) {
    // I'd usually use a proxy, but thanks Chrome for not supporting ecma-6
    var WebSocket = function(url, protocols) {
        this.ws = new ws(url, protocols);
        this.ws.onmessage = function(e) {
            try {
                let data = e.data;
                for (let i of replacements) {
                    data = data.replace(i[0], i[1]);
                }
                if (data != e.data) {
                    e = new MessageEvent(e.type, {data: data, origin: e.origin, lastEventId: e.lastEventId, channel: e.channel, source: e.source, ports: e.ports});
                }
            }
            catch (ex) {
                console.error(e, ex);
            }
            return this.onmessage && this.onmessage(e);
        }.bind(this);
    };
    WebSocket.prototype = {
        get url() { return this.ws.url; },

        CONNECTING: ws.CONNECTING,
        OPEN: ws.OPEN,
        CLOSING: ws.CLOSING,
        CLOSED: ws.CLOSED,

        get readyState() { return this.ws.readyState; },
        get bufferedAmount() { return this.ws.ufferedAmount; },

        get onopen() { return this.ws.onopen; },
        set onopen(nv) { return this.ws.onopen = nv; },
        get onerror() { return this.ws.onerror; },
        set onerror(nv) { return this.ws.onerror = nv; },
        get onclose() { return this.ws.onclose; },
        set onclose(nv) { return this.ws.onclose = nv; },
        get extensions() { return this.ws.extensions; },
        get protocol() { return this.ws.protocol; },

        close: function(code, reason) { this.ws.close(code || 1000, reason || ""); },

        // onmessage handled in ctor
        get binaryType() { return this.ws.binaryType; },
        set binaryType(nv) { return this.ws.binaryType = nv; },

        send: function(data) { this.ws.send(data); }
    };
    return WebSocket;
})(window.WebSocket);
