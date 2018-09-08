// ==UserScript==
// @name         VolaPG - Best crypto ever!!!1!
// @namespace    https://volafile.org/
// @version      39
// @description  If you think this will in any way protect you, you're wronk
// @icon         https://volafile.org/favicon.ico
// @author       topkuk productions
// @match        https://volafile.org/r/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// @grant        unsafeWindow
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require      https://cdn.rawgit.com/tonyg/js-nacl/334f0587103bd3b7e721b92fc1d2a38a8f23708d/lib/nacl_factory.js
// @require      https://cdn.rawgit.com/gregjacobs/Autolinker.js/424c3242d5c9675a5997ce62120820ba55e073b3/dist/Autolinker.min.js
// @require      https://cdn.rawgit.com/RealDolos/volascripts/1dd689f72763c0e59f567fdf93865837e35964d6/dry.js
// @require      https://cdn.rawgit.com/RealDolos/volascripts/1dd689f72763c0e59f567fdf93865837e35964d6/baseMANY.js
// @run-at       document-start
// ==/UserScript==
/* global GM, dry, Autolinker, nacl_factory, baseMANY */

dry.once("dom", () => {
  "use strict";

  console.log(
    "running", GM.info.script.name, GM.info.script.version, dry.version);

  const reconstruct = (() => {
    this.Autolinker.matcher.Mention.prototype.matcherRegexes.instagram = new RegExp(`@[_.${Autolinker.RegexLib.alphaNumericCharsStr}-]{1,50}`, "g");
    const hue = new this.Autolinker({
      phone: false,
      twitter: false,
      hashtag: "twitter",
      mention: "instagram",
    });
    return function(text) {
      const rv = new dry.unsafeWindow.Array();
      const pieces = text.split("\n");
      for (let p of pieces) {
        p = p.trim();
        let lidx = 0;
        const matches = hue.removeUnwantedMatches(
          hue.compactMatches(hue.parseText(p)));
        for (const m of matches) {
          const idx = m.getOffset();
          if (idx !== lidx) {
            rv.push({type: "text", value: p.substring(lidx, idx)});
          }
          switch (m.getType()) {
          case "hashtag":
            rv.push({type: "room", id: m.getHashtag(), name: "Some Room"});
            break;

          case "mention":
            rv.push({
              type: "file",
              id: m.getMention(),
              name: "Some file (just hover it ffs)"});
            break;
          default:
            rv.push({
              type: "url",
              href: m.getAnchorHref(),
              text: m.getAnchorText()});
            break;
          }
          lidx = idx + m.getMatchedText().length;
        }
        const last = p.substring(lidx);
        if (last && last.length) {
          rv.push({type: "text", value: last});
        }
        rv.push({type: "break"});
      }
      rv.pop(); // last break;
      return rv;
    };
  })();

  dry.once("load", function() {
    dry.appendMessage("VolaPG",
      "is not secure, especially not in /c mode. " +
                      "Use /pubkey to retrieve public key",
      {me: true, highlight: false});
  });

  class Shit {
    constructor() {
      this._pubcache = new Map();
      this._nacl = null;
    }

    init() {
      return new Promise(resolve => {
        nacl_factory.instantiate(n => {
          this._nacl = n;
          resolve(this);
        }, {
          requested_total_memory: 1 << 22,
        });
      });
    }

    serializeKeys(keys) {
      const nacl = this._nacl;
      const s = {
        boxSk: nacl.to_hex(keys.boxSk),
        boxPk: nacl.to_hex(keys.boxPk)
      };
      return JSON.stringify(s);
    }

    async getKeys(reset) {
      const nacl = this._nacl;
      let rv = await GM.getValue("vpgkeypair");
      if (!rv || reset) {
        rv = nacl.crypto_box_keypair();
        await this.setKeys(rv);
        return rv;
      }
      rv = JSON.parse(rv);
      return {
        boxSk: nacl.from_hex(rv.boxSk),
        boxPk: nacl.from_hex(rv.boxPk)
      };
    }

    async setKeys(keys) {
      await GM.setValue("vpgkeypair", this.serializeKeys(keys));
    }

    async getPubKey() {
      return `vgpk#${this._nacl.to_hex((await this.getKeys()).boxPk)}`;
    }

    async getSerializedKeys() {
      return this.serializeKeys(await this.getKeys());
    }

    combine(a, b) {
      const nacl = this._nacl;
      if (!(a instanceof Uint8Array)) {
        a = nacl.encode_utf8(a);
      }
      if (!(b instanceof Uint8Array)) {
        b = nacl.encode_utf8(b);
      }
      return nacl.from_hex(nacl.to_hex(a) + nacl.to_hex(b));
    }

    // ridicously shitty KDF, like a hmac lite but with A LOT MORE BUGS.
    // Totally secure, I swears, not that is really matters, are the PRNG of
    // most JS engines is shit anyway, even for the "crypto" variant
    mackdf(key, msg) {
      const nacl = this._nacl;
      const r = nacl.crypto_hash(this.combine(key, msg));
      for (let i = 0; i < r.byteLength; ++i) {
        r[i] ^= 54;
      }
      const o = new Uint8Array(key.buffer.slice(0)).subarray(0, key.byteLength);
      for (let i = 0; i < o.byteLength; ++i) {
        o[i] ^= 92;
      }
      return nacl.crypto_hash(this.combine(o, r));
    }

    // Wonder if truncating the nounce makes shit more secure?
    // I think it does!!!!1!
    obfuscate(key, msg) {
      const nacl = this._nacl;
      const rnounce = nacl.crypto_secretbox_random_nonce().subarray(0, 6);
      key = this.mackdf(rnounce, key);
      const nounce = this.combine(rnounce, key.subarray(32, 50));
      key = key.subarray(0, 32);
      let rv = nacl.crypto_secretbox(nacl.encode_utf8(msg), nounce, key);
      rv = this.combine(rnounce, rv);
      return `c#${baseMANY.encode(rv)}`;
    }

    getRemoteKey(nacl, user) {
      return new Promise((resolve, reject) => {
        GM.xmlHttpRequest({
          method: "GET",
          url: `https://volafile.org/user/${user}`,
          onload: r => {
            try {
              let m = r.responseText.match(/vgpk#[a-f0-9]+/g);
              if (!m) {
                throw new Error(`${user} did not provide public key`);
              }
              m = nacl.from_hex(m[0].substr(5).trim());
              if (!m) {
                throw new Error("Failed to decode public key");
              }
              this._pubcache.set(user, m);
              resolve(m);
            }
            catch (ex) {
              reject(ex);
            }
          },
          onerror () {
            reject(new Error("failed to get public key"));
          }
        });
      });
    }

    async encryptFor(user, msg) {
      const nacl = this._nacl;
      user = user.toLowerCase();
      let key = this._pubcache.get(user);
      if (!key) {
        key = await this.getRemoteKey(nacl, user);
      }
      const keys = await this.getKeys();
      const rnounce = nacl.crypto_box_random_nonce().subarray(0, 8);
      const nounce = this.combine(
        rnounce, keys.boxPk.subarray(0, 24 - rnounce.byteLength));
      msg = nacl.crypto_box(
        nacl.encode_utf8(msg), nounce, key, keys.boxSk);
      return `p#${baseMANY.encode(
        this.combine(this.combine(rnounce, keys.boxPk), msg))}`;
    }

    _decrypt(key, msg) {
      const nacl = this._nacl;
      if (!msg.startsWith("c#")) {
        throw new Error("not encrypted");
      }
      let data = baseMANY.decode(msg.substr(2));
      const rnounce = data.subarray(0, 6);
      data = data.subarray(6);
      key = this.mackdf(rnounce, key);
      const nounce = this.combine(rnounce, key.subarray(32, 50));
      key = key.subarray(0, 32);
      return {
        type: "PubPG",
        msg: nacl.decode_utf8(nacl.crypto_secretbox_open(data, nounce, key))
      };
    }

    async _decryptFrom(msg) {
      if (!msg.startsWith("p#")) {
        throw new Error("not encrypted");
      }
      let data = baseMANY.decode(msg.substr(2));
      const rnounce = data.subarray(0, 8);
      const pubkey = data.subarray(8, 40);
      data = data.subarray(40);
      const nounce = this.combine(
        rnounce, pubkey.subarray(0, 24 - rnounce.byteLength));
      const keys = await this.getKeys();
      msg = this._nacl.crypto_box_open(data, nounce, pubkey, keys.boxSk);
      return {
        type: "PrivPG",
        msg: this._nacl.decode_utf8(msg)
      };
    }
  }

  let _shit;

  function get_shit() {
    if (_shit) {
      return _shit;
    }
    const shit = new Shit();
    return (_shit = shit.init());
  }

  function decrypt(key, msg) {
    if (msg.startsWith("c#")) {
      return get_shit().then(shit => {
        return shit._decrypt(key, msg);
      });
    }
    if (msg.startsWith("p#")) {
      return get_shit().then(shit => {
        return shit._decryptFrom(msg);
      });
    }
    return null;
  }

  // Will get rid of messages but not of notifications
  dry.replaceEarly("chat", "showMessage",
    function(orig, nick, message, options, data, ...args) {
      let text = [];
      if (message.trim) {
        text = message;
      }
      else {
        for (const m of message) {
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
      const decrypted = decrypt(
        nick + dry.config.room_id, text);
      if (decrypted) {
        decrypted.then(result => {
          message = dry.exportObject(reconstruct(result.msg));
          if (result.type === "PrivPG") {
            options.highlight = true;
          }
          data.channel = result.type;
          return orig(nick, message, options, data, ...args);
        }).catch(ex => {
          if (ex.message.indexOf("crypto_box_open signalled") > 0) {
            console.error(text, ex);
            return;
          }
          else if (ex.message !== "unhandled") {
            console.error(ex);
            dry.appendMessage("VolaPG", `Could not decode message: ${ex.message || ex}`, {
              highlight: false
            });
          }
        });
        return null;
      }
      return orig(nick, message, options, data, ...args);
    });

  new class extends dry.Commands {
    c(e) {
      get_shit().then(shit => {
        dry.exts.chat.applyNick();
        const enc = shit.obfuscate(dry.exts.user.info.nick + dry.config.room_id, e);
        dry.exts.chat.chatInput.emit("submit", enc);
      });
      return true;
    }

    p(e) {
      get_shit().then(shit => {
        try {
          dry.exts.chat.applyNick();
          e = e.split(/^(\S+) +((?:.|\n)+)$/);
          if (!e || e.length < 3) {
            throw Error("Invalid format");
          }
          shit.encryptFor(e[1], e[2]).then(function (m) {
            try {
              dry.exts.chat.applyNick();
              dry.exts.chat.chatInput.emit("submit", m);

              dry.appendMessage("VolaPG", `[Sent to ${e[1]}] ${e[2]}`);
            }
            catch (ex) {
              console.error(ex);
            }
          }, function (ex) {
            dry.appendMessage("VolaPG", ex.message || ex);
          });
        }
        catch (ex) {
          alert(ex);
        }
      });
      return true;
    }

    pubkey() {
      get_shit().then(async shit => {
        dry.appendMessage("VolaPG Pubkey", await shit.getPubKey());
      });
      return true;
    }

    keys() {
      get_shit().then(async shit => {
        dry.appendMessage(
          "VolaPG Keys (do not share)", await shit.getSerializedKeys());
      });
      return true;
    }

    newkeys() {
      dry.appendMessage("VolaPG", "Keys reset (not implemented)");
      return true;
    }

    setkeys(keys) {
      get_shit().then(async shit => {
        try {
          keys = JSON.parse(keys);
          keys.boxPk = shit._nacl.from_hex(keys.boxPk);
          keys.boxSk = shit._nacl.from_hex(keys.boxSk);
          await shit.setKeys(keys);
          dry.appendMessage("VolaPG", "Keys set");
        }
        catch (ex) {
          alert(ex);
        }
      });
      return true;
    }

    pghelp() {
      dry.appendMessage("VolaPG", new dry.unsafeWindow.Array(
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
        {
          type: "text",
          value:
            "use /setkeys to set existing keys (you got from /keys earlier)"
        }
      ));
      return true;
    }
  }();
});
