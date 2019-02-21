// ==UserScript==
// @name        VolaNailer
// @namespace   https://volafile.org
// @include     https://volafile.org/r/*
// @icon        https://volafile.org/favicon.ico
// @author      topkuk productions
// @match       https://volafile.org/r/*
// @require     https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// @require     https://cdn.jsdelivr.net/gh/volafiled/volascripts@a9c0424e5498deea9fd437c15b2137c3bec07c61/dry.min.js
// @require     https://cdn.jsdelivr.net/gh/volafiled/node-parrot@acb622d5d9af34f0de648385e6ab4d2411373037/parrot/finally.min.js
// @require     https://cdn.jsdelivr.net/gh/volafiled/node-parrot@acb622d5d9af34f0de648385e6ab4d2411373037/parrot/pool.min.js
// @grant       none
// @version     5
// ==/UserScript==
/* globals GM, dry, format, PromisePool */
/* jslint strict:global,browser:true,devel:true */

"use strict";
console.log("running", GM.info.script.name, GM.info.script.version);

const SHEET = `
.icon-vnthumb {
  margin: 0 !important;
}
.icon-vnthumb:before {
  content: "\\f03e"; /* XXX use actual icon class, but colors :*( */
}
.volanail-button {
  position: relative;
  z-index: 150;
  font-size: 18px;
  padding-bottom: 1px;
  margin-right: 1ex
}
.volanail-button[active] {
  box-shadow: inset 0px 0px 5px 3px rgba(47, 47, 47, 0.5);
}
#volanail-list {
  display: flex;
  flex-wrap: wrap;
  padding: 6px 10px;
}
.volanail-thumb > img, .volanail-thumb > video {
  display: inline-block;
  max-height: calc(100% - 1.4em - 4ex);
  max-width: calc(100% - 1.2em);
  object-fit: contain;
}
.volanail-thumb > div.volanail-media {
  height: calc(100% - 1.4em - 8ex);
  width: calc(100% - 1.2em - 4ex);
  border: 6px dashed white !important;
  border-radius: 26px;
}
.volanail-thumb > .file_name.file_hellbanned {
  text-decoration: line-through double;
  color: #ed7174;
}
.volanail-thumb > div.volanail-media > span {
  margin: auto;
  padding: 0;
  font-size: 90px;
}
.volanail-thumb {
  display: inline-flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  width: calc(100% / 4 - 12px - 1ex);
  height: 260px;
  border-radius: 10px;
  background: rgba(255,255,255,0.1);
  padding: 0.5em 4px;
  margin: 0.5ex;
  text-decoration: none;
  text-align: center;
  border: 2px solid rgba(128,128,128,0.3) !important;
}
.volanail-thumb .tag_key_ip {
  display: inline-block;
  margin-left: 2ex;
}
.volanail-checked {
  border: 2px solid white !important;
}
.volanail-video {
  background: rgba(255,255,255,0.2);
}
.volanail-name, .volanail-infos {
  font-size: small;
  text-overflow: ellipsis;
  width: 100%;
  white-space: nowrap;
  overflow: hidden;
  margin-top: 0.4ex;
}
.volanail-name .file_control {
  padding: 0;
  padding-right: 1ex;
}
.volanail-infos {
  font-size: x-small;
}
`;

const ICON_ERROR = "https://cdn.rawgit.com/RealDolos/assets/5cd4f6f4c349e32e778da55a41928c0309ac4fd4/error.svg";
const ICON_LOADING = "https://cdn.rawgit.com/RealDolos/assets/5cd4f6f4c349e32e778da55a41928c0309ac4fd4/waiting.svg";
const apool = new class AnimationPool {
  constructor() {
    this.items = [];
    this.id = 0;
    this.run = this.run.bind(this);
    Object.seal(this);
  }

  run() {
    try {
      while (this.items.length) {
        const items = Array.from(this.items);
        this.items.length = 0;
        for (const item of items) {
          try {
            item.res(item.fn.call(item.ctx, ...item.args));
          }
          catch (ex) {
            item.rej(ex);
          }
          finally {
            delete item.res;
            delete item.rej;
            delete item.fn;
            delete item.args;
          }
        }
      }
    }
    finally {
      this.items.length = 0;
      this.id = 0;
    }
  }

  schedule(ctx, fn, ...args) {
    const item = { ctx, fn, args };
    const rv = new Promise((res, rej) => Object.assign(item, { res, rej }));
    this.items.push(item);
    if (!this.id) {
      this.id = requestAnimationFrame(this.run);
    }
    return rv;
  }
}();

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

