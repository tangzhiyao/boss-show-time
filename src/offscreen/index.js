import { debugLog } from "../log";
debugLog("offscreen ready");

const worker = new Worker(new URL("./worker.js", import.meta.url), {
  type: "module",
});

worker.onmessage = function (event) {
  let message = event.data.data;
  debugLog(
    "[offscreen][receive][worker -> offscreen] message [action=" +
      message.action +
      ",callbackId=" +
      message.callbackId +
      ",error=" +
      message.error +
      "]"
  );
  sendMessageToBackground("db", message);
  debugLog(
    "[offscreen][send][offscreen -> background] message [action=" +
      message.action +
      ",callbackId=" +
      message.callbackId +
      ",error=" +
      message.error +
      "]"
  );
};

chrome.runtime.onMessage.addListener((event) => {
  let message = event.data;
  debugLog(
    "[offscreen][receive][background -> offscreen] message [action=" +
      message.action +
      ",callbackId=" +
      message.callbackId +
      ",error=" +
      message.error +
      "]"
  );
  worker.postMessage(message);
  debugLog(
    "[offscreen][send][offscreen -> worker] message [action=" +
      message.action +
      ",callbackId=" +
      message.callbackId +
      ",error=" +
      message.error +
      "]"
  );
});

function sendMessageToBackground(type, data) {
  chrome.runtime.sendMessage({
    type,
    target: "background",
    data,
  });
}
