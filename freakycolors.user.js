// ==UserScript==
// @name         Freaky Names
// @namespace    http://jew.dance/
// @version      0.12
// @description  ...and shit
// @author       RealDolos
// @match        https://volafile.org/r/*
// @grant        none
// @require      https://cdn.jsdelivr.net/gh/volafiled/volascripts@db222e0a836c6da9d5593c7fc93941c0e7a9d2a1/dry.js
// @run-at       document-start
// ==/UserScript==

/* globals dry */

(function() {
    "use strict";

    const colors = {
        "getddosed": "blue",
        "^thejidf$|^jewmobile$|^mrshlomo$": {color: "pink", content:'✡'},
        "^starsheep": "yellow",
        "^whitepride$": "#7aa2ff",
        "31337h4x0r|realdolos|vagfacetrm|robocuck|(?:Red|Dong|Immor|lg188)dolos": "white",
        "^kreg$": "hotpink",
        "^robocop$": {color: "dodgerblue", content: '🤖'},
        "^lain$": "gold",
        "^red$": {color: "indianred", content: '💰'},
        "^thersanderia$": { color: "#e3dac9", content: '💀'},
        "^bain$": {color: "#00A693", content:'☪'},
        "^counselor$|^apha$|^couscous|^vaat$": {color: "rgb(210, 148, 44)", content: '💩'},
        "^lmmortal$": {color: "rgb(255, 108, 135)", content: '👸'},
        "^mercwmouth$|^deadpool$": { color: "lightbrown", content: "👳"},
        "^modchatbot": {content: '🗡️', color: "yellowgreen"},
        "^liquid$|^news$": {content: '🐑'},
        "^cyberia$": {content: 'λ'},
        "^someguy1992$": {color: "#EDDB17"},
        "^dad": {color: "lightskyblue"},
    };
    const r_colors = [];
    for (let name in colors) {
        r_colors.push([new RegExp(name, "i"), colors[name]]);
    }

    console.log("running", GM_info.script.name, GM_info.script.version, dry.version);
    dry.once("dom", () => {
        new class extends dry.MessageFilter {
            addMessage(orig, m) {
                for (let r of r_colors) {
                    if (m.options.user && r[0].test(m.nick)) {
                        let color = r[1];
                        let content = null;
                        if (typeof color !== "string") {
                            color = r[1].color;
                            content = r[1].content;
                        }
                        if (content) {
                            let star = m.elem.querySelector(".icon-star");
                            if (star) {
                                star.textContent = content.trim();
                                star.classList.remove("icon-star");
                                star.classList.add("custom-pro");
                            }
                        }
                        if (color) {
                            for (let n = m.nick_elem; n; n = n.previousSibling) {
                                n.style.color = color;
                            }
                        }
                        return;
                    }
                }
            }
        }();

        let css = document.createElement("style");
        css.textContent = `
.custom-pro {
  font-size: 80%;
  font-weight: bolder;
  margin-left: -.35em;
  margin-right: .15em;
  padding: 0;
  min-width: 18px;
  display: inline-block;
  text-align: center;
}
`;
        document.body.appendChild(css);
    });
})();