const $ = (sel, el) => (el || document).querySelector(sel);
const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));

let active = false;
let button;
let file_list;
let thumb_list;

(function() {
  const sheet = $e("style", {id: "volanail-sheet"}, SHEET);
  document.body.appendChild(sheet);

  const cont = $("#upload_container");
  button = $e("label", {
    for: "volanail-button",
    id: "volanail-button",
    class: "button volanail-button"
  });
  button.appendChild($e("span", {
    class: "icon-vnthumb"
  }));
  button.appendChild($e("span", {
    class: "on_small_header"
  }/*, Thumbnail"*/));
  cont.insertBefore(button, cont.firstChild);
  file_list = $("#file_list");
  thumb_list = $e("div", {id: "volanail-list"});
  thumb_list.style.display = "none";
  file_list.parentElement.insertBefore(thumb_list, file_list);

  const files_frame = $("#files_frame");
  let oldCount = 0;
  const rule = Array.from(sheet.sheet.cssRules).find(
    e => e && e.selectorText === ".volanail-thumb" ? e : null);
  const update_columns = () => {
    apool.schedule(null, () => {
      const columnCount = Math.max(2, Math.floor(files_frame.clientWidth / 220));
      if (oldCount === columnCount) {
        return;
      }
      oldCount = columnCount;
      rule.style.width = `calc(100% / ${columnCount} - 12px - 1ex)`;
    });
  };

  // Easier to observe mutations than hook into lain codes
  new MutationObserver(() => update_columns()).observe(files_frame, {
    attributes: true
  });
  update_columns();
})();

const force_update = () => {
  dry.exts.filelist.updateInfo.oldUnseenFiles = -1; // force the update m8
  dry.exts.filelist.scheduleDomUpdate();
};

class Thumbnail {
  constructor(file) {
    this.file = file;
    const container = this.container = $e("a", {
      href: file.link,
      target: "_blank",
      class: `volanail-thumb volanail-${file.type}`
    });
    const name = $e("div", {
      class: `volanail-name ${file.dom.nameElement && file.dom.nameElement.className}`,
      title: file.name
    }, file.name);
    const icon = this.icon = file.dom.controlElement.cloneNode(true);
    icon.icon = file.dom.controlElement;
    name.insertBefore(icon, name.firstChild);
    name.onclick = e => {
      file.dom.controlElement.firstChild.dispatchEvent(
        new MouseEvent(e.type, e));
      e.preventDefault();
      e.stopPropagation();
      return false;
    };
    container.appendChild(name);
    const infos = this.infos = $e("div", {
      class: "volanail-infos"
    }, `${format.prettySize(file.size)} - ${file.tags.user || file.tags.nick || "n/a"}`);
    container.appendChild(infos);
    container.doLoad = () => {
      try {
        return apool.schedule(
          null, () => this.doLoadInternal(file).catch(console.error));
      }
      finally {
        delete this.container.doLoad;
      }
    };
    container.onclick = e => {
      file.dom.nameElement.dispatchEvent(new MouseEvent(e.type, e));
      e.stopPropagation();
      e.preventDefault();
      return false;
    };
    file.on("data_checked", state => {
      container.classList[state ? "add" : "remove"]("volanail-checked");
    });
    const {fileElement} = file.dom;
    container.classList[
      fileElement.classList.contains("file_selected") ? "add" : "remove"
    ]("volanail-checked");
    this.setMedia(make_image(ICON_LOADING));
  }

  setMedia(el) {
    apool.schedule(this, this.setMediaInternal, el);
  }

  setMediaInternal(el) {
    $$(".volanail-media", this.container).forEach(
      e => this.container.removeChild(e));
    this.container.insertBefore(el, this.infos);
  }

