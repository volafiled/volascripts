// ==UserScript==
// @name         Mod files better, because reasons!
// @namespace    http://not.jew.dance/
// @version      0.1
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
    console.log(exts.admin, exts.admin.isOwner);

    const prepare_file  = function(file) {
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
        }
        catch (ex) {
            console.error(ex);
        }
    };

    exts.admin.on("owner", function() {
        console.log(exts.admin);
        if (!exts.admin.isOwner) {
            return;
        }
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
