import { debugLog } from "./log";

debugLog("background ready");
//sidepanel
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

let creating;
async function setupOffscreenDocument(path) {
  // Check all windows controlled by the service worker to see if one
  // of them is the offscreen document with the given path
  if (await chrome.offscreen.hasDocument?.()) return;

  // create offscreen document
  if (creating) {
    await creating;
  } else {
    creating = chrome.offscreen.createDocument({
      url: chrome.runtime.getURL(path),
      reasons: [
        chrome.offscreen.Reason.WORKERS || chrome.offscreen.Reason.BLOBS,
      ],
      justification: "To run web worker to run sqlite",
    });
    await creating;
    creating = null;
  }

  var portInstance;
  chrome.runtime.onConnect.addListener(function (port) {
    portInstance = port;
    port.onMessage.addListener(function (message) {
      debugLog(
        "[background][receive][content script -> background] message [action=" +
          message.action +
          ",callbackId=" +
          message.callbackId +
          ",error=" +
          message.error +
          "]"
      );
      sendMessageToOffscreen("bridge", message);
      debugLog(
        "[background][send][background -> offscreen] message [action=" +
          message.action +
          ",callbackId=" +
          message.callbackId +
          ",error=" +
          message.error +
          "]"
      );
    });
  });

  chrome.runtime.onMessage.addListener((event) => {
    var message = event.data;
    debugLog(
      "[background][receive][offscreen -> background] message [action=" +
        message.action +
        ",callbackId=" +
        message.callbackId +
        ",error=" +
        message.error +
        "]"
    );
    sendMessageToContentScript(message);
    debugLog(
      "[background][send][background -> content script] message [action=" +
        message.action +
        ",callbackId=" +
        message.callbackId +
        ",error=" +
        message.error +
        "]"
    );
  });

  function sendMessageToContentScript(message) {
    portInstance.postMessage(message);
  }

  function sendMessageToOffscreen(type, data) {
    chrome.runtime.sendMessage({
      type,
      target: "offscreen",
      data,
    });
  }
}

setupOffscreenDocument("offscreen.html");
