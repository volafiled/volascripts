// ==UserScript==
// @name         gallery is not for chat
// @version      1
// @description  It really is not!
// @namespace    https://volafile.org
// @icon         https://volafile.org/favicon.ico
// @author       topkuk productions
// @match        https://volafile.org/r/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    const style = document.createElement("style");
    style.textContent = `
.blur {
    -webkit-filter: none;
    -moz-filter:  none;
    -o-filter: none;
    -ms-filter: none;
    filter: none;
}
.blur #call_to_action_container,
.blur #files_scroller,
.blur #radio_container {
    -webkit-filter: blur(5px);
    -moz-filter: blur(5px);
    -o-filter: blur(5px);
    -ms-filter: blur(5px);
    filter: progid:DXImageTransform.Microsoft.Blur(PixelRadius='5');
}
`;
    document.body.appendChild(style);

    const frame = document.querySelector("#files_frame");
    frame.appendChild(document.querySelector("#gallery_frame"));
})();
