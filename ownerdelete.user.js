// ==UserScript==
// @name         Mod EVERYTHING better, because reasons!
// @namespace    http://not.jew.dance/
// @version      0.60
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

  let owner = false;

  function createDeleteButton() {
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
    return "Time to rule this place";
  }

  function ownerTimeout(timeout) {
    return new Promise((_, reject) => setTimeout(() => {
      reject(new Error("You can't rule this place"));
    }, timeout));
  }

  function isOwner() {
    return new Promise(resolve => {
      (function waitForOwner() {
        if (owner) {
          return resolve(createDeleteButton());
        }
        setTimeout(waitForOwner, 200);
      })();
    });
  }

  Promise.race([isOwner(), ownerTimeout(4000)]).then(success => {
    console.log(success);
  }, error => {
    console.log(error.message);
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
  const saveRekts = () => {
    localStorage.setItem("rekted", JSON.stringify(Array.from(rekt.values())));
  };

  dry.once("dom", () => {
    new class extends dry.MessageFilter {
      showMessage(nick, message, options, ...args) {
        try {
          if (args.length && args[0] && args[0].id && owner &&
            rekt.has(nick.toLowerCase().trim())) {
            dry.exts.connection.call("timeoutChat", args[0].id, nick);
          }
        }
        catch (ex) {
          console.error(ex);
        }
      }
    }();
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
      let id = file.id;
      let fl = dry.exts.filelistManager.filelist.filelist;
      for (let i = 0; i < fl.length; ++i) {
        if (fl[i].id === id) {
          return { idx: i, item: fl[i] };
        }
      }
      return null;
    };
    const file_click = function(e) {
      let file = e.target.parentNode.dolosElement;
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
          dry.exts.connection.call("timeoutFile", file.id, file.tags.user || file.tags.nick);
          dry.exts.connection.call("deleteFiles", [file.id]);
        }
        let c = file.dom.controlElement;
        if (c.dolosElement) {
          return;
        }
        if (file.tags.nick) {
          const tags = Object.assign(file.tags, {cuck: "Whitename"});
          file.dom.setTags(tags);
        }
        c.addEventListener("click", file_click, true);
        let fe = file.dom.fileElement;
        fe.setAttribute("contextmenu", "dolos_cuckmenu");
        c.dolosElement = file;
      }
      catch (ex) {
        console.error(ex);
      }
    };

    function createButtons(isOwnerOrAdminOrJanitor) {
      if (owner || !isOwnerOrAdminOrJanitor) {
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
            let file = e.target.parentElement.firstChild.dolosElement;
            if (!file) {
              return;
            }
            user = file.tags.user || file.tags.nick;
            this.textContent = `Select all files from user '${user}'`;
          }.bind(mi));
          mi.addEventListener("click", function() {
            dry.exts.filelistManager.filelist.filelist.forEach(
              e => e.setData("checked", (e.tags.user || e.tags.nick) === user));
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
            fl.addEventListener("contextmenu", function(e) {
              let file = e.target.parentElement.firstChild.dolosElement;
              if (!file) {
                return;
              }
              ip = file.tags.ip;
              this.textContent = `Select all files with IP of '${ip}'`;
            }.bind(mi));
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
      dry.exts.filelistManager.on("fileAdded", prepare_file);
      dry.exts.filelistManager.on("fileUpdated", prepare_file);
      dry.exts.filelistManager.filelist.filelist.forEach(prepare_file);

    }
    dry.exts.user.on("info_owner", createButtons);
    dry.exts.user.on("info_admin", createButtons);
    dry.exts.user.on("info_janitor", createButtons);
  });
})();
