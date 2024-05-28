import { getRandomInt } from "../utils";
import { debugLog } from "../log";

const callbackPromiseHookMap = new Map();
var seq = 0;

/**
 *
 * @param {string} action 通过传入src/offscreen/worker.js里的WorkerBridge的方法名，实现方法的调用
 * @param {*} param 所需要传递的调用参数，在被调用方法的param参数中有体现
 * @returns
 */
export function invoke(action, param) {
  var promise = new Promise((resolve, reject) => {
    var callbackId = genCallbackId();
    addCallbackPromiseHook(callbackId, { resolve, reject });
    var message = { action, callbackId, param };
    var portInstance = chrome.runtime.connect({ name: "bridge" });
    portInstance.onMessage.addListener(function (message) {
      //message = {action,callbackId,param,data,error}
      var promiseHook = getAndRemovePromiseHook(message.callbackId);
      if (message.error) {
        message.message = message.error;
        promiseHook.reject(message);
      } else {
        promiseHook.resolve(message);
      }
      debugLog(
        "[content script][receive][background -> content script] message [action=" +
          message.action +
          ",callbackId=" +
          message.callbackId +
          ",error=" +
          message.error +
          "]"
      );
      portInstance.disconnect();
    });
    portInstance.postMessage(message);
    debugLog(
      "[content script][send][content script -> background] message [action=" +
        message.action +
        ",callbackId=" +
        message.callbackId +
        ",error=" +
        message.error +
        "]"
    );
  });
  return promise;
}

function addCallbackPromiseHook(callbackId, promiseHook) {
  callbackPromiseHookMap.set(callbackId, promiseHook);
}

function getAndRemovePromiseHook(callbackId) {
  var promiseHook = callbackPromiseHookMap.get(callbackId);
  callbackPromiseHookMap.delete(callbackId);
  return promiseHook;
}

function genCallbackId() {
  return new Date().getTime() + seq + getRandomInt(1000);
}

export class Message {
  action;
  callbackId;
  param;
  error;
  data;
}
