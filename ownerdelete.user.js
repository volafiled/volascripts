// ==UserScript==
// @name         Mod EVERYTHING better, because reasons!
// @namespace    http://not.jew.dance/
// @version      1.0
// @description  try to take over the world!
// @author       You
// @match        https://volafile.org/r/*
// @require      https://cdn.jsdelivr.net/gh/volafiled/volascripts/dry.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
/* globals dry */
(function() {
  'use strict';
  function selected() {
    return Array.from(
      dry.exts.filelistManager.filelist.filelist.filter(e => e.getData("checked")).map(e => e.id)
    );
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
  let isOwner = false;

  (function() {
    return new Promise(resolve => {
      isOwner = resolve;
    });
  })().then(() => {
    let cont = $("#upload_container");
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
  });

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
  const whitePurge = "-purgewhiteys-";

  const saveRekts = () => {
    localStorage.setItem("rekted", JSON.stringify(Array.from(rekt.values())));
  };
  dry.once("dom", () => {
    new class extends dry.MessageFilter {
      showMessage(fn, nick, msgObj, options, data) {
        try {
          if (isOwner === true && data && data.id) {
            if (rekt.has(nick.toLowerCase().trim())) {
              dry.exts.connection.call("timeoutChat", data.id, 3600 * 24);
            }
            if (!options.user && rekt.has(whitePurge)) {
              dry.exts.connection.call("timeoutChat", data.id, 3600 * 24);
            }
          }
        }
        catch (ex) {
          console.error(ex);
        }
      }
    }();
    new class extends dry.Commands {
      rekt(user) {
        if (isOwner === true) {
          user = user.toLowerCase().trim();
          if (user !== "") {
            dry.appendMessage("Rekt", `${user} got rekt`);
            rekt.add(user);
            saveRekts();
          }
          else {
            dry.appendMessage("Error", "Can't rekt an empty string");
          }
        }
        return true;
      }
      unrekt(user) {
        if (isOwner === true) {
          user = user.toLowerCase().trim();
          if (user !== "") {
            dry.appendMessage("Unrekt", `${user} got unrekt`);
            rekt.delete(user);
            saveRekts();
          }
          else {
            dry.appendMessage("Error", "Can't unrekt an empty string");
          }
        }
        return true;
      }
      showrekts() {
        if (isOwner === true) {
          dry.unsafeWindow.alert(
            `Rekt boys:\n${Array.from(rekt.values()).filter(el => el !== whitePurge)}`
          );
        }
        return true;
      }
      killwhites() {
        if (isOwner === true) {
          if (rekt.has(whitePurge)) {
            dry.appendMessage("Purgatory", "Whiteposting is allowed now");
            rekt.delete(whitePurge);
          }
          else {
            dry.appendMessage("Purgatory", "All white posters will be timed out");
            rekt.add(whitePurge);
          }
          saveRekts();
        }
      }
    }();
  });

  dry.once("load", () => {
    let last_file = null;
    let ifVolanail = false;
    const ownerFiles = new WeakMap();

    const find_file = function(file) {
      let id = file.id;
      let fl = dry.exts.filelistManager.filelist.filelist;
      for (let i = 0; i < fl.length; ++i) {
        if (fl[i].id === id) {
          return { idx: i, item: fl[i] };
        }
      }
      return null;
    };
    const getFileFromEvent = function(e) {
      let file, fileElement = e.target;
      while (!file) {
        if (!fileElement) {
          return null;
        }
        file = ownerFiles.get(fileElement);
        fileElement = fileElement.parentElement;
      }
      return file;
    };
    const file_click = function(e) {
      if (!e.target.classList.contains("filetype")) {
        return;
      }
      const file = getFileFromEvent(e);
      if (!file) {
        return;
      }
      e.stopPropagation();
      e.preventDefault();
      if (!e.shiftKey) {
        file.setData("checked", !file.getData("checked"));
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
      let checked = file.getData("checked");
      files.forEach(el => {
        el.setData("checked", !checked);
      });
      file.setData("checked", !checked);
      last_file.setData("checked", !checked);
      return false;
    };
    const prepare_file = function(file) {
      try {
        if (!file.id) {
          return;
        }
        if (file.tags && (file.tags.user || file.tags.nick) &&
          rekt.has((file.tags.user || file.tags.nick).toLowerCase().trim())) {
          dry.exts.connection.call("timeoutFile", file.id, 3600 * 24);
          dry.exts.connection.call("deleteFiles", [file.id]);
        }
        let fe = file.dom.fileElement;
        if (ownerFiles.has(fe)) {
          return;
        }
        if (file.tags.nick) {
          const tags = Object.assign(file.tags, {cuck: "Whitename"});
          file.dom.setTags(tags);
        }
        fe.addEventListener("click", file_click, true);
        fe.setAttribute("contextmenu", "dolos_cuckmenu");
        ownerFiles.set(fe, file);
        if (ifVolanail) {
          // wait for vnThumbElement on volanail side
          setTimeout(() => {
            let te = file.dom.vnThumbElement.firstChild;
            te.setAttribute("contextmenu", "dolos_cuckmenu");
            ownerFiles.set(te, file);
          });
        }
      }
      catch (ex) {
        console.error(ex);
      }
    };

    const createButtons = function(isOwnerOrAdminOrJanitor) {
      if (isOwner === true || !isOwnerOrAdminOrJanitor) {
        return;
      }
      isOwner(isOwner = true);
      ifVolanail = !!$("#volanail-button");

      (function() {
        try {
          let el = $e("menu", {
            id: "dolos_cuckmenu",
            type: "context"
          });
          let mi = $e("menuitem", null, "Select all files from this user");
          el.appendChild(mi);
          let user = null;
          let fl = $$("#file_list, #volanail-list");
          for (let i = 0, len = fl.length; i < len; i++) {
            fl[i].addEventListener("contextmenu", function(e) {
              const file = getFileFromEvent(e);
              if (!file) {
                return;
              }
              user = file.tags.user || file.tags.nick;
              this.textContent = `Select all files from user '${user}'`;
              user = user.toLowerCase();
            }.bind(mi));
          }
          mi.addEventListener("click", function() {
            dry.exts.filelistManager.filelist.filelist.forEach(
              e => e.setData("checked", (e.tags.user || e.tags.nick).toLowerCase() === user));
          });

          mi = $e("menuitem", null, "Select all");
          mi.addEventListener("click", function() {
            dry.exts.filelistManager.filelist.filelist.forEach(
              e => e.setData("checked", true));
          });
          el.appendChild(mi);

          mi = $e("menuitem", null, "Select none");
          mi.addEventListener("click", function() {
            dry.exts.filelistManager.filelist.filelist.forEach(
              e => e.setData("checked", false));
          });
          el.appendChild(mi);

          mi = $e("menuitem", null, "Invert selection");
          mi.addEventListener("click", function() {
            dry.exts.filelistManager.filelist.filelist.forEach(e => {
              e.setData("checked", !e.getData("checked"));
            });
          });
          el.appendChild(mi);

          mi = $e("menuitem", null, "Select dupes");
          mi.addEventListener("click", function() {
            let known = new Set();
            dry.exts.filelistManager.filelist.filelist.forEach(e => {
              let k = `${e.size}/${e.name}`;
              if (known.has(k)) {
                e.setData("checked", true);
                console.log("marked " + k + " for doom");
              }
              else {
                known.add(k);
                e.setData("checked", false);
              }
            });
          });
          el.appendChild(mi);

          mi = $e("menuitem", null, "Select all files uploaded by not logged users");
          mi.addEventListener("click", function() {
            dry.exts.filelistManager.filelist.filelist.forEach(e => {
              e.setData("checked", !!e.tags.nick);
            });
          });
          el.appendChild(mi);

          if (dry.exts.user.info.admin) {
            let ip = null;
            mi = $e("menuitem", null, `Select all files with users's IP`);
            for (let i = 0, len = fl.length; i < len; i++) {
              fl[i].addEventListener("contextmenu", function(e) {
                const file = getFileFromEvent(e);
                if (!file) {
                  return;
                }
                ip = file.tags.ip;
                this.textContent = `Select all files with IP of '${ip}'`;
              }.bind(mi));
            }
            mi.addEventListener("click", function() {
              dry.exts.filelistManager.filelist.filelist.forEach(e => {
                e.setData("checked", e.tags.ip === ip);
              });
            });
            el.appendChild(mi);
          }
          document.body.appendChild(el);
        }
        catch (ex) {
          console.error(ex);
        }
      })();
      const addHandlers = function() {
        dry.exts.filelistManager.on("fileAdded", prepare_file);
        dry.exts.filelistManager.on("fileUpdated", prepare_file);
        dry.exts.filelistManager.filelist.filelist.forEach(prepare_file);
      };
      if (ifVolanail) {
        dry.exts.file.once("volanailed", () => {
          addHandlers();
        });
      }
      else {
        addHandlers();
      }
    };
    dry.exts.user.on("info_owner", createButtons);
    dry.exts.user.on("info_admin", createButtons);
    dry.exts.user.on("info_janitor", createButtons);
  });
})();
