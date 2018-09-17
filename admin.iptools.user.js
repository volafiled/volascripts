// ==UserScript==
// @name         Vola Admin/IP Tools
// @version      48
// @description  Does a bunch of stuff for mods.
// @namespace    https://volafile.org
// @icon         https://volafile.org/favicon.ico
// @author       topkuk productions
// @match        https://volafile.org/r/*
// @require      https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require      https://cdn.rawgit.com/RealDolos/volascripts/51b76c05be26adca7b4a4897115f67f10d9df668/dry.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

/* global dry, GM */

dry.once("dom", () => {
  "use strict";

  const IS_BAN = /^\S+ (?:banned|muted|hellbanned|unbanned|un-muted|timed-in)\b/;

  function adjustBanPart(p, users, ips) {
    const {value} = p;
    let slash = value.indexOf(" / ");
    if (slash < 0) {
      slash = value.length;
    }
    const pre = value.slice(0, slash).replace("did nothing to", "did-nothing-to");
    const post = value.slice(slash);
    const pieces = pre.split(/ /g);
    let idx = 1;
    while (idx < pieces.length) {
      if (!pieces[idx++].endsWith(",")) {
        break;
      }
    }
    const pusers = pieces.slice(idx).map(u => {
      u = u.replace(/(?:[()]|,$)/g, "").trim();
      if (/^\d+\.\d+\.\d+\.\d+$/.test(u)) {
        ips.push(u);
        return null;
      }
      if (u) {
        users.push(u);
      }
      return u;
    }).filter(e => e).sort();

    if (!pusers.length) {
      pusers.push("some cuck");
    }

    p.value = `${pieces.slice(0, idx).join(" ").replace("did-nothing-to", "did nothing to")} ${pusers.join(", ")}${post}`;
  }

  function $e(tag, attrs, text) {
    let rv = document.createElement(tag);
    attrs = attrs || {};
    for (let a in attrs) {
        rv.setAttribute(a, attrs[a]);
    }
    if (text) {
        rv.textContent = text;
    }
    return rv;
  }

  const $ = (sel, el) => (el || document).querySelector(sel);

  console.log(
    "running", GM.info.script.name, GM.info.script.version, dry.version);

  const style = $e("style", {id: "iptools-style"}, `
body[noipspls] a.username > span:not([class]),
body[noipspls] a.username > span[class=""],
body[noipspls] a.username > span.unselectable,
body[noipspls] .tag_key_ip {
  display: none;
}
body[noipspls] a.username > span.hidden-select {
  font-size: 100%;
},
.username.ban {
  display: inline-block;
}
@-moz-document url-prefix() {
.username.ban {
  display: inline;
}
}
.username.ban {
  vertical-align: top;
  color: white !important;
  font-size: 50%;
  padding: 0;
  opacity: 0.4;
}
.username.ban:hover {
  opacity: 1;
}
.username.ban icon-hammer {
  padding: 0;
}
.icon-untick {
  margin: 0 !important;
}
.untick-button {
  position: relative;
  z-index: 150;
  font-size: 18px;
  padding-bottom: 1px;
  margin-right: 1ex;
}
`);
  document.body.appendChild(style);
  let state = localStorage.getItem("noipspls") !== "false";
  if (state !== false) {
    state = true;
  }
  const update = () => {
    if (state) {
      document.body.setAttribute("noipspls", "true");
    }
    else {
      document.body.removeAttribute("noipspls");
    }
    localStorage.setItem("noipspls", state.toString());
    if (dry.exts) {
      dry.exts.chat.scrollState.bottom();
    }
  };
  const toggle = () => {
    state = !state;
    update();
  };
  update();

  const btn = document.createElement("a");
  btn.textContent = "IP";
  btn.style.padding = "0 1ex";
  const uc = document.querySelector("#user_count_icon");
  uc.parentElement.insertBefore(btn, uc.nextSibling);
  btn.addEventListener("click", toggle);

  const roomqueue = new Map();
  let resolving = false;
  const resolve_rooms = async () => {
    if (resolving) {
      return;
    }
    resolving = true;
    try {
      while (roomqueue.size) {
        const [room, elems] = roomqueue[Symbol.iterator]().next().value;
        try {
          let res = await dry.unsafeWindow.Volafile.makeAPIRequest("getRoomConfig", {
            room
          });
          for (const el of elems) {
            el.textContent = res.name;
          }
        }
        catch (ex) {
          console.error(ex);
        }
        roomqueue.delete(room);
      }
    }
    finally {
      resolving = false;
    }
  };

  dry.replaceEarly("chat", "showMessage",
    function(orig, nick, message, options, data, ...args) {
      try {
        if (nick === "Log" && options.staff && !options.profile && !(data && data.ip)) {
          const users = [];
          const ips = [];
          if (message[0].type === "url" && message[0].href === "/reports") {
            if (message[1].value.startsWith(" / BLACKLIST ")) {
              adjustBanPart(message[4], users, ips);
            }
            else {
              const [, p] = message;
              const m = p.value.match(/ \((\d+\.\d+\.\d+\.\d+)\)/);
              if (m) {
                p.value = p.value.replace(m[0], "");
                ips.push(m[1]);
              }
            }
          }
          else {
            for (const p of message) {
              if (p.type !== "text") {
                continue;
              }
              if (!IS_BAN.test(p.value)) {
                continue;
              }

              adjustBanPart(p, users, ips);
            }
          }
          if (users.length) {
            options.profile = users.sort().join(" user:");
            options.unprofile = true;
          }
          if (ips.length) {
            if (!data) {
              data = new dry.unsafeWindow.Object();
            }
            data.ip = ips.join(" ip:");
          }
        }
      }
      catch (ex) {
        console.error(ex);
      }
      const msg = orig(...[nick, message, options, data].concat(args));
      try {
        if (options.unprofile && msg.nick_elem) {
          const newnick = document.createElement("a");
          if (msg.ip_elem) {
            msg.ip_elem.parentElement.removeChild(msg.ip_elem);
          }
          newnick.textContent = msg.nick_elem.textContent;
          if (msg.ip_elem) {
            newnick.appendChild(msg.ip_elem);
          }
          newnick.className = msg.nick_elem.className;
          msg.nick_elem.parentElement.replaceChild(newnick, msg.nick_elem);
          msg.nick_elem = newnick;
          msg.elem.classList.remove("profile");
        }
        if (msg && (msg.ip_elem || msg.options.profile)) {
          msg.ban_elem = document.createElement("span");
          const hammer = document.createElement("i");
          hammer.setAttribute("class", "chat_message_icon icon-hammer");
          msg.ban_elem.appendChild(hammer);
          msg.ban_elem.setAttribute("class", "username clickable ban");
          msg.ban_elem.addEventListener("click", msg.showBanWindow.bind(msg));
          msg.nick_elem.appendChild(msg.ban_elem);
        }
        if (msg && nick === "Log" && msg.elem) {
          for (const el of msg.elem.children) {
            if (!el.textContent.startsWith("#")) {
              continue;
            }
            let m = /https:\/\/volafile.org\/r\/(.+)$/.exec(el.href);
            if (m) {
              const l = roomqueue.get(m[1]);
              if (!l) {
                roomqueue.set(m[1], [el]);
              }
              else {
                l.push(el);
              }
            }
          }
        }
      }
      catch (ex) {
        console.error(ex);
      }
      finally {
        resolve_rooms().catch(console.error);
      }
      return msg;
    });

  new class extends dry.Commands {
    ip() {
      toggle();
      return true;
    }
  }();

  function nukeRoom() {
    dry.exts.ui.showQuestion({
      title: "Disable this room",
      text: "Are you sure you want to disable this room?",
      positive: "Disable",
      negative: "Abort"
    }, res => {
      if (!res) {
        return;
      }
      dry.unsafeWindow.Volafile.setRoomConfig({
        name: "closed",
        motd: "closed",
        disabled: true
      });
    });
  }

  dry.replaceEarly("ui", "showContextMenu", function(orig, el, options) {
    try {
      if (options && options.dedupe === "admin_contextmenu" && dry.exts.user.info.admin) {
        options.buttons.push({
          icon: "icon-rules",
          text: "Nuke Room",
          admin: true,
          click: nukeRoom
        });
      }
      if (options && options.dedupe === "room_contextmenu" && dry.exts.user.info.admin) {
        const idx = options.buttons.findIndex(e => e.text === "Copy URL");
        if (idx >= 0) {
          options.buttons.splice(idx, 1);
        }
      }
    }
    catch (ex) {
      console.error("ex", ex);
    }
    return orig(el, options);
  });

  // fixup ban templates
  for (const b of Object.values(window._templates.bans)) {
    b.lock = b.locked = false;
     if (b.upload && b.hours <= 24) {
       b.upload = false;
     }
  }

  const doet = Symbol("doet");
  const cont = $("#upload_container");
  const button = $e("label", {
    "for": "untick-button",
    "id": "untick-button",
    "class": "button untick-button",
    "title": "Untick all!"
  });
  button.appendChild($e("span", {
    "class": "icon-minus"
  }));
  button.addEventListener("click", () => dry.exts.adminButtons.untickAll(doet));
  cont.insertBefore(button, cont.firstChild);

  dry.replaceEarly("adminButtons", "untickAll", function(orig, kek) {
    if (kek !== doet) {
      return;
    }
    return orig();
  });
});
