// ==UserScript==
// @name         Vola IP Tools
// @version      25
// @description  Hides ip addresses for mods.
// @namespace    https://volafile.org
// @icon         https://volafile.org/favicon.ico
// @author       topkuk productions
// @match        https://volafile.org/r/*
// @require      https://cdn.rawgit.com/RealDolos/volascripts/1dd689f72763c0e59f567fdf93865837e35964d6/dry.js
// @run-at       document-start
// ==/UserScript==

dry.once("dom", () => {
    "use strict";
    console.log("running", GM_info.script.name, GM_info.script.version, dry.version);

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

    let btn = document.createElement("a");
    btn.textContent = "IP";
    btn.style.padding = "0 1ex";
    let uc = document.querySelector("#user_count_icon");
    uc.parentElement.insertBefore(btn, uc.nextSibling);
    btn.addEventListener("click", toggle);

    dry.replaceEarly("chat", "showMessage", function(orig, nick, message, options, data, ...args) {
        try {
            if (nick === "Log" && options.staff) {
                if (typeof(message) == "string") {
                    message = {type: "text", value: message};
                }
                if (!message.forEach) {
                    message = [message];
                }
                let newmsg = new dry.unsafeWindow.Array();
                message.forEach(m => {
                    try {
                        if (m && m.type === "text") {
                            let pieces = m.value.match(/^(.+?)( to ([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(.+)$/);
                            if (!pieces) {
                                pieces = m.value.match(/^(.+?)( \(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\))(.+)$/);
                            }
                            if (!pieces) {
                                newmsg.push(m);
                                return;
                            }
                            newmsg.push({type: "text", value: pieces[1] + pieces[4]});
                            if (!data) {
                                data = new dry.unsafeWindow.Object();
                                data.ip = pieces[3];
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
        }
        catch (ex) {
            console.error(ex);
        }
        return msg;
    });

    new class extends dry.Commands {
        ip(e) {
            toggle();
            return true;
        }
    }();

    {
        let settings = document.querySelector("#room_settings");
        let disable = document.createElement("a");
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
            }, (res) => {
                if (!res) {
                    return;
                }
                dry.exts.connection.call("editInfo", {
                    "name": "closed",
                    "motd": "",
                    "disabled": true
                });
            });
        });
    }
});
