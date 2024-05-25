import {debugLog} from "../log";
debugLog("offscreen ready");

const worker = new Worker(
  new URL("./worker.js", import.meta.url),
  { type: "module" },
);

worker.onmessage = function (event) {
  var message = event.data.data;
  debugLog("[offscreen][receive][worker -> offscreen] message = "+JSON.stringify(message));
  sendMessageToBackground("db",message);
  debugLog("[offscreen][send][offscreen -> background] message = "+JSON.stringify(message));
};

chrome.runtime.onMessage.addListener((event)=>{
  var message = event.data;
  debugLog("[offscreen][receive][background -> offscreen] message = "+JSON.stringify(message));
  worker.postMessage(message);
  debugLog("[offscreen][send][offscreen -> worker] message = "+JSON.stringify(message));
});

function sendMessageToBackground(type,data){
  chrome.runtime.sendMessage({
      type,
      target: 'background',
      data
  });
};
