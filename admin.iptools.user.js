// ==UserScript==
// @name         Vola Admin/IP Tools
// @version      56
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

/* global window, document, localStorage, GM, dry, _templates, RoomInstance */

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
    const userPieces = pieces.slice(idx).map(u => {
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

    if (!userPieces.length) {
      userPieces.push("some cuck");
    }

    p.value = `${pieces.slice(0, idx).join(" ").replace("did-nothing-to", "did nothing to")} ${userPieces.join(", ")}${post}`;
  }

  function adjustLogMessage(message, options, data) {
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
        const key = message.reduce((p, c) => p + (c.value || c.text || c.url || c.id), "");
        if (known_reports.has(key)) {
          return REMOVE;
        }
        known_reports.add(key);
        if (known_reports.size > 100) {
          known_reports.delete(known_reports.entries().next().value);
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

    return data;
  }

  function nukeLogMessage(message, data) {
    const {ip} = data;
    setTimeout(() => {
      const {messages, scrollState} = RoomInstance.extensions.chat;
      for (let i = messages.length - 1; i >= 0; --i) {
        const m = messages[i];
        if (m.data.ip !== ip || m.nick !== "Log") {
          continue;
        }
        messages.splice(i, 1);
        if (m.elem && m.elem.parentElement) {
          scrollState.adjust(-m.elem.clientHeight);
          m.elem.parentElement.removeChild(m.elem);
          scrollState.restore();
        }
      }
    }, 0);
  }

  function $e(tag, attrs, text) {
    const rv = document.createElement(tag);
    attrs = attrs || {};
    for (const a in attrs) {
      rv.setAttribute(a, attrs[a]);
    }
    if (text) {
      rv.textContent = text;
    }
    return rv;
  }

  function nukeRoom() {
    dry.exts.ui.showQuestion({
      title: "Nuke this room?",
      text: "Are you sure you want to nuke this room?",
      positive: "NUUUUUUUKE!!!!",
      negative: "No Bulli"
    }, res => {
      if (!res) {
        return;
      }
      dry.unsafeWindow.Volafile.setRoomConfig({
        name: "closed",
        motd: "closed",
        owner: "noowner",
        janitors: [],
        disabled: true
      });
    });
  }

  function purgeMessageIds(ids) {
    if (!Array.isArray(ids)) {
      ids = [ids];
    }
    if (!ids.length) {
      return;
    }
    dry.exts.connection.call("removeMessages", ids, function(e) {
      if (e) {
        dry.exts.chat.showError(e);
      }
    });
  }

  function purgeMessages(msg) {
    const {messages} = dry.exts.chat;

    dry.exts.templates.renderPrompt("prompts.purgemessages", {
      user: msg.nick,
      "one"() {
        purgeMessageIds([msg.data.id]);
      },
      "ip"() {
        const {ip} = msg.data;
        purgeMessageIds(messages.filter(m => m.data.ip === ip && m.data.id).map(e => e.data.id));
      },
      "nick"() {
        const nick = msg.nick.toUpperCase();
        if (!nick) {
          return;
        }
        if (msg.options.user) {
          purgeMessageIds(messages.filter(m => m.nick.toUpperCase() === nick && m.data.id).map(e => e.data.id));
        }
        else {
          purgeMessageIds(messages.filter(m => m.nick.toUpperCase() === nick && m.data.id && !m.options.user).map(e => e.data.id));
        }
      },
      "cancel"() {}
    });
  }

  function tickAll() {
    RoomInstance.extensions.filelist.filelist.forEach(file => {
      file.setData("checked", true);
    });
  }


  const $ = (sel, el) => (el || document).querySelector(sel);

  console.log(
    "running", GM.info.script.name, GM.info.script.version, dry.version);

  const style = $e("style", {id: "iptools-style"}, `
body[noipspls] .chat_message_ip,
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
#files_header {
  display: flex;
}

#iptools-buttons {
  box-sizing: border-box;
  font-size: 0.8em !important;
  margin: 0;
  padding: 0;
  line-height: inherit;
  display: inline-flex;
  align-items: center;
  margin-right: 2.5ex;
}

.iptools-button {
  box-sizing: border-box;
  background-color: transparent !important;
  color: white !important;
  height: 100%;
  line-height: inherit;
  min-width: 2.5em;
  text-align: center;
  padding: 0;
  margin: 0;
  display: block;
  border-radius: 3px;
}

.iptools-button > span {
  vertical-align: middle;
}

.iptools-button:hover {
  background: rgba(120, 120, 120, 0.1) !important;
}

.iptools-button:active {
  background: rgba(120, 120, 120, 0.5) !important;
}

.iptools-button-group {
  height: 9px;
  border-right: 2px dotted rgba(255, 255, 255, 0.7) !important;
  margin-left: 0.5em;
  margin-right: 0.5em;
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

  const roomQueue = new class RoomQueue extends Map {
    constructor() {
      super();
      this.resolving = false;
    }

    add(room, el) {
      const l = this.get(room);
      if (!l) {
        this.set(room, [el]);
      }
      else {
        l.push(el);
      }
    }

    async resolve() {
      if (this.resolving) {
        return;
      }
      this.resolving = true;

      try {
        while (this.size) {
          const [room, elements] = this[Symbol.iterator]().next().value;
          try {
            const res = await dry.unsafeWindow.Volafile.makeAPIRequest("getRoomConfig", {
              room
            });
            for (const el of elements) {
              el.textContent = res.name;
            }
          }
          catch (ex) {
            console.error(ex);
          }
          this.delete(room);
        }
      }
      finally {
        this.resolving = false;
      }
    }
  }();

  const known_reports = new Set();

  dry.replaceEarly("chat", "showMessage",
    function(orig, nick, message, options, data, ...args) {
      try {
        if (nick === "Log" && options.staff && !options.profile && !(data && data.ip)) {
          data = adjustLogMessage(message, options, data) || data;
          if (data === REMOVE) {
            return null;
          }
        }
        if (nick === "Log" && options.staff && !options.profile && data && data.ip) {
          const key = message.reduce((p, c) => p + (c.value || c.text || c.url || c.id), "");
          if (key.includes("SPAMITY REPORT SPAM")) {
            nukeLogMessage(message, data);
            return null;
          }
        }
      }
      catch (ex) {
        console.error(ex);
      }

      const msg = orig(...[nick, message, options, data].concat(args));

      try {
        if (options.unprofile && msg.nick_elem) {
          const newNick = document.createElement("a");
          if (msg.ip_elem) {
            msg.ip_elem.parentElement.removeChild(msg.ip_elem);
          }
          newNick.textContent = msg.nick_elem.textContent;
          if (msg.ip_elem) {
            newNick.appendChild(msg.ip_elem);
          }
          newNick.className = msg.nick_elem.className;
          msg.nick_elem.parentElement.replaceChild(newNick, msg.nick_elem);
          msg.nick_elem = newNick;
          msg.elem.classList.remove("profile");
        }
        if (msg && (msg.ip_elem || msg.options.profile)) {
          const addHammer = function() {
            msg.ban_elem = document.createElement("span");
            const hammer = document.createElement("i");
            hammer.setAttribute("class", "chat_message_icon icon-hammer");
            msg.ban_elem.appendChild(hammer);
            msg.ban_elem.setAttribute("class", "username clickable ban unselectable");
            const showBanWindow = msg.showBanWindow.bind(msg);
            msg.ban_elem.addEventListener("click", function(e) {
              if (e.altKey) {
                e.preventDefault();
                e.stopPropagation();
                purgeMessages(msg);
                return false;
              }

              return showBanWindow(e);
            });
            msg.nick_elem.appendChild(msg.ban_elem);
          };
          addHammer();
          const update = msg.update.bind(msg);
          msg.update = function() {
            update();
            addHammer();
          };
        }
        if (msg && nick === "Log" && msg.elem && msg.elem.textContent.includes("Reports /")) {
          for (const el of msg.elem.children) {
            const m = /https:\/\/volafile.org\/r\/(.+)$/.exec(el.href);
            if (!m) {
              continue;
            }
            roomQueue.add(m[1], el);
          }
        }
      }
      catch (ex) {
        console.error(ex);
      }
      finally {
        roomQueue.resolve().catch(console.error);
      }

      return msg;
    });

  new class extends dry.Commands {
    ip() {
      toggle();
      return true;
    }
  }();

  // fixup ban templates
  for (const b of Object.values(window._templates.bans)) {
    b.lock = b.locked = false;
    if (b.upload && b.hours <= 12) {
      b.upload = false;
    }
  }

  const DO_ET = Symbol("We waz doing et");
  const REMOVE = Symbol();
  const row = $("#files_header");
  const cont = $e("div", {
    id: "iptools-buttons",
  });
  row.insertBefore(cont, row.firstChild);


  function installButton(id, icon, title, action, group) {
    const btn = $e("label", {
      for: id,
      id,
      class: `button iptools-button ${id}`,
      title
    });
    const span = $e("span");
    span.appendChild($e("span", {
      class: icon
    }));
    btn.appendChild(span);
    btn.addEventListener("click", action);
    cont.appendChild(btn);
    if (group) {
      cont.appendChild($e("div", {
        class: "iptools-button-group"
      }));
    }
  }

  installButton("nuke-button", "icon-lock", "Deploy nuke!",
                nukeRoom, true);

  installButton("tick-button", "icon-plus", "Tick all!",
                tickAll);
  installButton("untick-button", "icon-minus", "Untick all!",
                () => dry.exts.adminButtons.untickAll(DO_ET), true);

  installButton("ban-button", "icon-hammer", "Ban!", (e) => {
    if (e.shiftKey) {
      RoomInstance.extensions.adminButtons.onUnbanButtonClicked();
    }
    else {
      RoomInstance.extensions.adminButtons.onBanButtonClicked();
    }
  });
  installButton("blacklist-button", "icon-warning", "Blacklist!", (e) => {
    if (e.shiftKey) {
      RoomInstance.extensions.adminButtons.onWhitelistClicked();
    }
    else {
      RoomInstance.extensions.adminButtons.onBlacklistClicked();
    }
  });
  installButton("removefiles-button", "icon-trash", "Remove Files!",
                () => RoomInstance.extensions.adminButtons.onRemoveClicked());

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

  dry.replaceEarly("adminButtons", "untickAll", function(orig, kek) {
    if (kek !== DO_ET) {
      return;
    }
    orig();
  });

  _templates.prompts.purgemessages = {
    title: "Purge messages",
    content: "Are you sure you want to SHREKT <b>{{user}}</b>?",
    centered: true,
    dismissable: true,
    buttons: [
      {name: "This Message", click: "one", default: true},
      {name: "All by IP", add_class: "light", click: "ip"},
      {name: "All by Nick", add_class: "light", click: "nick"},
      {name: "It was a mistake", add_class: "light", click: "cancel"}
    ]
  };
});
