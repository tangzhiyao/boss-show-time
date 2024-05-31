import { BACKGROUND, OFFSCREEN, WEB_WORKER } from "../api/bridgeCommon";
import { debugLog } from "../log";
debugLog("offscreen ready");

const worker = new Worker(new URL("./worker.js", import.meta.url), {
  type: "module",
});

worker.onmessage = function (event) {
  let message = event.data.data;
  if (message) {
    if (message.from == WEB_WORKER && message.to == OFFSCREEN) {
      debugLog(
        "8.[offscreen][receive][" +
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
      message.from = OFFSCREEN;
      message.to = BACKGROUND;
      debugLog(
        "9.[offscreen][send][" +
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
    }
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message) {
    if (message.from == BACKGROUND && message.to == OFFSCREEN) {
      debugLog(
        "4.[offscreen][receive][" +
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
      message.from = OFFSCREEN;
      message.to = WEB_WORKER;
      debugLog(
        "5.[offscreen][send][" +
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
      worker.postMessage(message);
    }
  }
});
