import { getRandomInt } from "../utils";
import { debugLog } from "../log";

const callbackPromiseHookMap = new Map();
var seq = 0;

export function invoke(action,param){
    var promise = new Promise((resolve,reject)=>{
        var callbackId = genCallbackId();
        addCallbackPromiseHook(callbackId,{resolve,reject});
        var message = {action,callbackId,param};
        var portInstance = chrome.runtime.connect({name: "bridge"});
        portInstance.onMessage.addListener(function(message) {
            //message = {action,callbackId,param,data,error}
            var promiseHook = getAndRemovePromiseHook(message.callbackId);
            if(message.error){
                promiseHook.reject(message);
            }else{
                promiseHook.resolve(message);
            }
            debugLog("[content script][receive][background -> content script] message = "+JSON.stringify(message));
            portInstance.disconnect();
        });
        portInstance.postMessage(message);
        debugLog("[content script][send][content script -> background] message = "+JSON.stringify(message));
    });
    return promise;
}

function addCallbackPromiseHook(callbackId,promiseHook){
    callbackPromiseHookMap.set(callbackId,promiseHook);
}

function getAndRemovePromiseHook(callbackId){
    var promiseHook = callbackPromiseHookMap.get(callbackId);
    callbackPromiseHookMap.delete(callbackId);
    return promiseHook;
}

function genCallbackId(){
    return new Date().getTime()+seq+getRandomInt(1000);
}

export class Message{
    action;
    callbackId;
    param;
    error;
    data;
}