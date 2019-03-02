// ==UserScript==
// @name         Mod EVERYTHING better, because reasons!
// @namespace    http://not.jew.dance/
// @version      3
// @description  try to take over the world!
// @author       You
// @match        https://volafile.org/r/*
// @icon         https://volafile.org/favicon.ico
// @require      https://cdn.jsdelivr.net/gh/volafiled/volascripts@a9c0424e5498deea9fd437c15b2137c3bec07c61/dry.min.js
// @require      https://cdn.jsdelivr.net/gh/volafiled/node-parrot@acb622d5d9af34f0de648385e6ab4d2411373037/parrot/finally.min.js
// @require      https://cdn.jsdelivr.net/gh/volafiled/node-parrot@acb622d5d9af34f0de648385e6ab4d2411373037/parrot/pool.min.js
// @grant        none
// @run-at       document-start
// ==/UserScript==
/* globals dry, PromisePool */
(function() {
"use strict";

function selected() {
  return Array.from(
    dry.exts.filelistManager.filelist.filelist.
      filter(e => e.getData("checked")).
      map(e => e.id)
  );
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

const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
let isOwner = false;

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
        if (!isOwner || !data || !data.id) {
          return;
        }

        if (rekt.has(nick.toLowerCase().trim())) {
          dry.exts.connection.call("timeoutChat", data.id, 3600 * 24);
          return;
        }
        if (!options.user && rekt.has(whitePurge)) {
          dry.exts.connection.call("timeoutChat", data.id, 3600 * 24);
          return;
        }
      }
      catch (ex) {
        console.error(ex);
      }
    }
  }();

  new class extends dry.Commands {
    rekt(user) {
      if (!isOwner) {
        return true;
      }
      user = user.toLowerCase().trim();
      if (user !== "") {
        dry.appendMessage("Rekt", `${user} got rekt`);
        rekt.add(user);
        saveRekts();
      }
      else {
        dry.appendMessage("Error", "Can't rekt an empty string");
      }
      return true;
    }

    unrekt(user) {
      if (!isOwner) {
        return true;
      }
      user = user.toLowerCase().trim();
      if (user !== "") {
        dry.appendMessage("Unrekt", `${user} got unrekt`);
        rekt.delete(user);
        saveRekts();
      }
      else {
        dry.appendMessage("Error", "Can't unrekt an empty string");
      }
      return true;
    }

    showrekts() {
      if (!isOwner) {
        return true;
      }
      dry.unsafeWindow.alert(
        `Rekt boys:\n${Array.from(rekt.values()).filter(el => el !== whitePurge)}`
      );
      return true;
    }

    killwhites() {
      if (!isOwner) {
        return;
      }
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
  }();
});

