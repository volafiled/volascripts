// ==UserScript==
// @name        VolaNailer
// @namespace   https://volafile.org
// @include     https://volafile.org/r/*
// @icon        https://volafile.org/favicon.ico
// @author      topkuk productions
// @match       https://volafile.org/r/*
// @require     https://cdn.rawgit.com/RealDolos/volascripts/1dd689f72763c0e59f567fdf93865837e35964d6/dry.js
// @require     https://cdn.rawgit.com/RealDolos/node-4get/1be8052af5770998d6d936fdd5eb717571b205c8/lib/finally.js
// @require     https://cdn.rawgit.com/RealDolos/node-4get/1be8052af5770998d6d936fdd5eb717571b205c8/lib/pool.js
// @grant       none
// @version     1.6
// ==/UserScript==
/* globals GM_info, dry, format, PromisePool */
/* jslint strict:global,browser:true,devel:true */

"use strict";
console.log("running", GM_info.script.name, GM_info.script.version);

const error = "data:image/svg+xml;charset=utf-8,%3Csvg%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20width%3D%22200%22%20version%3D%221.1%22%3E%0D%0A%3Cdefs%3E%0D%0A%3ClinearGradient%20id%3D%22c%22%20y2%3D%225.541%22%20gradientUnits%3D%22userSpaceOnUse%22%20y1%3D%2266.29%22%20x2%3D%2219.07%22%20x1%3D%2236.92%22%3E%0D%0A%3Cstop%20stop-color%3D%22%23a40000%22%20offset%3D%220%22%2F%3E%0D%0A%3Cstop%20stop-color%3D%22%23ff1717%22%20offset%3D%221%22%2F%3E%0D%0A%3C%2FlinearGradient%3E%0D%0A%3ClinearGradient%20id%3D%22b%22%20y2%3D%22-8.563%22%20gradientUnits%3D%22userSpaceOnUse%22%20y1%3D%2253.84%22%20x2%3D%2220.07%22%20x1%3D%2243.94%22%3E%0D%0A%3Cstop%20stop-color%3D%22%23ffe69b%22%20offset%3D%220%22%2F%3E%0D%0A%3Cstop%20stop-color%3D%22%23fff%22%20offset%3D%221%22%2F%3E%0D%0A%3C%2FlinearGradient%3E%0D%0A%3ClinearGradient%20id%3D%22a%22%20y2%3D%2215.82%22%20gradientUnits%3D%22userSpaceOnUse%22%20y1%3D%2233.96%22%20gradientTransform%3D%22matrix%284.559%200%200%204.559%20-9.417%20-156.5%29%22%20x2%3D%2220.92%22%20x1%3D%2221.99%22%3E%0D%0A%3Cstop%20stop-color%3D%22%23fffeff%22%20stop-opacity%3D%22.3333%22%20offset%3D%220%22%2F%3E%0D%0A%3Cstop%20stop-color%3D%22%23fffeff%22%20stop-opacity%3D%22.2157%22%20offset%3D%221%22%2F%3E%0D%0A%3C%2FlinearGradient%3E%0D%0A%3C%2Fdefs%3E%0D%0A%3Cg%20transform%3D%22translate%28-4.122e-8%20152%29%22%3E%0D%0A%3Cg%20transform%3D%22matrix%284.545%200%200%204.545%20-9.091%20-156.5%29%22%3E%0D%0A%3Ccircle%20stroke-width%3D%221.086%22%20transform%3D%22matrix%28.9205%200%200%20.9205%202.368%20.9741%29%22%20stroke%3D%22%23b20000%22%20cy%3D%2223.93%22%20cx%3D%2223.5%22%20r%3D%2223.36%22%20fill%3D%22url%28%23c%29%22%2F%3E%0D%0A%3Ccircle%20opacity%3D%22.3466%22%20stroke-width%3D%221.168%22%20fill-opacity%3D%220%22%20transform%3D%22matrix%28.8561%200%200%20.8561%201.818%20.1978%29%22%20stroke%3D%22url%28%23b%29%22%20cy%3D%2226.64%22%20cx%3D%2225.91%22%20r%3D%2223.99%22%2F%3E%0D%0A%3C%2Fg%3E%0D%0A%3C%2Fg%3E%0D%0A%3Cg%20transform%3D%22translate%28-4.122e-8%20152%29%22%3E%0D%0A%3Crect%20height%3D%2236.36%22%20width%3D%22127.3%22%20y%3D%22-70.18%22%20x%3D%2236.37%22%20fill%3D%22%23efefef%22%2F%3E%0D%0A%3C%2Fg%3E%0D%0A%3Cg%20transform%3D%22translate%28-4.122e-8%20152%29%22%3E%0D%0A%3Cpath%20d%3D%22m188.3-57.46c0%2049.38-47.21-28.57-85.14%201.764-37.05%2029.62-93.9%2055.58-93.9%206.2%200-50.53%2039.64-97.41%2089.02-97.41%2049.38-0.00091%2090.02%2040.07%2090.02%2089.45z%22%20fill%3D%22url%28%23a%29%22%2F%3E%0D%0A%3C%2Fg%3E%0D%0A%3C%2Fsvg%3E";
const loading = "data:image/svg+xml;charset=utf-8,%3Csvg%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20200%20200%22%20width%3D%22200%22%20version%3D%221.1%22%3E%0D%0A%3Cdefs%3E%0D%0A%3ClinearGradient%20id%3D%22e%22%20y2%3D%2252.09%22%20gradientUnits%3D%22userSpaceOnUse%22%20x2%3D%229.886%22%20gradientTransform%3D%22matrix%283.124%200%200%20.9697%20-31.89%20-19.6%29%22%20y1%3D%2237.2%22%20x1%3D%228.916%22%3E%0D%0A%3Cstop%20stop-color%3D%22%239aa29a%22%20offset%3D%220%22%2F%3E%0D%0A%3Cstop%20stop-color%3D%22%23b5beb5%22%20offset%3D%221%22%2F%3E%0D%0A%3C%2FlinearGradient%3E%0D%0A%3CradialGradient%20id%3D%22b%22%20gradientUnits%3D%22userSpaceOnUse%22%20cy%3D%2210.04%22%20cx%3D%2211.9%22%20r%3D%2229.29%22%3E%0D%0A%3Cstop%20stop-color%3D%22%23fffffd%22%20offset%3D%220%22%2F%3E%0D%0A%3Cstop%20stop-color%3D%22%23cbcbc9%22%20offset%3D%221%22%2F%3E%0D%0A%3C%2FradialGradient%3E%0D%0A%3ClinearGradient%20id%3D%22d%22%20y2%3D%2225.88%22%20gradientUnits%3D%22userSpaceOnUse%22%20x2%3D%2222.22%22%20y1%3D%227.789%22%20x1%3D%226.342%22%3E%0D%0A%3Cstop%20stop-color%3D%22%23a0a0a0%22%20offset%3D%220%22%2F%3E%0D%0A%3Cstop%20stop-color%3D%22%23fff%22%20offset%3D%221%22%2F%3E%0D%0A%3C%2FlinearGradient%3E%0D%0A%3CradialGradient%20id%3D%22a%22%20gradientUnits%3D%22userSpaceOnUse%22%20cy%3D%2210.97%22%20cx%3D%2223.38%22%20gradientTransform%3D%22matrix%283.63%200%200%203.742%20-61.49%20-29.19%29%22%20r%3D%223.348%22%3E%0D%0A%3Cstop%20stop-color%3D%22%2363dcff%22%20offset%3D%220%22%2F%3E%0D%0A%3Cstop%20stop-color%3D%22%2300c5fe%22%20stop-opacity%3D%22.1809%22%20offset%3D%221%22%2F%3E%0D%0A%3C%2FradialGradient%3E%0D%0A%3ClinearGradient%20id%3D%22c%22%20y2%3D%225.285%22%20gradientUnits%3D%22userSpaceOnUse%22%20x2%3D%2220.33%22%20y1%3D%224.257%22%20x1%3D%2219.67%22%3E%0D%0A%3Cstop%20stop-color%3D%22%230097c3%22%20offset%3D%220%22%2F%3E%0D%0A%3Cstop%20stop-color%3D%22%23006b9c%22%20stop-opacity%3D%220%22%20offset%3D%221%22%2F%3E%0D%0A%3C%2FlinearGradient%3E%0D%0A%3C%2Fdefs%3E%0D%0A%3Cg%20transform%3D%22translate%28-9%20161%29%22%3E%0D%0A%3Cg%20transform%3D%22matrix%284.578%200%200%204.578%20-.09448%20-164.2%29%22%3E%0D%0A%3Cg%20fill-rule%3D%22evenodd%22%3E%0D%0A%3Cpath%20style%3D%22color%3A%23000000%22%20d%3D%22m18.59%201.404-14.36%2016.69%201.258%201.243%2013.1-17.94z%22%20fill%3D%22url%28%23e%29%22%2F%3E%0D%0A%3Cpath%20d%3D%22m18.47%201.314-12.81%2017.76%201.829%201.615%2010.98-19.37z%22%20fill%3D%22%23fefefe%22%2F%3E%0D%0A%3Ccircle%20stroke-linejoin%3D%22round%22%20stroke-width%3D%22.6985%22%20stroke-linecap%3D%22round%22%20transform%3D%22matrix%281.432%200%200%201.432%20.5695%20-1.655%29%22%20stroke%3D%22%23656565%22%20cy%3D%2216.91%22%20cx%3D%2216.25%22%20r%3D%2214.91%22%20fill%3D%22%236d6d6d%22%2F%3E%0D%0A%3Ccircle%20stroke-linejoin%3D%22round%22%20stroke-width%3D%22.7114%22%20stroke-linecap%3D%22round%22%20transform%3D%22matrix%281.164%200%200%201.164%204.825%202.778%29%22%20stroke%3D%22url%28%23d%29%22%20cy%3D%2216.91%22%20cx%3D%2216.25%22%20r%3D%2214.91%22%20fill%3D%22url%28%23b%29%22%2F%3E%0D%0A%3Cpath%20style%3D%22color%3A%23000000%22%20d%3D%22m16.68%206.639a8.5%208.5%200%200%201%206.65%20-3.264l0.05%208.505z%22%20transform%3D%22matrix%281.77%200%200%201.77%20-17.02%201.611%29%22%20stroke%3D%22url%28%23c%29%22%20stroke-width%3D%22.5650%22%20fill%3D%22url%28%23a%29%22%2F%3E%0D%0A%3Ccircle%20stroke-linejoin%3D%22round%22%20stroke-width%3D%22.4823%22%20stroke-linecap%3D%22round%22%20transform%3D%22matrix%282.073%200%200%202.073%20-7.31%20-13.14%29%22%20stroke%3D%22%23000%22%20cy%3D%2217.28%22%20cx%3D%2215.19%22%20r%3D%221.219%22%20fill%3D%22%23f3f3f3%22%2F%3E%0D%0A%3C%2Fg%3E%0D%0A%3Cpath%20d%3D%22m22.18%2020.72-9.02-7.58%22%20stroke%3D%22%23000%22%20stroke-linecap%3D%22round%22%20fill%3D%22none%22%2F%3E%0D%0A%3Cpath%20d%3D%22m19.41%2029.78%202.96-4.494%22%20stroke%3D%22%23000%22%20stroke-linecap%3D%22round%22%20stroke-width%3D%222%22%20fill%3D%22none%22%2F%3E%0D%0A%3Cg%20fill-rule%3D%22evenodd%22%20fill%3D%22%23b6b9b1%22%3E%0D%0A%3Ccircle%20transform%3D%22matrix%282.75%200%200%202.75%20-22.3%20-12.41%29%22%20cy%3D%227.693%22%20cx%3D%2216.71%22%20r%3D%22.6187%22%2F%3E%0D%0A%3Ccircle%20transform%3D%22matrix%282.75%200%200%202.75%20-22.3%2014.81%29%22%20cy%3D%227.693%22%20cx%3D%2216.71%22%20r%3D%22.6187%22%2F%3E%0D%0A%3Ccircle%20transform%3D%22matrix%282.75%200%200%202.75%20-35.91%201.2%29%22%20cy%3D%227.693%22%20cx%3D%2216.71%22%20r%3D%22.6187%22%2F%3E%0D%0A%3Ccircle%20transform%3D%22matrix%282.75%200%200%202.75%20-8.691%201.2%29%22%20cy%3D%227.693%22%20cx%3D%2216.71%22%20r%3D%22.6187%22%2F%3E%0D%0A%3C%2Fg%3E%0D%0A%3Ccircle%20stroke-linejoin%3D%22round%22%20stroke-width%3D%22.7365%22%20stroke-linecap%3D%22round%22%20transform%3D%22matrix%281.358%200%200%201.358%201.77%20-.4937%29%22%20stroke%3D%22%23a5a5a5%22%20cy%3D%2216.91%22%20cx%3D%2216.25%22%20r%3D%2214.91%22%20fill%3D%22none%22%2F%3E%0D%0A%3C%2Fg%3E%0D%0A%3C%2Fg%3E%0D%0A%3C%2Fsvg%3E";

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
                for (let item of items) {
                    item.fn.call(item.ctx, ...item.args);
                }
            }
        }
        finally {
            this.items.length = 0;
            this.id = 0;
        }
    }
    schedule(ctx, fn, ...args) {
        this.items.push({ ctx, fn, args });
        if (!this.id) {
            this.id = requestAnimationFrame(this.run);
        }
    }
}();


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