  async doLoadInternal(file) {
    try {
      await this.addInfo(await dry.exts.info.getFileInfo(file.id));
    }
    catch (ex) {
      this.setMedia(make_image(ICON_ERROR));
      throw ex;
    }
  }

  addInfo(info) {
    return new Promise((resolve, reject) => apool.schedule(
      this, this.addInfoAsPromised, info, resolve, reject));
  }

  addInfoForGeneric(info, ip, cls, resolve) {
    const fmt = $e(
      "div",
      null,
      `Type: ${this.file.type.slice(0, 1).toUpperCase()}${this.file.type.slice(1)}`);
    if (ip) {
      fmt.appendChild(ip);
    }
    this.infos.insertBefore(fmt, this.infos.firstChild);
    const img = document.createElement("div");
    const icon = document.createElement("span");
    icon.className = cls;
    icon.classList.remove("clickable");
    img.classList.add("volanail-media");
    img.appendChild(icon);
    this.setMedia(img);
    resolve();
  }

  addInfoForThumb(info, ip, name, resolve, reject) {
    if (info.image) {
      const format = info.image.format ? `${info.image.format} - ` : "";
      const fmt = $e(
        "div",
        null,
        `${format} ${info.image.width || 0}×${info.image.height || 0}`);
      if (ip) {
        fmt.appendChild(ip);
      }
      this.infos.insertBefore(fmt, this.infos.firstChild);
    }
    const src = dry.unsafeWindow.makeAssetUrl(info.id, name, info.thumb.server);
    const img = new Image();
    img.classList.add("volanail-media");
    img.onerror = error => {
      reject({error, src});
    };
    img.onload = () => {
      this.setMedia(img);
      resolve();
    };
    setTimeout(() => reject("timeout"), 10000);
    img.src = src;
  }

  addInfoForVideoThumb(info, ip, name, resolve, reject) {
    if (info.video) {
      const fmt = $e(
        "div",
        null,
        `${info.video.codec} - ${format.duration((info.video.duration || 0) * 1000)} - ${info.video.width || 0}×${info.video.height || 0}`);
      if (ip) {
        fmt.appendChild(ip);
      }
      this.infos.insertBefore(fmt, this.infos.firstChild);
    }
    if (info.image) {
      const format = info.image.format ? `${info.image.format} - ` : "";
      const fmt = $e(
        "div",
        null,
        `${format} ${info.image.width || 0}×${info.image.height || 0}`);
      if (ip) {
        fmt.appendChild(ip);
      }
      this.infos.insertBefore(fmt, this.infos.firstChild);
    }
    const src = dry.unsafeWindow.makeAssetUrl(info.id, name, info.thumb.server);
    const video = $e("video", {
      class: "volanail-media",
      src
    });

    function setStart() {
      // work around "blank" start frames
      video.currentTime = video.duration > 0.1 ? video.duration / 3 : 0;
    }

    video.onloadeddata = () => {
      this.setMedia(video);
      setStart();
      resolve();
    };
    video.onstalled = () => {
      reject(src);
    };
    video.onerror = () => {
      reject(src);
    };
    video.loop = true;
    video.muted = true;
    video.onmouseover = () => {
      video.currentTime = 0;
      video.play();
    };
    video.onmouseout = () => {
      video.pause();
      setStart();
    };
    setTimeout(() => reject(`timeout ${src}`), 10000);
  }

  addInfoAsPromised(info, resolve, reject) {
    try {
      this.icon.firstChild.className = this.icon.icon.firstChild.className;
      delete this.icon.icon;
      let ip;
      if (info.uploader_ip) {
        ip = $e("span", {class: "tag_key_ip"}, info.uploader_ip);
      }
      const {thumb = {}} = info;
      const {type: ttype = "", name = "thumb"} = thumb;
      if (ttype.startsWith("image/")) {
        this.addInfoForThumb(info, ip, name, resolve, reject);
        return;
      }
      if (ttype.startsWith("video/")) {
        this.addInfoForVideoThumb(info, ip, name, resolve, reject);
        return;
      }
      if (["thumb", "video_thumb"].some(a => this.file.assets.includes(a))) {
        throw new Error("No thumb");
      }
      this.addInfoForGeneric(
        info, ip, this.icon.firstChild.className, resolve, reject);
    }
    catch (ex) {
      reject(ex);
    }
  }
}