dry.once("load", () => {
  let last_file = null;
  const ownerFiles = new WeakMap();
  const pool = new PromisePool(6);
  let checksums;

  (function() {
    checksums = JSON.parse(sessionStorage.getItem("ownerChecksums")) || {};
  })();
  const save_checksums = function() {
    sessionStorage.setItem("ownerChecksums", JSON.stringify(checksums));
  };
  const find_file = function(file) {
    const {id} = file;
    const fl = dry.exts.filelistManager.filelist.filelist;
    for (let i = 0; i < fl.length; ++i) {
      if (fl[i].id === id) {
        return { idx: i, item: fl[i] };
      }
    }
    return null;
  };
  const getFileFromEvent = function(e) {
    let file; let fileElement = e.target;
    while (!file) {
      if (!fileElement) {
        return null;
      }
      file = ownerFiles.get(fileElement);
      fileElement = fileElement.parentElement;
    }
    return file;
  };
  async function getInfo(file) {
    try {
      if (file.id in checksums && !file.checksum) {
        file.checksum = checksums[file.id];
        return;
      }
      const info = await dry.exts.info.getFileInfo(file.id);
      const {checksum} = info;
      checksums[file.id] = checksum;
      file.checksum = checksum;
      save_checksums();
    }
    catch (e) {
      console.error(e);
    }
  }
  const file_click = function(e) {
    if (!e.target.classList.contains("filetype")) {
      return undefined;
    }
    const file = getFileFromEvent(e);
    if (!file) {
      return undefined;
    }
    e.stopPropagation();
    e.preventDefault();
    if (!e.shiftKey) {
      file.setData("checked", !file.getData("checked"));
      last_file = file;
      return false;
    }
    if (!last_file) {
      return false;
    }
    let lf = find_file(last_file); let cf = find_file(file);
    if (!lf || !cf) {
      return false;
    }
    [lf, cf] = [lf.idx, cf.idx];
    if (cf > lf) {
      [lf, cf] = [cf, lf];
    }
    const files = dry.exts.filelistManager.filelist.filelist.slice(cf, lf).
      filter(file => file.visible);
    const checked = file.getData("checked");
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
      const fe = file.dom.fileElement;
      if (ownerFiles.has(fe)) {
        return;
      }
      const tags = Object.assign(file.tags, file.tags.nick ?
        {white: true} :
        {green: true});
      file.dom.setTags(tags);
      pool.schedule(getInfo, file);
      fe.addEventListener("click", file_click, true);
      fe.setAttribute("contextmenu", "dolos_cuckmenu");
      ownerFiles.set(fe, file);
    }
    catch (ex) {
      console.error(ex);
    }
  };

  const createButtons = function(isOwnerOrAdminOrJanitor) {
    if (isOwner || !isOwnerOrAdminOrJanitor) {
      return;
    }
    isOwner = true;

    try {
      const cont = $("#upload_container");
      const btnel = $e("label", {
        for: "dolos_delete_input",
        id: "dolos_deleteButton",
        class: "button",
        style: "margin-right: 0.5em",
      });
      btnel.appendChild($e("span", {
        class: "icon-trash"
      }));
      btnel.appendChild($e("span", {
        class: "on_small_header"
      }, "Delete"));
      cont.insertBefore(btnel, cont.firstChild);
      btnel.addEventListener("click", function() {
        const ids = selected();
        dry.exts.connection.call("deleteFiles", ids);
      });

      const el = $e("menu", {
        id: "dolos_cuckmenu",
        type: "context"
      });
      let mi = $e("menuitem", null, "Select All Files From User");
      el.appendChild(mi);
      let user = null;
      const lists = $$("#file_list, #volanail-list");
      for (const list of lists) {
        list.addEventListener("contextmenu", function(e) {
          const file = getFileFromEvent(e);
          if (!file) {
            this.style.display = "none";
            return;
          }
          user = file.tags.user || file.tags.nick;
          if (!user) {
            this.style.display = "none";
            return;
          }
          this.textContent = `Select All Files From '${user}'`;
          user = user.toLowerCase();
          this.style.display = "";
        }.bind(mi));
      }
      mi.addEventListener("click", function() {
        dry.exts.filelistManager.filelist.filelist.forEach(
          e => e.setData("checked",
            (e.tags.user || e.tags.nick).toLowerCase() === user));
      });

      mi = $e("menuitem", null, "Select All");
      mi.addEventListener("click", function() {
        dry.exts.filelistManager.filelist.filelist.forEach(
          e => e.setData("checked", true));
      });
      el.appendChild(mi);

      mi = $e("menuitem", null, "Select None");
      mi.addEventListener("click", function() {
        dry.exts.filelistManager.filelist.filelist.forEach(
          e => e.setData("checked", false));
      });
      el.appendChild(mi);

      mi = $e("menuitem", null, "Invert Selection");
      mi.addEventListener("click", function() {
        dry.exts.filelistManager.filelist.filelist.forEach(e => {
          e.setData("checked", !e.getData("checked"));
        });
      });
      el.appendChild(mi);

      mi = $e("menuitem", null, "Select Dupes");
      mi.addEventListener("click", function() {
        if (pool.total > 0) {
          dry.unsafeWindow.alert("Data to perform this operation is not ready yet! Try again soon.");
          return;
        }
        const known = new Set();
        dry.exts.filelistManager.filelist.filelist.forEach(e => {
          const k = e.checksum;
          if (known.has(k)) {
            e.setData("checked", true);
            console.log(`marked ${e.name} from ${e.tags.user || e.tags.nick} for doom`);
          }
          else {
            known.add(k);
            e.setData("checked", false);
          }
        });
      });
      el.appendChild(mi);

      mi = $e("menuitem", null, "Select All White Name Files");
      mi.addEventListener("click", function() {
        dry.exts.filelistManager.filelist.filelist.forEach(e => {
          e.setData("checked", !!e.tags.nick);
        });
      });
      el.appendChild(mi);

      if (dry.exts.user.info.admin) {
        let ip = null;
        mi = $e("menuitem", null, "Select All Files For IP");
        for (const list of lists) {
          list.addEventListener("contextmenu", function(e) {
            const file = getFileFromEvent(e);
            if (!file) {
              this.style.display = "none";
              return;
            }
            ip = file.tags.ip || null;
            if (!ip) {
              this.style.display = "none";
            }
            this.textContent = `Select All Files For IP '${ip}'`;
            this.style.display = "";
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

    dry.exts.filelistManager.on("fileAdded", prepare_file);
    dry.exts.filelistManager.on("fileUpdated", prepare_file);
    dry.exts.filelistManager.on("fileRemoved", file => {
      if (file.id in checksums) {
        delete checksums[file.id];
        save_checksums();
      }
    });
    dry.exts.filelistManager.on("nail_init", file => {
      const te = file.dom.vnThumbElement;
      if (!te) {
        console.warn("got a nail, but no nail");
        return;
      }
      te.setAttribute("contextmenu", "dolos_cuckmenu");
      ownerFiles.set(te, file);
    });
    dry.exts.filelistManager.filelist.filelist.forEach(prepare_file);
  };

  dry.exts.user.on("info_owner", createButtons);
  dry.exts.user.on("info_admin", createButtons);
  dry.exts.user.on("info_janitor", createButtons);
});
})();
