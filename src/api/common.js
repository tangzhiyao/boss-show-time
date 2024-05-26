import { invoke } from './bridge';

export async function initBridge() {

    await invoke('init', {});
    //keep chrome extension background alive
    //ping each 30s
    setInterval(function () {
      invoke('ping', {});
    }, 30000);
  
}
