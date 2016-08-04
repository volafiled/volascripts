// ==UserScript==
// @name         Mod files better, because reasons!
// @namespace    http://not.jew.dance/
// @version      0.2
// @description  try to take over the world!
// @author       You
// @match        https://volafile.io/r/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';
    function selected() {
        return Array.from($$(".dolos-says-cuck")).filter(e => e.checked).map(e => e.dataset.id);
    }

    const $ = document.querySelector.bind(document);
    const $$ = document.querySelectorAll.bind(document);

    // yeah nasty!
    const exts = Room.prototype._extensions.connection.prototype.room.extensions;

    let last_file = null;
    const find_file = function(file) {
        let id = file.dataset.id;
        let fl = exts.filelistManager.filelist.filelist;
        for (let i = 0; i < fl.length; ++i) {
            if (fl[i].id === id) {
                return { idx: i, item: fl[i] };
            }
        }
        return null;
    };
    const file_click = function(e) {
        let file = e.target;
        last_file = file;
        if (!e.shiftKey) {
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
        let files = exts.filelistManager.filelist.filelist.slice(cf, lf);
        let checked = file.checked;
        files.forEach(el => {
            el = el.dom.controlElement.querySelector(".dolos-says-cuck");
            el.checked = checked;
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
            var existing = file.dom.controlElement.querySelector(".dolos-says-cuck");
            if (existing) {
                existing.dataset.id = file.id;
                return;
            }
            let chk = document.createElement("input");
            chk.setAttribute("type", "checkbox");
            chk.classList.add("dolos-says-cuck");
            chk.dataset.id = file.id;
            chk.style.display = "inline";
            let c = file.dom.controlElement;
            c.insertBefore(chk, c.firstChild);
            chk.addEventListener("click", file_click);
            let fe = file.dom.fileElement;
            fe.setAttribute("contextmenu", "dolos_cuckmenu");
            fe.dataset.dolosId = file.id;
        }
        catch (ex) {
            console.error(ex);
        }
    };

    exts.admin.on("owner", function() {
        if (!exts.admin.isOwner) {
            return;
        }

        (function() {
            try {
                let el = document.createElement("menu");
                el.setAttribute("id", "dolos_cuckmenu");
                el.setAttribute("type", "context");
                let mi = document.createElement("menuitem");
                mi.textContent = "Select all files from this user";
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
                    exts.filelistManager.filelist.filelist.forEach(
                        e => e.dom.fileElement.querySelector(".dolos-says-cuck").checked = e.tags.user === user);
                });

                mi = document.createElement("menuitem");
                mi.textContent = "Select all";
                mi.addEventListener("click", function() {
                    exts.filelistManager.filelist.filelist.forEach(
                        e => e.dom.fileElement.querySelector(".dolos-says-cuck").checked = true);
                });
                el.appendChild(mi);

                mi = document.createElement("menuitem");
                mi.textContent = "Select none";
                mi.addEventListener("click", function() {
                    exts.filelistManager.filelist.filelist.forEach(
                        e => e.dom.fileElement.querySelector(".dolos-says-cuck").checked = false);
                });
                el.appendChild(mi);

                mi = document.createElement("menuitem");
                mi.textContent = "Invert selection";
                mi.addEventListener("click", function() {
                    exts.filelistManager.filelist.filelist.forEach(e => {
                        e = e.dom.fileElement.querySelector(".dolos-says-cuck");
                        e.checked = !e.checked;
                    });
                });
                el.appendChild(mi);

                document.body.appendChild(el);

            }
            catch (ex) {
                console.error(ex);
            }
        })();
        exts.filelistManager.on("fileAdded", prepare_file);
        exts.filelistManager.on("fileUpdated", prepare_file);
        exts.filelistManager.filelist.filelist.forEach(prepare_file);

        let cont = $("#upload_container");
        (function() {
            try {
                let el = document.createElement("label");
                el.setAttribute("for", "dolos_delete_input");
                el.setAttribute("id", "dolos_deleteButton");
                el.classList.add("button");
                let ico = document.createElement("span");
                ico.classList.add("icon-trash");
                el.appendChild(ico);
                let lbl = document.createElement("span");
                lbl.classList.add("on_small_header");
                lbl.textContent = "Delete";
                el.appendChild(lbl);
                cont.insertBefore(el, cont.firstChild);
                el.addEventListener("click", function() {
                    let ids = selected();
                    exts.connection.call("deleteFiles", ids);
                });
            }
            catch (ex) {
                console.error(ex);
            }
        })();
    });
})();
