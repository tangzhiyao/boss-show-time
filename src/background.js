import { BACKGROUND, CONTENT_SCRIPT, OFFSCREEN } from "./api/bridgeCommon";
import { debugLog, infoLog } from "./log";

debugLog("background ready");
debugLog("keepAlive start");
//see https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension
const keepAlive = () => setInterval(chrome.runtime.getPlatformInfo, 20e3);
chrome.runtime.onStartup.addListener(keepAlive);
keepAlive();

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

  chrome.runtime.onMessage.addListener(async function (
    message,
    sender,
    sendResponse
  ) {
    if (message) {
      if (message.from == CONTENT_SCRIPT && message.to == BACKGROUND) {
        //get the tab id from content script page,not the extension page(eg: sidepanel)
        if (sender.tab) {
          message.tabId = sender.tab.id;
        }
        debugLog(
          "2.[background][receive][" +
            message.from +
            " -> " +
            message.to +
            "] message [action=" +
            message.action +
            ",callbackId=" +
            message.callbackId +
            ",error=" +
            message.error +
            "]"
        );
        message.from = BACKGROUND;
        message.to = OFFSCREEN;
        debugLog(
          "3.[background][send][" +
            message.from +
            " -> " +
            message.to +
            "] message [action=" +
            message.action +
            ",callbackId=" +
            message.callbackId +
            ",error=" +
            message.error +
            "]"
        );
        chrome.runtime.sendMessage(message);
      } else if (message.from == OFFSCREEN && message.to == BACKGROUND) {
        debugLog(
          "10.[background][receive][" +
            message.from +
            " -> " +
            message.to +
            "] message [action=" +
            message.action +
            ",callbackId=" +
            message.callbackId +
            ",error=" +
            message.error +
            "]"
        );
        message.from = BACKGROUND;
        message.to = CONTENT_SCRIPT;
        debugLog(
          "11.[background][send][" +
            message.from +
            " -> " +
            message.to +
            "] message [action=" +
            message.action +
            ",callbackId=" +
            message.callbackId +
            ",error=" +
            message.error +
            "]"
        );
        if (message.tabId) {
          //content script invoke
          chrome.tabs.sendMessage(message.tabId, message);
        } else {
          //other invoke
          //Note that extensions cannot send messages to content scripts using this method. To send messages to content scripts, use tabs.sendMessage.
          chrome.runtime.sendMessage(message);
        }
      }
    }
  });
}

setupOffscreenDocument("offscreen.html");
