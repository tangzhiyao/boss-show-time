import { invoke } from './bridge';

export async function initBridge() {

    await invoke('init', {});
    //keep chrome extension background alive
    //ping each 30s
    setInterval(function () {
      invoke('ping', {});
    }, 30000);
  
}

/**
 * 
 * @returns base64 database file
 */
export async function dbExport(){
  let result = await invoke(dbExport.name, {});
  return result.data;
}

/**
 * @param {string} base64 zip file content
 * @returns bytesToWrite
 */
export async function dbImport(param){
  let result = await invoke(dbImport.name, param);
  return result.data;
}