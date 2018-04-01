// ==UserScript==
// @name         Vola Admin/IP Tools
// @version      41
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
body[noipspls] .tag_key_ip {
  display: none;
}
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
          let res = await new Promise((resolve, reject) => {
            dry.unsafeWindow.Volafile.makeAPIRequest("getRoomConfig", {
              room
            }, (err, res) => err || !res || !res.name ? reject(err) : resolve(res));
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
        if (nick === "Log" && options.staff) {
          if (typeof (message) === "string") {
            message = {type: "text", value: message};
          }
          if (!message.forEach) {
            message = [message];
          }
          const newmsg = new dry.unsafeWindow.Array();
          const search = ["banned", "muted", "hellbanned", "timed"];
          message.forEach(m => {
            try {
              if (!m || m.type !== "text" || !search.some(e => m.value.includes(e))) {
                return;
              }
              const {value} = m;
              let idx = value.indexOf(" / ");
              if (idx <= 0) {
                return;
              }
              let pre = value.slice(0, idx);
              const post = value.slice(idx);
              let [,...pieces] = pre.split(/ /g);
              while (pieces[0].endsWith(",")) {
                pieces.shift();
              }
              pieces.shift();
              console.log(pieces);
              if (pieces.length > 2) {
                return;
              }
              for (let p of pieces) {
                if (!p.includes(".")) {
                  continue;
                }
                pre = pre.replace(p, "");
              }
              m.value = `${pre.trim()}${post}`;
              pieces = pieces.map(e => e.startsWith("(") ? e.slice(1, -1) : e);
              let [user, ip] = pieces;
              if (!ip && user.includes(".")) {
                ip = user;
              }
              if (user) {
                options.profile = user;
              }
              if (ip) {
                data = data || new dry.unsafeWindow.Object();
                data.ip = ip;
              }
            }
            catch (ex) {
              console.error(ex);
            }
            finally {
              newmsg.push(m);
            }
          });
          message = newmsg;
        }
      }
      catch (ex) {
        console.error(ex);
      }
      const msg = orig(...[nick, message, options, data].concat(args));
      try {
        if (msg && msg.ip_elem || msg.options.profile) {
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
      dry.exts.connection.call("editInfo", {
        name: "closed",
        motd: "",
        disabled: true
      });
    });
  }

  dry.replaceEarly("ui", "showContextMenu", function(orig, el, options) {
    try {
      if (options && options.dedupe === "admin_contextmenu" && dry.exts.admin.isAdmin) {
        options.buttons.push({
          icon: "icon-rules",
          text: "Nuke Room",
          admin: true,
          click: nukeRoom
        });
      }
      if (options && options.dedupe === "room_contextmenu" && dry.exts.admin.isAdmin) {
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
