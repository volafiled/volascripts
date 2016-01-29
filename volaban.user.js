// ==UserScript==
// @name         VolaBan
// @namespace    http://jew.dance/
// @version      0.5
// @description  Filter annoying users aka MercWMouth
// @author       RealDolos
// @match        https://volafile.io/r/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

"use strict";

const basebans = {
  staff: ["News", "MercWMouth"],
  exact: ["DeadPool", "Wade"],
  whites: ["real", "dolos"]
};

let bans;

let make = function() {
    let base = JSON.parse(JSON.stringify(basebans));
    bans = JSON.parse(localStorage.getItem("bans"));
    if (!bans) {
        bans = base;
    }
    else {
        bans = Object.setPrototypeOf(bans, base);
    }

    for (let key in basebans) {
        bans["r" + key] = key == "whites" ?
            new RegExp(`(?:${bans[key].join("|")})`, "i") :
            new RegExp(`^(?:${bans[key].join("|")})$`, "i");
    }
    console.log(bans);
};
make();

let save = function() {
    localStorage.setItem("bans", JSON.stringify(bans));
};

let handle = function(what, type, val) {
    if (!val) {
        return;
    }
    let a = bans[what == "w" ? "whites" : (what == "s" ? "staff" : "exact")];
    if (type == "block") {
        if (a.indexOf(val) < 0) {
            a.push(val);
        }
    }
    else if (type == "unblock") {
        let index = a.indexOf(val);
        if (index > 0) {
            a.splice(index, 1);
        }
    }
    save();
    make();
};

WebSocket = window.WebSocket = (function(ws) {
    function ignore(m) {
        if (!m.startsWith("4")) {
            return false;
        }
        m = JSON.parse(m.substr(1));
        if (!m) {
            return false;
        }
        m = m[1];
        if (!m) {
            return false;
        }
        m = m[0];
        if (!m) {
            return false;
        }
        m = m[1];
        if (!m || m[0] !== "chat") {
            return false;
        }
        m = m[1];
        return bans.rexact.test(m.nick) ||
            (m.options.staff && bans.rstaff.test(m.nick)) ||
            (!(m.options.staff || m.options.user) && bans.rwhites.test(m.nick));
    }

    // I'd usually use a proxy, but thanks Chrome for not supporting ecma-6
    let WebSocket = function(url, protocols) {
        this.ws = new ws(url, protocols);
        this.ws.onmessage = function(e) {
            try {
                if (ignore(e.data)) {
                    console.log("filtered", e.data);
                    return true;
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

addEventListener("load", function load() {
    removeEventListener("load", load, false);

    let msgs = document.querySelector('#chat_messages');
    let appendMessage = function (user, msg) {
        let div = document.createElement('div');
        div.setAttribute('class', 'chat_message user profile');
        let a = document.createElement('a');
        a.setAttribute('class', 'username');
        a.textContent = user + ':';
        div.appendChild(a);
        let span = document.createElement('span');
        span.setAttribute('class', 'chat_text');
        span.textContent = msg;
        div.appendChild(span);
        msgs.appendChild(div);
        msgs.scrollTop = msgs.scrollHeight;
    };

    let chat = document.querySelector('#chat_input');
    let cancel = function(e) {
        chat.value = ''; // cancel out so it won't get send, ever
        e.stopPropagation();
        e.preventDefault();
    };
    chat.addEventListener('keydown', function (e) {
        if (e.keyCode !== 13 || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
            return;
        }
        let m = /^[/.]([sw]?)((?:un)?block)\s+([^\s]+)$/.exec(chat.value);
        if (m) {
            cancel(e);
            let what = m[1];
            let type = m[2];
            let val = m[3];
            handle(what, type, val);
            appendMessage("VolaBan", "modified rules for " + val);
        }
        else if (chat.value == "/blockreset") {
            cancel(e);
            localStorage.removeItem("bans");
            make();
            appendMessage("VolaBan", "bans were reset!");
        }
        else if (chat.value == "/blocklist") {
            cancel(e);
            appendMessage("VolaBan", "bans: " + JSON.stringify(bans));
        }
    }, false);
    console.log("loaded");
}, false);
