// ==UserScript==
// @name         VolaPG - Best crypto ever!!!1!
// @namespace    http://jew.dance/
// @version      0.8
// @description  If you think this will in any way protect you, you're wronk
// @author       topkuk productions
// @match        https://volafile.io/r/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @require      https://rawgit.com/tonyg/js-nacl/622d52f423f64f0d78cdc478fe8a6bfc2015b828/lib/nacl_factory.js
// ==/UserScript==

const baseMANY = (function() {
    "use strict";

    let alpha =  "abcdefghijklmnopqrstuvwxyz" +
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ" +
        "01234567890" +
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
    const codeToWord = new Map();
    const charToCode = (function() {
        class Node {
            constructor(val, sco) {
                this.score = sco;
                this.val = val;
            }
        };
        const score = a => {
            return freq.get(a) || 0.01;
        };
        let m = [];
        for (let a = 0; a < 256; ++a) {
            let sa = score(a);
            for (var b = 0; b < 256; ++b) {
                let s = sa * score(b);
                let val = a * 256 + b;
                m.push(new Node(val, s));
            }
        }
        const sortbyscore = (a, b) => {
            return a.score - b.score;
        };
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
        const c = sp.length;
        m.sort(sortbyscore);
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
    let te = new TextEncoder("utf-8");
    let td = new TextDecoder("utf-8");
    const encode = (text) => {
        if (typeof text === "string") {
            return encode(te.encode(text));
        }
        if (text.buffer instanceof ArrayBuffer) {
            return encode(text.buffer);
        }
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
                rv[i] = a[i];
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
        decode: decode,
        many: sp.length,
    };
})();

(function() {

"use strict";

/* globals nacl_factory, baseMANY,
   unsafeWindow, GM_getValue, GM_setValue, GM_xmlhttpRequest
*/

console.log("running", GM_info.script.name, GM_info.script.version);


nacl_factory.instantiate(function(nacl) {

let config = window.config || unsafeWindow.config;

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

let chat = document.querySelector('#chat_input');
let user = document.querySelector('#chat_name');
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
chat.addEventListener('keydown', function (e) {
  if (e.keyCode !== 13 || e.shiftKey || e.ctrlKey || e.altKey || e.metaKey) {
    return;
  }
  if (chat.value.startsWith('/c ') || chat.value.startsWith('.c ')) {
    chat.value = shit.obfuscate(user.value + config.room_id, chat.value.substr(3));
    return;
  }
  if (chat.value.startsWith('/p ') || chat.value.startsWith('.p ')) {
    let val = chat.value;
    chat.value = ''; // cancel out so it won't get send, ever
    e.stopPropagation();
    e.preventDefault();
    try {
      val = val.split(/^.p +(\S+) +(.+)$/);
      if (!val || val.length < 3) {
        throw Error('Invalid format');
      }
      shit.encryptFor(val[1], val[2]).then(function (m) {
        try {
          chat.value = m;
          let ev = document.createEvent('KeyboardEvent');
          if (ev.initKeyEvent) {
            ev.initKeyEvent(
              'keypress', true, true, window, false, false, false, false, 13, 0);
          }
          else {
            ev = document.createEvent('Events');
            ev.initEvent('keypress', true, true, document.defaultView);
            ev.keyCode = ev.which = 13;
          }
          chat.dispatchEvent(ev);
          appendMessage('VolaPG', '[Sent to ' + val[1] + '] ' + val[2]);
        }
        catch (ex) {
          console.error(ex);
        }
      }, function (e) {
        appendMessage('VolaPG', e.message || e);
      });
    }
    catch (ex) {
      alert(ex);
    }
    return;
  }
  if (chat.value == '.pubkey') {
    chat.value = '';
    e.stopPropagation();
    e.preventDefault();
    appendMessage('VolaPG Pubkey', shit.getPubKey());
    return;
  }
  if (chat.value == '.keys') {
    chat.value = '';
    e.stopPropagation();
    e.preventDefault();
    appendMessage('VolaPG Keys (do not share)', shit.getSerializedKeys());
    return;
  }
  if (chat.value == '.newkeys') {
    chat.value = '';
    e.stopPropagation();
    e.preventDefault();
    shit.getKeys(true);
    appendMessage('VolaPG', 'Keys reset');
  }
  if (chat.value == '.setkeys') {
    let keys = chat.value;
    chat.value = '';
    try {
      keys = JSON.decode(keys.substr(8));
      keys.boxPk = baseMANY.decode(keys.boxPk);
      keys.boxSk = baseMANY.decode(keys.boxSk);
      shit.setKeys(keys);
      appendMessage('VolaPG', 'Keys set');
    }
    catch (ex) {
      alert(ex);
    }
    e.stopPropagation();
    e.preventDefault();
    return;
  }
}, true);
let observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    let nodes = mutation.addedNodes;
    for (let i = 0; i < nodes.length; i++) {
      let user = nodes[i].querySelector('.username').firstChild;
      for (; user && user.nodeType != 3; user = user.nextSibling) {
        // hue, also thanks dong timestamp script
      }
      let node = nodes[i].querySelector('.chat_text');
      if (!user || !node) {
        continue;
      }
      try {
        node.textContent = shit.decrypt(
          user.textContent.trim() + config.room_id, node.textContent);
      }
      catch (ex) {
        if (ex.message.indexOf('crypto_box_open signalled') > 0) {
          node.textContent = '<Message not for you>';
          node.style.opacity = "0.7";
          node.style.fontStyle = "italic";
        }
        else if (ex.message != 'unhandled') {
          console.log(ex);
          appendMessage('VolaPG', 'Could not decode message: ' + (ex.message || ex));
        }
      }
    }
  });
});
observer.observe(msgs, {
  childList: true
});
setTimeout(function() {
  appendMessage("NonLiquidReminder",
                "VolaPG is not secure, especially not in .c mode. " +
                "Use .pubkey to retrieve public key");
}, 1000);
});

})();
