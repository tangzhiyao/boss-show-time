import {debugLog} from "./log";

debugLog('background ready');

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
  chrome.runtime.onConnect.addListener(function(port) {
    portInstance = port;
    port.onMessage.addListener(function(message) {
      debugLog("[background][receive][content script -> background] message = "+JSON.stringify(message));
      sendMessageToOffscreen("bridge",message);
      debugLog("[background][send][background -> offscreen] message = "+JSON.stringify(message));
    });
  });

  chrome.runtime.onMessage.addListener((event)=>{
    var message = event.data;
    debugLog("[background][receive][offscreen -> background] message = "+JSON.stringify(message));
    sendMessageToContentScript(message);
    debugLog("[background][send][background -> content script] message = "+JSON.stringify(message));
  });

  function sendMessageToContentScript(message){
    portInstance.postMessage(message);
  }

  function sendMessageToOffscreen(type,data){
    chrome.runtime.sendMessage({
      type,
      target: 'offscreen',
      data
    });
  };
}

setupOffscreenDocument("offscreen.html");




