// ==UserScript==
// @name         VolaPG - Best crypto ever!!!1!
// @namespace    http://jew.dance/
// @version      0.23
// @description  If you think this will in any way protect you, you're wronk
// @author       topkuk productions
// @match        https://volafile.io/r/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @require      https://rawgit.com/tonyg/js-nacl/622d52f423f64f0d78cdc478fe8a6bfc2015b828/lib/nacl_factory.js
// @require      https://rawgit.com/gregjacobs/Autolinker.js/f8b1ff3f6161a5049e97600ad5795a47bf1f1769/dist/Autolinker.js
// @run-at       document-start
// ==/UserScript==

const baseMANY = (function() {
    "use strict";

    const codeToWord = new Map();
    let charToCode;
    let init = () => {
        let alpha =  "abcdefghijklmnopqrstuvwxyz" +
            "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
            "01234567890" + "äöüß" +
            '⢠⢡⢢⢣⢤⢥⢦⢧⢨⢩⢪⢫⢬⢭⢮⢯⢰⢱⢲⢳⢴⢵⢶⢷⢸⢹⢺⢻⢼⢽⢾⢿⣀⣁⣂⣃⣄⣅⣆⣇⣈⣉⣊⣋⣌⣍⣎⣏⣐⣑⣒⣓⣔⣕⣖⣗⣘⣙⣚⣛⣜⣝⣞⣟⣠⣡⣢⣣⣤⣥⣦⣧⣨⣩⣪⣫⣬⣭⣮⣯⣰⣱⣲⣳⣴⣵⣶⣷⣸⣹⣺⣻⣼⣽⣾⣿⤀⤁⤂⤃⤄⤅⤆⤇⤈⤉⤊⤋⤌⤍⤎⤏⤐⤑⤒⤓⤔⤕⤖⤗⤘⤙⤚⤛⤜⤝⤞⤟⤠⤡⤢⤣⤤⤥⤦⤧⤨⤩⤪⤫⤬⤭⤮⤯⤰⤱⤲⤳⤴⤵⤶⤷⤸⤹⤺⤻⤼⤽⤾⤿⥀⥁⥂⥃⥄⥅⥆⥇⥈⥉⥊⥋⥌⥍⥎⥏⥐⥑⥒⥓⥔⥕⥖⥗⥘⥙⥚⥛⥜⥝⥞⥟⥠⥡⥢⥣⥤⥥⥦⥧⥨⥩⥪⥫⥬⥭⥮⥯⥰⥱⥲⥳⥴⥵⥶⥷⥸⥹⥺⥻⥼⥽⥾⥿⦀⦁⦂⦃⦄⦅⦆⦇⦈⦉⦊⦋⦌⦍⦎⦏⦐⦑⦒⦓⦔⦕⦖⦗⦘⦙⦚⦛⦜⦝⦞⦟' +
            'ꀀꀁꀂꀃꀄꀅꀆꀇꀈꀉꀊꀋꀌꀍꀎꀏꀐꀑꀒꀓꀔꀕꀖꀗꀘꀙꀚꀛꀜꀝꀞꀟꀠꀡꀢꀣꀤꀥꀦꀧꀨꀩꀪꀫꀬꀭꀮꀯꀰꀱꀲꀳꀴꀵꀶꀷꀸꀹꀺꀻꀼꀽꀾꀿꁀꁁꁂꁃꁄꁅꁆꁇꁈꁉꁊꁋꁌꁍꁎꁏꁐꁑꁒꁓꁔꁕꁖꁗꁘꁙꁚꁛꁜꁝꁞꁟꁠꁡꁢꁣꁤꁥꁦꁧꁨꁩꁪꁫꁬꁭꁮꁯꁰꁱꁲꁳꁴꁵꁶꁷꁸꁹꁺꁻꁼꁽꁾꁿꂀꂁꂂꂃꂄꂅꂆꂇꂈꂉꂊꂋꂌꂍꂎꂏꂐꂑꂒꂓꂔꂕꂖꂗꂘꂙꂚꂛꂜꂝꂞꂟꂠꂡꂢꂣꂤꂥꂦꂧꂨꂩꂪꂫꂬꂭꂮꂯꂰꂱꂲꂳꂴꂵꂶꂷꂸꂹꂺꂻꂼꂽꂾꂿꃀꃁꃂꃃꃄꃅꃆꃇꃈꃉꃊꃋꃌꃍꃎꃏꃐꃑꃒꃓꃔꃕꃖꃗꃘꃙꃚꃛꃜꃝꃞꃟꃠꃡꃢꃣꃤꃥꃦꃧꃨꃩꃪꃫꃬꃭꃮꃯꃰꃱꃲꃳꃴꃵꃶꃷꃸꃹꃺꃻꃼꃽꃾꃿ';
        const sp = alpha.split("");
        for (let i = 0; i < 256; ++i) {
            let c = String.fromCharCode(0x0400 + i);
            if (c.length == 1) {
                sp.push(c);
            }
            c = String.fromCharCode(0x0600 + i);
            if (c.length == 1) {
                sp.push(c);
            }
            c = String.fromCharCode(0x0300 + i);
            if (c.length == 1) {
                sp.push(c);
            }
        }
        const freq = (function() {
            const f = {'E': 12.70, 'T': 9.06, 'A': 8.17, 'O': 7.51, 'I': 6.97, 'N': 6.75, 'S': 6.33, 'H': 6.09, 'R': 5.99, 'D': 4.25, 'L': 4.03, 'C': 2.78, 'U': 2.76, 'M': 2.41, 'W': 2.36, 'F': 2.23, 'G': 2.02, 'Y': 1.97, 'P': 1.93, 'B': 1.29, 'V': 0.98, 'K': 0.77, 'J': 0.15, 'X': 0.15, 'Q': 0.10, 'Z': 0.07, 'e': 12.70, 't': 9.06, 'a': 8.17, 'o': 7.51, 'i': 6.97, 'n': 6.75, 's': 6.33, 'h': 6.09, 'r': 5.99, 'd': 4.25, 'l': 4.03, 'c': 2.78, 'u': 2.76, 'm': 2.41, 'w': 2.36, 'f': 2.23, 'g': 2.02, 'y': 1.97, 'p': 1.93, 'b': 1.29, 'v': 0.98, 'k': 0.77, 'j': 0.15, 'x': 0.15, 'q': 0.10, 'z': 0.07, '0': 1, '1': 30.1, '2': 17.6, '3': 12.5, '4': 9.7, '5': 7.9, '6': 6.7, '7': 5.8, '8': 5.1, '9': 4.6};
            let rv = new Map();
            for (let k of Object.keys(f)) {
                rv.set(k.charCodeAt(0), f[k]);
            }
            return rv;
        })();
        charToCode = (function() {
            class Node {
                constructor(val, sco) {
                    this.score = sco;
                    this.val = val;
                }
            }

            const score = a => {
                return freq.get(a) || 0.01;
            };
            let m = [];
            const sortidx = (a, v) => {
                let lo = 0, hi = a.length;
                while (lo < hi) {
                    let m = lo + hi >>> 1;
                    if (a[m].score < v) {
                        lo = m + 1;
                    }
                    else {
                        hi = m;
                    }
                }
                return lo;
            };
            for (let a = 0; a < 256; ++a) {
                let sa = score(a);
                for (var b = 0; b < 256; ++b) {
                    let s = sa * score(b);
                    let val = a * 256 + b;
                    let nn = new Node(val, s);
                    let si = sortidx(m, nn.score);
                    m.splice(si, 0, nn);
                }
            }
            const c = sp.length;
            while (m.length > c) {
                let least = m.splice(0, Math.min(c, m.length - c + 1));
                let nn = new Node(null, least.reduce((a, b) => a + b.score, 0));
                nn.leaves = least;
                let si = sortidx(m, nn.score);
                m.splice(si, 0, nn);
            }
            let book = [];
            const assign = (prefix, e, i) => {
                let word = prefix + sp[i];
                if (e.val === null) {
                    e.leaves.forEach(assign.bind(null, word));
                    return;
                }
                book.push([e.val, word]);
            };
            m.forEach(assign.bind(null, ""));
            book.sort((a, b) => a[0] - b[0]);
            return book.map(e => {
                codeToWord.set(e[1], e[0]);
                return e[1];
            });
        })();
        init = () => {};
    };

    let te = new TextEncoder("utf-8");
    let td = new TextDecoder("utf-8");
    const encode = (text) => {
        if (typeof text === "string") {
            return encode(te.encode(text));
        }
        if (text.buffer instanceof ArrayBuffer) {
            return encode(text.buffer);
        }
        init();
        const dv = new DataView(text);
        const words = (dv.byteLength + (dv.byteLength % 2)) / 2;
        let r = [];
        for (let i = 0; i < words; ++i) {
            let val;
            try {
                val = dv.getUint16(i * 2, true);
                r.push(charToCode[val]);
            }
            catch (ex) {
                val = dv.getUint8(i * 2);
                val = val * 256 + val;
                r.push(charToCode[val]);
                r.push(";");
            }
        }
        return r.join("");
    };

    const decode = (text, toText) => {
        let rv = [];
        let pf = "";
        text = text.split("");
        let remlast = false;
        init();
        while (text.length) {
            pf += text.shift();
            let val = codeToWord.get(pf);
            if (isFinite(val)) {
                pf = "";
                rv.push(val);
            }
            else if (pf === ";") {
                pf = "";
                remlast = true;
            }
        }
        if (pf.length) {
            throw new Error("Failed to decode!");
        }
        let a = new ArrayBuffer(rv.length * 2);
        let dv = new DataView(a);
        rv.forEach((e, i) => dv.setUint16(i*2, e, true));
        let u8 = new Uint8Array(a);
        if (!toText) {
            if (!remlast) {
                return u8;
            }
            let rv = new Uint8Array(a.byteLength - 1);
            for (let i = 0; i < a.byteLength - 1; ++i) {
                rv[i] = u8[i];
            }
            return rv;
        }
        rv = td.decode(u8);
        if (remlast) {
            rv = rv.substr(0, rv.length -1);
        }
        return rv;
    };
    return {
        encode: encode,
        decode: decode
    };
})();

