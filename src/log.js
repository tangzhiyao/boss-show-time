const LEVEL_TRACE = 0;
const LEVEL_DEBUG = 1;
const LEVEL_INFO = 2;
const logLevel = LEVEL_INFO;

export function infoLog(message){
    if(logLevel <= LEVEL_INFO){
        console.log(message)
    }
}

export function debugLog(message){
    if(logLevel == LEVEL_TRACE){
        console.trace(message);
    }else{
        if(logLevel == LEVEL_DEBUG){
            console.warn(message);
        }
    }
}