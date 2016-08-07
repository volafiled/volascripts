// ==UserScript==
// @name         VolaBan
// @namespace    http://jew.dance/
// @version      0.6
// @description  Filter annoying users aka MercWMouth
// @author       RealDolos
// @match        https://volafile.io/r/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    "use strict";

    const basebans = {
        staff: ["News"],
        exact: ["DeadPool", "Wade"],
        whites: ["real", "dolos"]
    };

    console.log("running", GM_info.script.name, GM_info.script.version);

    let bans;

    const make = function() {
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

    const save = function() {
        localStorage.setItem("bans", JSON.stringify(bans));
    };

    const ignore = (nick, options) => {
        return bans.rexact.test(nick) ||
            (options.staff && bans.rstaff.test(nick)) ||
            (!(options.staff || options.user) && bans.rwhites.test(nick));
    };

    addEventListener("DOMContentLoaded", function domload(e) {
        removeEventListener("DOMContentLoaded", domload, true);

        let exts = null;
        addEventListener("load", function _load() {
            removeEventListener("load", _load);
            exts = Room.prototype._extensions.connection.prototype.room.extensions;
        });

        const appendMessage = (user, message) => {
            exts.chat.showMessage(user, message, {
                dontsave: true,
                staff: true,
                highlight: true
            });
        };

        const chatp = Room.prototype._extensions.chat.prototype;

        // Will get rid of messages but not of notifications
        const showMessage = chatp.showMessage;
        chatp.showMessage = function(nick, message, options, ...args) {
            if (ignore(nick, options)) {
                console.error("ignored", nick, JSON.stringify(message), JSON.stringify(options));
                return false;
            }
            return showMessage.apply(this, [nick, message, options].concat(args));
        };

        const _ban = (what, type, who) => {
            if (!who) {
                return false;
            }
            who = who.trim();
            let a = bans[what == "w" ? "whites" : (what == "s" ? "staff" : "exact")];
            if (type == "block") {
                if (a.indexOf(who) < 0) {
                    a.push(who);
                }
            }
            else if (type == "unblock") {
                let index = a.indexOf(who);
                if (index > 0) {
                    a.splice(index, 1);
                }
            }
            save();
            make();
            appendMessage("VolaBan", `modified rules for ${what}:${who}`);
            return true;
        };
        const commands = {
            block(e) {
                return _ban("e", "block", e);
            },
            wblock(e) {
                return _ban("w", "block", e);
            },
            sblock(e) {
                return _ban("s", "block", e);
            },
            unblock(e) {
                return _ban("e", "unblock", e);
            },
            wunblock(e) {
                return _ban("w", "unblock", e);
            },
            sunblock(e) {
                return _ban("s", "unblock", e);
            },
            blockreset() {
                localStorage.removeItem("bans");
                make();
                appendMessage("VolaBan", "bans were reset!");
                return true;
            },
            blocklist() {
                let m = new window.Array();
                m.push({
                    "type": "text",
                    "value": `bans:`
                });
                m.push({"type": "break" });
                for (let i of ["whites", "exact", "staff"]) {
                    m.push({
                        "type": "text",
                        "value": `${i}: ${JSON.stringify(bans[i])}`
                    });
                    m.push({"type": "break" });
                }
                appendMessage("VolaBan", m);
                return true;
            },
        };

        // hook the original command processor
        const onCommand = chatp.onCommand;
        chatp.onCommand = function(command, e, ...args) {
            let fn = commands[command];
            if (fn && fn.call(commands, e, args)) {
                return;
            }
            args.unshift(e);
            args.unshift(command);
            return onCommand.apply(this, args);
        };

    }, true /* need to get before vola*/ );

    addEventListener("load", function load() {
        removeEventListener("load", load, false);
        let exts = Room.prototype._extensions.connection.prototype.room.extensions;

        // Hook the notifications listener too, which is an
        // anonymous function from a closure and hence we
        // have to find it within the registered events
        exts.connection._events.chatMessage.some(e => {
            const onChatMessage = e.fn;
            if (!/sage/.test("" + onChatMessage)) {
                return false;
            }
            e.fn = function(...args) {
                if (ignore(args[0], args[1], args[2])) {
                    return false;
                }
                return onChatMessage.apply(this, args);
            };
            return true;
        });

        console.log("loaded");
    }, false);
})();
