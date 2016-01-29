// ==UserScript==
// @name        volanail
// @namespace   https://volafile.io
// @include     https://volafile.io/r/*
// @author      RealDolos who stole the idea from BeetRoot
// @version     0.5
// ==/UserScript==

/**
 * TODO
 * - debug rare duplication when uploading files yourself
 * - investigate caching the view (not really required, since browsers do an OK
 *   job of caching the thumbs)
 */
"use strict";

const error = "data:image/png;base64,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";
var thumb_list, file_list, button, progress;
var active = false;

(function() {
  var style = document.createElement("style");
  style.textContent = `
  .thumb_error, .thumb > img, video {
    max-height: 120px;
  }
  video {
    width: 100%;
  }
  .up {
    color: #000;
    background-color:#DCA1F5;
    border: 0px;
    border-radius:5px;
    margin-top: 2px;
    margin-right: 1ex;
  }
  .down{
    color: #fff;
    background-color:#8736AA;
    border: 1px solid #567493;
    border-radius:5px;
    margin-top: 2px;
    margin-right: 1ex;
    box-shadow: inset 0 0 10px #000;
  }
  .thumb {
    border-radius: 10px;
    background: rgba(128,255,255,0.1);
    padding: 0.5em;
    margin: 1em;
    display: inline-block;
    width: 200px;
    max-height: 175px;
    text-decoration: none;
    text-align: center;
  }
  .thumb_video {
    background: rgba(255,128,255,0.1);
  }
  .thumb_name, .thumb_infos {
    font-size: small;
    text-overflow: ellipsis;
    width: 100%;
    white-space: nowrap;
    overflow: hidden; 
    margin-top: 0.4ex;
  }
  .thumb_infos {
    font-size: x-small;
  }
  `;
  document.body.appendChild(style);

  button = document.createElement("button");
  button.textContent = "Thumbnail";
  button.setAttribute("id", "thumb-button");
  button.setAttribute("class", "up");
  document.getElementById("header_row2").appendChild(button);
  progress = document.createElement("span");
  document.getElementById("header_row2").appendChild(progress);

  file_list = document.querySelector("#file_list");
  thumb_list = document.createElement("div");
  thumb_list.setAttribute("id", "thumb_list");
  thumb_list.style.display = "none";
  file_list.parentElement.insertBefore(thumb_list, file_list);
})();

function Processor(queue, options) {
  this.queue = queue;
  this.options = options || {};
}
Processor.prototype = {
  play: function() {
    this.play();
  },
  stop: function() {
    this.pause();
    this.currentTime = 0;
  },
  timeouter: function(node) {
    return setTimeout(function() {
      var evt = new Event("error");
      node.dispatchEvent(evt);
    }, 3000);
  },
  handleError: function(e) {
    if (e.type != "error") {
      return;
    }
    var node = e.target;
    var img = new Image();
    img.src = error;
    img.classList.add("thumb_error");
    node.parentElement.insertBefore(img, node);
    node.parentElement.removeChild(node);
  },

  prepareContainer: function(item) {
    var container = document.createElement("a");
    container.setAttribute("href", item.url);
    container.setAttribute("target","_blank");
    container.classList.add("thumb");
    container.classList.add(`thumb_${item.type}`);

    var name = document.createElement("div");
    name.classList.add("thumb_name");
    name.textContent = item.name;
    name.setAttribute("title", item.name);
    container.appendChild(name);  
    var infos = document.createElement("div");
    infos.classList.add("thumb_infos");
    infos.textContent = `${item.size} - ${item.uploader}`;
    container.appendChild(infos);

    return container;
  },
  insert_container: function(container) {
    if (!active) {
      return;
    }
    if (this.options.front) {
      thumb_list.insertBefore(container, thumb_list.firstChild);
    }
    else {
      thumb_list.appendChild(container);
    }
  },
  redirect: function(e) {
    if (e.button !== 0 || e.altkey || e.shiftKey || e.ctrlKey || e.metaKey) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    this.click();
  },
  processVideo: function(item) {
    let container;
    let timeout;
    let next = (e) => {
      let node = e.target;
      this.handleError(e);
      node.removeEventListener("loadeddata", next);
      node.removeEventListener("error", next);
      node.removeEventListener("stalled", next);
      if (timeout) {
        clearTimeout(timeout);
        timeout = 0;
      }
      this.insert_container(container);
      this.process();
    };

    container = this.prepareContainer(item);
    let preview = document.createElement("video");
    preview.src = "https://volafile.io/asset/" + item.url.split("/")[4] + "/video_thumb";
    preview.addEventListener("loadeddata", next);
    preview.addEventListener("stalled", next);
    preview.addEventListener("error", next);
    preview.addEventListener("mouseover", this.play.bind(preview));
    preview.addEventListener("mouseout", this.stop.bind(preview));
    preview.addEventListener("click", this.redirect.bind(item.origin));
    preview.loop = true;
    preview.muted = true;
    timeout = this.timeouter(preview);

    container.insertBefore(preview, container.firstChild);
  },

  processImage: function(item) {
    let container;
    let timeout;
    let next = (e) => {
      let node = e.target;
      this.handleError(e);
      node.removeEventListener("load", next);
      node.removeEventListener("loadend", next);
      node.removeEventListener("error", next);
      if (timeout) {
        clearTimeout(timeout);
        timeout = 0;
      }
      this.insert_container(container);
      this.process();
    };

    container = this.prepareContainer(item);
    let preview = new Image();
    preview.src = "https://volafile.io/asset/" + item.url.split("/")[4] + "/thumb";
    preview.addEventListener("load", next);
    preview.addEventListener("loadend", next);
    preview.addEventListener("error", next);
    preview.addEventListener("click", this.redirect.bind(item.origin));
    timeout = this.timeouter(preview);

    container.insertBefore(preview, container.firstChild);
  },

  process: function() {
    if (!active) {
      return;
    }
    let item = this.queue.pop();
    if (!item) {
      progress.textContent = "";
      return;
    }
    progress.textContent = `${this.queue.length + 1} items to go...`;
    if (item.type == "video") {
      this.processVideo(item);
    }
    else {
      this.processImage(item);    
    }
  }
};

