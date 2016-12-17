// ==UserScript==
// @name        Volafile ip address hider
// @namespace   volafile.ip.hider
// @description Hides ip addresses for mods.
// @include     https://volafile.io/r/*
// @version     6
// @grant       none
// @require     https://rawgit.com/RealDolos/volascripts/4e2e4cdabf706777926b3eb04a64725c02a9b124/dry.js
// @run-at      document-start
// ==/UserScript==

dry.once("dom", () => {
    "use strict";
    console.log("running", GM_info.script.name, GM_info.script.version, dry.version);

    const style = document.createElement("style");
    style.textContent = `
body[noipspls] a.username > span,
body[noipspls] .tag_key_ip {
display: none;
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

    dry.replaceEarly("chat", "showMessage", function(orig, nick, message, options, ...args) {
        try {
            if (nick === "Report" && options.staff) {
                if (typeof(message) == "string") {
                    message = {type: "text", value: message};
                }
                if (!message.forEach) {
                    message = [message];
                }
                let newmsg = new dry.unsafeWindow.Array();
                message.forEach(m => {
                    if (m && m.type === "text") {
                        const pieces = m.value.match(/^(.+)( \([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\))(.+)$/);
                        if (!pieces) {
                            newmsg.push(m);
                            return;
                        }
                        newmsg.push({type: "text", value: pieces[1]});
                        // this is secure enough since the match should make sure there is no unescaped html in there
                        newmsg.push({type: "raw", value: `<span class="tag_key_ip">${pieces[2]}</span>`});
                        newmsg.push({type: "text", value: pieces[3]});
                        return;
                    }
                    newmsg.push(m);
                });
                message = newmsg;
            }
        }
        catch (ex) {
            console.error(ex);
        }
        return orig(...[nick, message, options].concat(args));
    });

    new class extends dry.Commands {
        ip(e) {
            toggle();
            return true;
        }
    }();
});
