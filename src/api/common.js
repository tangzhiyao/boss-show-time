import { invoke, init } from "./bridge";

export async function initBridge() {
  init();
  await invoke("init", {});
}

/**
 *
 * @returns base64 database file
 */
export async function dbExport() {
  let result = await invoke("dbExport", {});
  return result.data;
}

/**
 * @param {string} base64 zip file content
 * @returns bytesToWrite
 */
export async function dbImport(param) {
  let result = await invoke("dbImport", param);
  return result.data;
}