function thumbify(el, front) {
  active = true;
  file_list.style.display = "none";
  thumb_list.style.display = "block";
  let queue = Array.from(el.querySelectorAll("#file_list .file_icon")).map(function(e) {
    let type;
    if (e.classList.contains("icon-film")) {
      type = "video";
    }
    else if (e.classList.contains("icon-image")) {
      type = "image";
    }
    else {
      return null;
    }
    e = e.parentElement.nextSibling;
    return {
      origin: e,
      url: e.href,
      name: e.textContent,
      type: type,
      uploader: e.nextSibling.querySelector(".tag_key_user").textContent,
      size: e.parentElement.previousSibling.firstChild.textContent.trim()
    };
  }).filter(function(e) { return !!e; });
  queue = new Processor(queue.reverse(), {front: front});
  queue.process();
}

function restore() {
  active = false;
  progress.textContent = "";
  file_list.style.display = "block";
  thumb_list.style.display = "none";
  thumb_list.innerHTML = "";
}

button.addEventListener("click", function() {
  try {
    if (button.classList.contains("up")) {
      button.classList.remove("up");
      button.classList.add("down");
      thumb_list.innerHTML = "";
      thumbify(document);
    }
    else {
      button.classList.add("up");
      button.classList.remove("down");
      restore();
    }
  }
  catch (ex) {
    console.error("oops", ex);
    throw ex;
  }
  finally {
    button.blur();
  }
});

(function install_files() {
  let obs = new MutationObserver(function(mutations) {
    if (!active) {
      return;
    }
    var adds = [];
    var rems = [];
    var s = new Set();
    for (let m of Array.from(mutations)) {
      for (let a of Array.from(m.addedNodes)) {
        let n = a.querySelector("div:not(.file_uploading) a.file_name");
        if (n && !s.has(n)) {
          adds.push(a);
          s.add(n);
        }
      }
      for (let a of Array.from(m.removedNodes)) {
        let n = a.querySelector("div:not(.file_uploading) a.file_name");
        if (n && !s.has(n)) {
          rems.push(n);
          s.add(n);
        }
      }
    }
    if (rems.length) {
      let nodes = new Map(Array.from(thumb_list.children).map(x => [x.href, x])); 
      for (let r of rems) {
          let o = nodes.get(r.href);
          if (!o) {
              continue; // perfectly valid
          }
          o.parentElement.removeChild(o);
      }
    }
    if (!adds.length) {
      return;
    }
    setTimeout(function() {
      if (!active) {
        return;
      }
      for (let a of adds.reverse()) {
        thumbify(a, true);
      }
    }, 2000); // wait a bit to give the server a chance to thumb
  });
  obs.observe(file_list, {childList: true, subtree: true});
})();
