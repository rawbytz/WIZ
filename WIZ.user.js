// ==UserScript==
// @name         WorkFlowy Images on Zoom (WIZ)
// @namespace    https://rawbytz.wordpress.com
// @version      0.2.7
// @description  Display images in WorkFlowy only when zooming.
// @author       rawbytz
// @match        https://workflowy.com/*
// @match        https://*.workflowy.com/*
// @updateUrl    https://github.com/rawbytz/WIZ/raw/master/WIZ.user.js
// @downloadUrl  https://github.com/rawbytz/WIZ/raw/master/WIZ.user.js
// @grant        none
// ==/UserScript==

(function () {
  'use strict';
  function addStyle() {
    const head = document.getElementsByTagName('head')[0],
      css = '.selected >.notes >.content{display:none !important}',
      style = document.createElement('style');
    style.type = "text/css";
    style.id = "hideNote";
    style.disabled = true;
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
  }
  function getImageLink(url) {
    const link = url
      .replace(/www\.dropbox/, 'dl.dropbox')
      .replace(/(https?:\/\/)(imgur\.com\/)(gallery\/)?([a-zA-Z0-9]{7})/, '$1i.$2$4.jpg');
    const rgx = /\.jpg|\.jpeg|\.png|\.bmp|\.gif|lh3\.googleusercontent\.com/;
    return link.match(rgx) && !link.startsWith("handyflowy:") ? link : null;
  }
  function toglNote() {
    const item = WF.currentItem();
    const def = hideNote.disabled;
    hideNote.disabled = !hideNote.disabled;
    navigator.userAgent.includes("Mobile") ? blurFocusedContent() : def ? WF.editItemName(item) : WF.editItemNote(item);
  }
  function addImage(url) {
    hideNote.disabled = false;
    const imgStyle = `max-width:100%;max-height:${Math.round(window.innerHeight * 0.7)}px;font-style:italic;`,
     parentNote = document.getElementsByClassName("notes")[0],
     img = document.createElement('img');
    img.src = url;
    img.style = imgStyle;
    img.id = "wizImg";
    img.alt = "Image not found. Click here to view link.";
    img.onclick = toglNote;
    parentNote.insertBefore(img, parentNote.childNodes[0])
  }
  function wizMe() {
    // Remove last image
    const wizImg = document.getElementById("wizImg");
    if (wizImg) wizImg.remove();

    // Disable style, show notes
    const hideNote = document.getElementById("hideNote");
    hideNote.disabled = true;

    // Check parent note for link, if link, check for image, exit if none. iLink returns "undefined" with no note or link
    const current = WF.currentItem();
    const iLink = current.getElement().getElementsByClassName("notes")[0].getElementsByClassName("contentLink")[0];
    if (!iLink || !getImageLink(iLink.href)) return;

    // Add image to parent note
    addImage(getImageLink(iLink.href));
  }

  //Load with New Tab
  function waitForActivePage() {
    if (document.getElementsByClassName("page active").length > 0) {
      addStyle();
      wizMe();
      return
    }
    setTimeout(waitForActivePage, 300);
  }
  waitForActivePage();

  // Run on location change
  // window.WFEventListener = event => { if (event === "locationChanged") wizMe() };

  //Fix for duplicate global listener
  const previousListener = window.WFEventListener;
  window.WFEventListener = event => {
    previousListener && previousListener(event);
    if (event === "locationChanged") wizMe()
  };
})();