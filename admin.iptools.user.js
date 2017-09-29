// ==UserScript==
// @name         Vola IP Tools
// @version      29
// @description  Hides ip addresses for mods.
// @namespace    https://volafile.org
// @icon         https://volafile.org/favicon.ico
// @author       topkuk productions
// @match        https://volafile.org/r/*
// @require      https://cdn.rawgit.com/RealDolos/volascripts/51b76c05be26adca7b4a4897115f67f10d9df668/dry.js
// @run-at       document-start
// @grant        none
// ==/UserScript==

/* global dry, GM_info */

dry.once("dom", () => {
  "use strict";

  console.log(
    "running", GM_info.script.name, GM_info.script.version, dry.version);

  const style = document.createElement("style");
  style.textContent = `
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
#room_tools {
  display: inline-block;
  position: absolute;
  right: 0;
  bottom: 0;
}

#name_container {
  height: auto;
  line-height: normal;
}
#room_name {
  font-size: 1.8em;
}
#chat_hbar_buttons {
  display: block;
  text-align: right;
  font-size: 80% !important;
  margin-top: -1ex;
  padding-right: 1ex !important;
}

`;
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
              id: room
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
          message.forEach(m => {
            try {
              if (m && m.type === "text") {
                let pieces = m.value.match(/^(.+?)( to ([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(.+)$/);
                if (!pieces) {
                  pieces = m.value.match(/^(.+?)( \(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\))(.+)$/);
                }
                if (!pieces) {
                  pieces = m.value.match(/^(.+?)( ([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]+))(.*?)$/);
                }
                if (!pieces) {
                  newmsg.push(m);
                  return;
                }
                newmsg.push({type: "text", value: pieces[1] + pieces[4]});
                if (!data) {
                  data = new dry.unsafeWindow.Object();
                  [,,, data.ip] = pieces;
                }
                return;
              }
            }
            catch (ex) {
              console.error(ex);
            }
            newmsg.push(m);
          });
          message = newmsg;
        }
      }
      catch (ex) {
        console.error(ex);
      }
      const msg = orig(...[nick, message, options, data].concat(args));
      try {
        if (msg && msg.ip_elem) {
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

  {
    const settings = document.querySelector("#room_settings");
    const disable = document.createElement("a");
    disable.id = "disable_room";
    disable.className = "button light";
    disable.textContent = "Nuke";

    settings.parentElement.appendChild(disable);
    disable.addEventListener("click", function() {
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
    });
    const header = document.querySelector("#room_name_container");
    header.appendChild(disable.parentElement);
  }

  dry.replaceEarly("admin", "showBanWindow",
    function(orig, ips, uploading, chat, blacklist) {
      function change(form, reasons) {
        const reasontype = form.reason_elem.value;
        const reason = reasons[reasontype];
        if (reason.custom) {
          form.mute_elem.checked = !!chat;
          form.ban_elem.checked = !!uploading;
          form.creason_elem.value = "";
          form.hours_elem.value = "1";
          return;
        }
        form.mute_elem.checked = !!reason.mute;
        form.ban_elem.checked = !!reason.upload;
        form.hellban_elem.checked = !!reason.hellban;
        form.hours_elem.value = `${reason.hours}`;
        form.creason_elem.value = reason.reason || reason.text;
      }

      if (!this.isAdmin) {
        return;
      }
      uploading = !!uploading;
      chat = !!chat;
      const tmpl = this.import("templates");
      const conn = this.import("connection");
      const reasons = Object.assign({}, tmpl.render("bans"));
      if (blacklist) {
        for (const k of Object.keys(reasons)) {
          const b = reasons[k];
          if (!b.upload && !b.hellban && !b.custom) {
            delete reasons[k];
            continue;
          }
          if (b.upload && b.hours <= 24) {
            b.upload = false;
          }
        }
      }
      if (chat || uploading) {
        for (const k of Object.keys(reasons)) {
          const b = reasons[k];
          const n = !!b.default_upload;
          const s = !!b.default_mute;
          b.default = s === chat && n === uploading;
        }
      }
      const form = tmpl.renderForm("forms.ban", {
        ips,
        uploading,
        chat,
        reasons,
        blacklist
      });
      change(form, reasons);
      form.reason_elem.addEventListener("change", () => change(form, reasons));
      form.on("submit", function() {
        this.dismiss();
        const options = {
          hours: parseFloat(this.hours),
          reason: this.creason.trim(),
          purgeFiles: this.purge || false,
          ban: this.ban,
          hellban: this.hellban,
          mute: this.mute
        };
        if (blacklist) {
          conn.call("blacklistFiles", ips, options);
          return;
        }
        for (let i = this.ip.split(","), n = 0; n < i.length; n++) {
          conn.call("banUser", i[n].trim(), options);
        }
      });
    });
});