addEventListener("DOMContentLoaded", function domload(e) {
    "use strict";

    let exportObject = function(o) {
        return unsafeWindow.JSON.parse(JSON.stringify(o));
    };

    if (!this.exportFunction) {
        this.exportFunction = (fn, o) => fn;
        exportObject = o => o;
    }

    let config = window.config || unsafeWindow.config;

    removeEventListener("DOMContentLoaded", domload, true);

    console.log("running", GM_info.script.name, GM_info.script.version);

    const reconstruct = (() => {
        let hue = new this.Autolinker({
            phone: false,
            twitter: false,
            hashtag: "twitter",
        });
        return function(text) {
            let rv = new unsafeWindow.Array();
            let pieces = text.split("\n");
            for (let p of pieces) {
                p = p.trim();
                let lidx = 0;
                let matches = hue.removeUnwantedMatches(hue.compactMatches(hue.parseText(p)));
                for (let m of matches) {
                    let idx = m.getOffset();
                    if (idx !== lidx) {
                        rv.push({type: "text", value: p.substring(lidx, idx)});
                    }
                    switch (m.getType()) {
                        case "hashtag":
                            rv.push({type: "room", id: m.getHashtag(), name: "Some Room"});
                            break;
                        default:
                            rv.push({type: "url", href: m.getAnchorHref(), text: m.getAnchorText()});
                            break;
                    }
                    lidx = idx + m.getMatchedText().length;
                }
                let last = p.substring(lidx);
                if (last && last.length) {
                    rv.push({type: "text", value: last});
                }
                rv.push({type: "break"});
            }
            rv.pop(); // last break;
            return rv;
        };
    })();

    let exts = null;
    addEventListener("load", function _load() {
        removeEventListener("load", _load);
        exts = unsafeWindow.Room.prototype._extensions.connection.prototype.room.extensions;
        appendMessage("VolaPG",
                      "is not secure, especially not in /c mode. " +
                      "Use /pubkey to retrieve public key",
                      {me: true, highlight: false});
    });

    let nacl;
    nacl_factory.instantiate(function(_nacl) {
        nacl = _nacl;
    });

    let shit = {
        _pubcache: new Map(),
        serializeKeys: function(keys) {
            let s = {
                boxSk: nacl.to_hex(keys.boxSk),
                boxPk: nacl.to_hex(keys.boxPk)
            };
            return JSON.stringify(s);
        },
        getKeys: function(reset) {
            let rv = GM_getValue('vpgkeypair');
            if (!rv || reset) {
                rv = nacl.crypto_box_keypair();
                shit.setKeys(rv);
                return rv;
            }
            rv = JSON.parse(rv);
            return {
                boxSk: nacl.from_hex(rv.boxSk),
                boxPk: nacl.from_hex(rv.boxPk)
            };
        },
        setKeys: function (keys) {
            GM_setValue('vpgkeypair', shit.serializeKeys(keys));
        },
        getPubKey: function () {
            return 'vgpk#' + nacl.to_hex(shit.getKeys().boxPk);
        },
        getSerializedKeys: function () {
            return shit.serializeKeys(shit.getKeys());
        },
        combine: function (a, b) {
            if (!(a instanceof Uint8Array)) {
                a = nacl.encode_utf8(a);
            }
            if (!(b instanceof Uint8Array)) {
                b = nacl.encode_utf8(b);
            }
            return nacl.from_hex(nacl.to_hex(a) + nacl.to_hex(b));
        },
        // ridicously shitty KDF, like a hmac lite but with A LOT MORE BUGS.
        // Totally secure, I swears, not that is really matters, are the PRNG of most
        // JS engines is shit anyway, even for the "crypto" variant
        mackdf: function (key, msg) {
            let r = nacl.crypto_hash(shit.combine(key, msg));
            for (let i = 0; i < r.byteLength; ++i) {
                r[i] = r[i] ^ 54;
            }
            let o = new Uint8Array(key.buffer.slice(0)).subarray(0, key.byteLength);
            for (let i = 0; i < o.byteLength; ++i) {
                o[i] = o[i] ^ 92;
            }
            return nacl.crypto_hash(shit.combine(o, r));
        },
        // Wonder if truncating the nounce makes shit more secure? I think it does!!!!1!
        obfuscate: function (key, msg) {
            let rnounce = nacl.crypto_secretbox_random_nonce().subarray(0, 6);
            key = shit.mackdf(rnounce, key);
            let nounce = shit.combine(rnounce, key.subarray(32, 50));
            key = key.subarray(0, 32);
            let rv = nacl.crypto_secretbox(nacl.encode_utf8(msg), nounce, key);
            rv = shit.combine(rnounce, rv);
            return 'c#' + baseMANY.encode(rv);
        },
        encryptFor: function (user, msg) {
            return new Promise(function (resolve, reject) {
                function _encrypt(pubkey) {
                    try {
                        let keys = shit.getKeys();
                        let rnounce = nacl.crypto_box_random_nonce().subarray(0, 8);
                        let nounce = shit.combine(
                            rnounce, keys.boxPk.subarray(0, 24 - rnounce.byteLength));
                        msg = nacl.crypto_box(
                            nacl.encode_utf8(msg), nounce, pubkey, keys.boxSk);
                        resolve('p#' + baseMANY.encode(
                            shit.combine(shit.combine(rnounce, keys.boxPk), msg)));
                    }
                    catch (ex) {
                        reject(ex);
                    }
                }
                user = user.toLowerCase();
                let key = shit._pubcache.get(user);
                if (key) {
                    return _encrypt(key);
                }
                try {
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: 'https://volafile.io/user/' + user,
                        onload: function (r) {
                            try {
                                let m = r.responseText.match(/vgpk#\S+/g);
                                if (!m) {
                                    throw new Error('user did not provide public key');
                                }
                                m = nacl.from_hex(m[0].substr(5).trim());
                                if (!m) {
                                    throw new Error('Failed to decode public key');
                                }
                                shit._pubcache.set(user, m);
                                return _encrypt(m);
                            }
                            catch (ex) {
                                reject(ex);
                            }
                        },
                        onerror: function () {
                            reject('failed to get public key');
                        }
                    });
                }
                catch (ex) {
                    reject(ex);
                }
            });
        },
        _decrypt: function (key, msg) {
            if (!msg.startsWith('c#')) {
                throw new Error('not encrypted');
            }
            let data = baseMANY.decode(msg.substr(2));
            let rnounce = data.subarray(0, 6);
            data = data.subarray(6);
            key = shit.mackdf(rnounce, key);
            let nounce = shit.combine(rnounce, key.subarray(32, 50));
            key = key.subarray(0, 32);
            return "[PubPG] " + nacl.decode_utf8(nacl.crypto_secretbox_open(data, nounce, key));
        },
        _decryptFrom: function (msg) {
            if (!msg.startsWith('p#')) {
                throw new Error('not encrypted');
            }
            let data = baseMANY.decode(msg.substr(2));
            let rnounce = data.subarray(0, 8);
            let pubkey = data.subarray(8, 40);
            data = data.subarray(40);
            let nounce = shit.combine(rnounce, pubkey.subarray(0, 24 - rnounce.byteLength));
            let keys = shit.getKeys();
            msg = nacl.crypto_box_open(data, nounce, pubkey, keys.boxSk);
            return "[PrivPG] " + nacl.decode_utf8(msg);
        },
        decrypt: function (key, msg) {
            if (msg.startsWith('c#')) {
                return shit._decrypt(key, msg);
            }
            if (msg.startsWith('p#')) {
                return shit._decryptFrom(msg);
            }
            throw Error('unhandled');
        }
    };

    const appendMessage = (user, message, options) => {
        if (!exts) {
            exts = unsafeWindow.Room.prototype._extensions.connection.prototype.room.extensions;
        }
        let o = {
            dontsave: true,
            staff: true,
            highlight: true
        };
        options = options || {};
        for (let k in options) {
            o[k] = options[k];
        }
        if (message.trim) {
            message = [{type: "text", value: message}];
        }
        exts.chat.showMessage(user, exportObject(message), exportObject(o));
    };

    const chatp = unsafeWindow.Room.prototype._extensions.chat.prototype;

    // Will get rid of messages but not of notifications
    const showMessage = chatp.showMessage;
    chatp.showMessage = exportFunction(function(nick, message, options, ...args) {
        let text = [];
        if (message.trim) {
            text = message;
        }
        else {
            for (let m of message) {
                switch (m.type) {
                    case "text":
                        text.push(m.value);
                        break;
                    case "break":
                        text.push("\n");
                        break;
                    case "url":
                        text.push(m.url);
                        break;
                }
            }
            text = text.join("");
        }
        try {
            text = shit.decrypt(
                nick + config.room_id, text);
            message = exportObject(reconstruct(text));
            if (text.startsWith("[PrivPG]")) {
                options.highlight = true;
            }
        }
        catch (ex) {
            if (ex.message.indexOf('crypto_box_open signalled') > 0) {
                console.error(text, ex);
                return;
            }
            else if (ex.message != 'unhandled') {
                console.log(ex);
                appendMessage('VolaPG', 'Could not decode message: ' + (ex.message || ex));
            }
        }
        let a = new unsafeWindow.Array();
        a.push(nick); a.push(message); a.push(options);
        for (let i of args) a.push(i);
        return showMessage.apply(this, a);
    }, unsafeWindow);

    const commands = {
        c(e) {
            exts.chat.applyNick();
            let enc = shit.obfuscate(exts.user.name + config.room_id, e);
            exts.chatInput.emit("chat", enc);
            return true;
        },
        p(e) {
            try {
                exts.chat.applyNick();
                e = e.split(/^(\S+) +((?:.|\n)+)$/);
                if (!e || e.length < 3) {
                    throw Error('Invalid format');
                }
                shit.encryptFor(e[1], e[2]).then(function (m) {
                    try {
                        exts.chat.applyNick();
                        exts.chatInput.emit("chat", m);

                        appendMessage('VolaPG', '[Sent to ' + e[1] + '] ' + e[2]);
                    }
                    catch (ex) {
                        console.error(ex);
                    }
                }, function (ex) {
                    appendMessage('VolaPG', ex.message || ex);
                });
            }
            catch (ex) {
                alert(ex);
            }
            return true;
        },
        pubkey() {
            appendMessage('VolaPG Pubkey', shit.getPubKey());
            return true;
        },
        keys() {
            appendMessage('VolaPG Keys (do not share)', shit.getSerializedKeys());
            return true;
        },
        newkeys() {
            appendMessage('VolaPG', 'Keys reset');
            return true;
        },
        setkeys(keys) {
            try {
                keys = JSON.parse(keys);
                keys.boxPk = nacl.from_hex(keys.boxPk);
                keys.boxSk =  nacl.from_hex(keys.boxSk);
                shit.setKeys(keys);
                appendMessage('VolaPG', 'Keys set');
            }
            catch (ex) {
                alert(ex);
            }
            return true;
        },
        pghelp() {
            appendMessage("VolaPG", new unsafeWindow.Array(
                {type: "text", value: "pls welp!"},
                {type: "break"},
                {type: "text", value: "use /c to send a sekrit message"},
                {type: "break"},
                {type: "text", value: "use /p <user> to send a private sekrit message"},
                {type: "break"},
                {type: "text", value: "use /pubkey to get your public key"},
                {type: "break"},
                {type: "text", value: "use /keys to get your keys"},
                {type: "break"},
                {type: "text", value: "use /newkeys to generate new keys"},
                {type: "break"},
                {type: "text", value: "use /setkeys to set existing keys (you got from /keys earlier)"}
            ));
            return true;
        },
    };

    // hook the original command processor
    const onCommand = chatp.onCommand;
    chatp.onCommand = exportFunction(function(command, e, ...args) {
        let fn = commands[command];
        if (fn && fn.call(commands, e, args)) {
            return;
        }
        args.unshift(e);
        args.unshift(command);
        let a = new unsafeWindow.Array();
        a.push(command); a.push(e);
        for (let i of args) a.push(i);
        return onCommand.apply(this, a);
    }, unsafeWindow);
}.bind(this), true /* need to get before vola*/ );
