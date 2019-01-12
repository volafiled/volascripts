// ==UserScript==
// @name         Mod EVERYTHING better, because reasons!
// @namespace    http://not.jew.dance/
// @version      0.20
// @description  try to take over the world!
// @author       You
// @match        https://volafile.org/r/*
// @require      https://cdn.jsdelivr.net/gh/volafiled/volascripts/dry.js
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';
    function selected() {
        return Array.from($$(".dolos-says-cuck")).filter(e => e.checked).map(e => e.dataset.id);
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

    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);

    const loadRekts = () => {
        let rv = localStorage.getItem("rekted");
        rv = JSON.parse(rv || "[]");
        try {
            return new Set(rv || []);
        }
        catch (ex) {
            return new Set();
        }
    };
    const rekt = loadRekts();
    const saveRekts = () => {
        localStorage.setItem("rekted", JSON.stringify(Array.from(rekt.values())));
    };

    let owner = false;

    dry.once("dom", () => {

        const chatp = Room.prototype._extensions.chat.prototype;

        const showMessage = chatp.showMessage;
        chatp.showMessage = function(nick, message, options, ...args) {
            try {
                if (args.length && args[0] && args[0].id && owner && rekt.has(nick.toLowerCase().trim())) {
                    dry.exts.connection.call("timeoutChat", args[0].id, nick);
                }
            }
            catch (ex) {
                console.error(ex);
            }
            return showMessage.apply(this, [nick, message, options].concat(args));
        };
        new class extends dry.Commands {
            rekt(user) {
                console.log("rekting user", user);
                rekt.add(user.toLowerCase().trim());
                saveRekts();
                return true;
            }
            unrekt(user) {
                console.log("unrekting user", user);
                rekt.delete(user.toLowerCase().trim());
                saveRekts();
                return true;
            }
        }();
    });

  dry.once("load", () => {

        let last_file = null;
        const find_file = function(file) {
            let id = file.dataset.id;
            let fl = dry.exts.filelistManager.filelist.filelist;
            for (let i = 0; i < fl.length; ++i) {
                if (fl[i].id === id) {
                    return { idx: i, item: fl[i] };
                }
            }
            return null;
        };
        const file_click = function(e) {
            let file = e.target;
            if (!e.shiftKey) {
                e.stopPropagation();
                e.preventDefault();
                // hack to work around prevent default here
                setTimeout(() => {
                    file.checked = !file.checked;
                });
                last_file = file;
                return;
            }
            if (!last_file) {
                return;
            }
            let lf = find_file(last_file), cf = find_file(file);
            if (!lf || !cf) {
                return;
            }
            [lf, cf] = [lf.idx, cf.idx];
            if (cf > lf) {
                [lf, cf] = [cf, lf];
            }
            let files = dry.exts.filelistManager.filelist.filelist.slice(cf, lf);
            let checked = file.checked;
            files.forEach(el => {
                el.dom.dolosElement.checked = checked;
            });
            e.stopPropagation();
            e.preventDefault();
            setTimeout(() => file.checked = last_file.checked = checked, 0);
            return false;
        };
        const prepare_file = function(file) {
            try {
                if (!file.id) {
                    return;
                }
                if (file.tags && file.tags.user && rekt.has(file.tags.user.toLowerCase().trim())) {
                    dry.exts.connection.call("timeoutFile", file.id, file.tags.user);
                    dry.exts.connection.call("deleteFiles", [file.id]);
                }
                var existing = file.dom.dolosElement;
                if (existing) {
                    existing.dataset.id = file.id;
                    return;
                }
                let chk = $e("input", {
                    type: "checkbox",
                    class: "dolos-says-cuck"
                });
                chk.dataset.id = file.id;
                chk.style.display = "inline";
                chk.style.outline = 0;
                chk.style.marginRight = "0.5em";
                let c = file.dom.controlElement;
                c.insertBefore(chk, c.firstChild);
                chk.addEventListener("click", file_click, true);
                let fe = file.dom.fileElement;
                fe.setAttribute("contextmenu", "dolos_cuckmenu");
                fe.dataset.dolosId = file.id;
                file.dom.dolosElement = chk;
            }
            catch (ex) {
                console.error(ex);
            }
        };

        dry.exts.user.on("info_owner", (isOwner) => {
            if (!isOwner) {
                return;
            }
            owner = true;

            (function() {
                try {
                    let el = $e("menu", {
                        id: "dolos_cuckmenu",
                        type: "context"
                    });
                    let mi = $e("menuitem", null, "Select all files from this user");
                    el.appendChild(mi);
                    let user = null;
                    let fl = $("#file_list");
                    fl.addEventListener("contextmenu", function(e) {
                        let node = e.target;
                        while (!node.dataset.dolosId) {
                            node = node.parentElement;
                        }
                        user = node.querySelector('.tag_key_user').textContent.trim();
                        this.textContent = `Select all files from user '${user}'`;
                    }.bind(mi));
                    mi.addEventListener("click", function() {
                        dry.exts.filelistManager.filelist.filelist.forEach(
                            e => e.dom.dolosElement.checked = e.tags.user === user);
                    });

                    mi = $e("menuitem", null, "Select all");
                    mi.addEventListener("click", function() {
                        dry.exts.filelistManager.filelist.filelist.forEach(
                            e => e.dom.dolosElement.checked = true);
                    });
                    el.appendChild(mi);

                    mi = $e("menuitem", null, "Select none");
                    mi.addEventListener("click", function() {
                        dry.exts.filelistManager.filelist.filelist.forEach(
                            e => e.dom.dolosElement.checked = false);
                    });
                    el.appendChild(mi);

                    mi = $e("menuitem", null, "Invert selection");
                    mi.addEventListener("click", function() {
                        exts.filelistManager.filelist.filelist.forEach(e => {
                            e = e.dom.dolosElement;
                            e.checked = !e.checked;
                        });
                    });
                    el.appendChild(mi);

                    mi = $e("menuitem", null, "Select dupes");
                    mi.addEventListener("click", function() {
                        let known = new Set();
                        dry.exts.filelistManager.filelist.filelist.forEach(e => {
                            let k = `${e.size}/${e.name}`;
                            let existing = known.has(k);
                            if (known.has(k)) {
                                e.dom.dolosElement.checked = true;
                                console.log("marked " + k + " for doom");
                            }
                            else {
                                known.add(k);
                                e.dom.dolosElement.checked = false;
                            }
                        });
                    });
                    el.appendChild(mi);

                    document.body.appendChild(el);
                }
                catch (ex) {
                    console.error(ex);
                }
            })();
            dry.exts.filelistManager.on("fileAdded", prepare_file);
            dry.exts.filelistManager.on("fileUpdated", prepare_file);
            dry.exts.filelistManager.filelist.filelist.forEach(prepare_file);

            let cont = $("#upload_container");
            (function() {
                try {
                    let el = $e("label", {
                        "for": "dolos_delete_input",
                        "id": "dolos_deleteButton",
                        "class": "button",
                        "style": "margin-right: 0.5em",
                    });
                    el.appendChild($e("span", {
                        "class": "icon-trash"
                    }));
                    el.appendChild($e("span", {
                        "class": "on_small_header"
                    }, "Delete"));
                    cont.insertBefore(el, cont.firstChild);
                    el.addEventListener("click", function() {
                        let ids = selected();
                        dry.exts.connection.call("deleteFiles", ids);
                    });
                }
                catch (ex) {
                    console.error(ex);
                }
            })();
        });
  });
})();