const $ = (sel, el) => (el || document).querySelector(sel);
const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));
const noop = function() {};

let active = false, button, file_list, thumb_list;

(function() {
    let sheet = $e("style", {id: "volanail-sheet"}, `
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
  max-height: calc(100% - 1.4em - 4ex);
  max-width: calc(100% - 1.2em);
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
`);
    document.body.appendChild(sheet);
    let cont = $("#upload_container");
    button = $e("label", {
        "for": "volanail-button",
        "id": "volanail-button",
        "class": "button volanail-button"
    });
    button.appendChild($e("span", {
        "class": "icon-vnthumb"
    }));
    button.appendChild($e("span", {
        "class": "on_small_header"
    }/*, Thumbnail"*/));
    cont.insertBefore(button, cont.firstChild);
    file_list = $("#file_list");
    thumb_list = $e("div", {id: "volanail-list"});
    thumb_list.style.display = "none";
    file_list.parentElement.insertBefore(thumb_list, file_list);

    const files_frame = $("#files_frame");
    let oldCount = 0;
    const rule = Array.from(sheet.sheet.cssRules).find(e => e && e.selectorText === ".volanail-thumb" ? e : null);
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
    new MutationObserver(muts => update_columns()).observe(files_frame, {attributes: true});
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
            file.dom.controlElement.firstChild.dispatchEvent(new MouseEvent(e.type, e));
            e.preventDefault();
            e.stopPropagation();
            return false;
        };
        container.appendChild(name);
        const infos = this.infos = $e("div", {
            class: "volanail-infos"
        }, `${format.prettySize(file.size)} - ${file.tags.user || "n/a"}`);
        container.appendChild(infos);
        container.doLoad = this.doLoad.bind(this, file);
        container.onclick = e => {
            file.dom.nameElement.dispatchEvent(new MouseEvent(e.type, e));
            e.stopPropagation();
            e.preventDefault();
            return false;
        };
        file.on("data_checked", (state) => {
            container.classList[state ? "add" : "remove"]("volanail-checked");
        });
        container.classList[
            file.dom.fileElement.classList.contains("file_selected") ? "add" : "remove"
        ]("volanail-checked");
        this.setMedia(this.loading_image.cloneNode(true));
    }
    setMedia(el) {
        apool.schedule(this, this.setMediaInternal, el);
    }
    setMediaInternal(el) {
        $$(".volanail-media", this.container).forEach(e => this.container.removeChild(e));
        this.container.insertBefore(el, this.infos);
    }
    async doLoad(file) {
        try {
            await this.addInfo(await this.getInfo(file, 5000));
        }
        catch (ex) {
            console.error("ex", ex);
            this.setMedia(this.error_image.cloneNode(true));
        }
        finally {
            delete this.container.doLoad;
        }
    }
    getInfo(file, timeout) {
        return new Promise(this.getInfoAsPromised.bind(this, file, timeout));
    }
    getInfoAsPromised(file, timeout, resolve, reject) {
        setTimeout(reject, timeout || 5000);
        dry.exts.connection.getFileInfo(file.id, function(e, info) {
            if (e || !info) {
                reject(e);
                return;
            }
            resolve(info);
        });
    }
    addInfo(info) {
        return new Promise((resolve, reject) => apool.schedule(
            this, this.addInfoAsPromised, info, resolve, reject));
    }
    addInfoForGeneric(info, ip, cls, resolve, reject) {
        const fmt = $e(
            "div",
            null,
            `Type: ${this.file.type.slice(0,1).toUpperCase()}${this.file.type.slice(1)}`);
        if (ip) {
            fmt.appendChild(ip);
        }
        this.infos.insertBefore(fmt, this.infos.firstChild);
        var img = document.createElement("div");
        var icon = document.createElement("span");
        icon.className = cls;
        icon.classList.remove("clickable");
        img.classList.add("volanail-media");
        img.appendChild(icon);
        this.setMedia(img);
        resolve();
    }
    addInfoForThumb(info, ip, name, resolve, reject) {
        if (info.image) {
            const format = info.image.format ? info.image.format + " - " : "";
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
        img.onerror = ex => {
            reject(src);
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
        const src = dry.unsafeWindow.makeAssetUrl(info.id, name, info.thumb.server);
        let video = $e("video", {
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
        setTimeout(() => reject("timeout " + src), 10000);
    }
    addInfoAsPromised(info, resolve, reject) {
        this.icon.firstChild.className = this.icon.icon.firstChild.className;
        delete this.icon.icon;
        let ip;
        if (info.uploader_ip) {
            ip = $e("span", {class: "tag_key_ip"}, info.uploader_ip);
        }
        const {thumb = {}} = info;
        const {type: ttype="", name="thumb"} = thumb;
        if (ttype.startsWith("image/")) {
            this.addInfoForThumb(info, ip, name, resolve, reject);
            return;
        }
        if (ttype.startsWith("video/")) {
            this.addInfoForVideoThumb(info, ip, name, resolve, reject);
            return;
        }
        if (["thumb", "video_thumb"].some(a => this.file.assets.includes(a))) {
            reject(new Error("No thumb"));
        }
        this.addInfoForGeneric(info, ip, this.icon.firstChild.className, resolve, reject);
    }
}
const make_image = src => {
    let img = new Image();
    fetch(src).then(e => e.blob()).then(e => img.src = URL.createObjectURL(e));
    //img.src = src;
    img.classList.add("volanail-media");
    return img;
};
Object.assign(Thumbnail.prototype, {
    error_image: make_image(error),
    loading_image: make_image(loading),
});

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
    let parent = file.dom.vnThumbElement.parentElement;
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
        this.load_one = PromisePool.wrapNew(4, this, this.load_one);
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
            return;
        }
        return t.doLoad().catch(console.error);
    }
    async load() {
        if (this.loading || !this.remaining.length) {
            return;
        }
        this.loading = true;
        try {
            while (this.remaining.length) {
                let jobs = this.remaining.map(this.load_one);
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
    Array.from(dry.exts.filelistManager.filelist.filelist).reverse().forEach(prepare_file);
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
    //button.click();
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
            let off = 0;
            dry.exts.filelist.each((f, idx) => {
                let el = f.dom.vnThumbElement;
                if (!el) {
                    el = f.dom.vnThumbElement = new Thumbnail(f).container;
                }
                const parent = el.parentElement;
                if (f.visible) {
                    let an = thumb_list.childNodes[idx - off];
                    if (!parent || an !== el) {
                        thumb_list.insertBefore(el, an);
                    }
                }
                else if (!f.visible && parent) {
                    parent.removeChild(el);
                }
            });
            loader.refresh();
        }
        catch (ex) {
            console.error("something went wronk", ex);
        }
        return rv;
    });
});