const make_image = src => {
  const img = new Image();
  img.src = src;
  img.classList.add("volanail-media");
  return img;
};

const prepare_file = dry.exportFunction(file => {
  try {
    if (file.upload || !file.id || !file.dom || file.dom.vnThumbElement) {
      return;
    }
    if (active) {
      force_update();
    }
  }
  catch (ex) {
    console.error(file, ex);
  }
}, dry.unsafeWindow);

const update_file = dry.exportFunction(file => {
  try {
    const pe = file.dom.vnThumbElement && file.dom.vnThumbElement.parentElement;
    if (pe) {
      pe.removeChild(file.dom.vnThumbElement);
    }
    delete file.dom.vnThumbElement;
    if (file.upload || !file.id || !file.dom) {
      return;
    }
    if (active) {
      force_update();
    }
  }
  catch (ex) {
    console.error(file, ex);
  }
}, dry.unsafeWindow);

const remove_file = dry.exportFunction(file => {
  if (!file.dom || !file.dom.vnThumbElement) {
    return;
  }
  const parent = file.dom.vnThumbElement.parentElement;
  if (parent) {
    parent.removeChild(file.dom.vnThumbElement);
  }
  delete file.dom.vnThumbElement;
  if (active) {
    force_update();
  }
}, dry.unsafeWindow);

const loader = new class Loader {
  constructor() {
    this.load_one = PromisePool.wrapNew(5, this, this.load_one);
    this.remaining = [];
  }

  refresh() {
    this.remaining = $$(".volanail-thumb").filter(e => e.doLoad);
    if (!this.remaining.length) {
      return;
    }
    this.load().catch(console.error);
  }

  load_one(t) {
    if (!active || !t.doLoad) {
      return null;
    }
    return t.doLoad();
  }

  async load() {
    if (this.loading || !this.remaining.length) {
      return;
    }
    this.loading = true;
    try {
      while (this.remaining.length) {
        const jobs = this.remaining.map(this.load_one);
        this.remaining.length = 0;
        await Promise.all(jobs);
      }
    }
    finally {
      this.loading = false;
    }
  }
}();

dry.once("load", () => {
  dry.exts.filelistManager.on("fileAdded", prepare_file);
  dry.exts.filelistManager.on("fileUpdated", update_file);
  dry.exts.filelistManager.on("fileRemoved", remove_file);

  dry.replaceLate("filelist", "restoreScrollAnchor", function(orig, ...args) {
    // we don't wanna scroll when in thumb view
    return active ? null : orig(...args);
  });

  dry.replaceLate("filelist", "updateDom", function(orig, ...args) {
    let rv;
    try {
      rv = orig(...args);
    }
    catch (ex) {
      console.error("LAIN dun goofed", ex);
    }
    try {
      const off = 0;
      dry.exts.filelist.each((f, idx) => {
        let el = f.dom.vnThumbElement;
        if (!el) {
          el = f.dom.vnThumbElement = new Thumbnail(f).container;
        }
        const parent = el.parentElement;
        if (f.visible) {
          const an = thumb_list.childNodes[idx - off];
          if (!parent || an !== el) {
            thumb_list.insertBefore(el, an);
          }
        }
        else if (!f.visible && parent) {
          parent.removeChild(el);
        }
        f.emit("thumb_added");
      });
      loader.refresh();
    }
    catch (ex) {
      console.error("something went wronk", ex);
    }
    return rv;
  });

  button.addEventListener("click", () => {
    if (thumb_list.style.display !== "none") {
      file_list.style.display = "block";
      thumb_list.style.display = "none";
      button.removeAttribute("active");
      active = false;
    }
    else {
      file_list.style.display = "none";
      thumb_list.style.display = "flex";
      button.setAttribute("active", "true");
      active = true;
      force_update();
    }
  });

  Array.from(dry.exts.filelistManager.filelist.filelist).reverse().forEach(
    prepare_file);

  //button.click();
});
