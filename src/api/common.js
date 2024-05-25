import {invoke} from "./bridge"

export async function initBridge(){
    await invoke("init",{});
    //keep chrome extension background alive 
    //ping each 5s
    setInterval(function(){
        invoke("ping",{});
    },5000);
}