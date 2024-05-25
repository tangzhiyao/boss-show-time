import { ChangeLog } from "./changelog";

var changelogListInstance = [];

/**
 * 
 * @param {ChangeLog[]} changelogList 
 */
export function initChangeLog(changelogList){
    changelogListInstance = changelogList;
}

export function getChangeLogList(){
    return changelogListInstance;
}