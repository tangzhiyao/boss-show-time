;(function () {
    if ( typeof window.CustomEvent === "function" ) return false;
     
    function CustomEvent ( event, params ) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      let evt = document.createEvent( 'CustomEvent' );
      evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
      return evt;
    }   
    CustomEvent.prototype = window.Event.prototype;   
    window.CustomEvent = CustomEvent;
})();
  
  ;(function () {
    function ajaxEventTrigger(event) {
      let ajaxEvent = new CustomEvent(event, { detail: this });
      window.dispatchEvent(ajaxEvent);
    }
    
    let oldXHR = window.XMLHttpRequest;
    if(!oldXHR) return console.error('不支持 XMLHttpRequest！ 请更换最新的 chrome 浏览器')
     
    function newXHR() {
      let realXHR = new oldXHR();
  
      realXHR.addEventListener('abort', function () { ajaxEventTrigger.call(this, 'ajaxAbort'); }, false);
      realXHR.addEventListener('error', function () { ajaxEventTrigger.call(this, 'ajaxError'); }, false);
      realXHR.addEventListener('load', function () { ajaxEventTrigger.call(this, 'ajaxLoad'); }, false);
      realXHR.addEventListener('loadstart', function () { ajaxEventTrigger.call(this, 'ajaxLoadStart'); }, false);
      realXHR.addEventListener('progress', function () { ajaxEventTrigger.call(this, 'ajaxProgress'); }, false);
      realXHR.addEventListener('timeout', function () { ajaxEventTrigger.call(this, 'ajaxTimeout'); }, false);
      realXHR.addEventListener('loadend', function () { ajaxEventTrigger.call(this, 'ajaxLoadEnd'); }, false);
      realXHR.addEventListener('readystatechange', function() { ajaxEventTrigger.call(this, 'ajaxReadyStateChange'); }, false);
  
      let send = realXHR.send;
      realXHR.send = function(...arg){
        send.apply(realXHR,arg);
        realXHR.body = arg[0];
        ajaxEventTrigger.call(realXHR, 'ajaxSend');
      }
  
      let open = realXHR.open;
      realXHR.open = function(...arg){
        open.apply(realXHR,arg)
        realXHR.method = arg[0];
        realXHR.orignUrl = arg[1];
        realXHR.async = arg[2];
        ajaxEventTrigger.call(realXHR, 'ajaxOpen');
      }
  
      let setRequestHeader = realXHR.setRequestHeader;
      realXHR.requestHeader = {};
      realXHR.setRequestHeader = function(name, value){
          realXHR.requestHeader[name] = value;
          setRequestHeader.call(realXHR,name,value)
      }
      return realXHR;
    }
    newXHR.prototype = oldXHR.prototype;
    window.XMLHttpRequest = newXHR;
  })();

  // 监听页面的ajax
  window.addEventListener("ajaxReadyStateChange",function(e){
    let xhr = e.detail;
    const data = {
        response: xhr?.response,
        responseType: xhr?.responseType,
        responseURL: xhr?.responseURL?xhr.responseURL:xhr?.orignUrl,
        status: xhr?.status,
        statusText: xhr?.statusText,
        readyState: xhr?.readyState,
        withCredentials: xhr?.withCredentials,
    };
    if(xhr?.readyState == 4 && xhr?.status == 200){
         // 直接给 xhr，app.js 收不到。
        let event = new CustomEvent('ajaxGetData', { detail: data });
        window.dispatchEvent(event);
    }
  });

  ;(function() {
    // 由于注入脚本的时候 DOMContentLoaded 已经触发，监听不到
    // proxy 脚本已加载，发送事件
    let event = new CustomEvent('proxyScriptLoaded', { detail: {
        zhipin: {
           initialState: window.__INITIAL_STATE__
        },
        lagou: {
            initialState: window.__NEXT_DATA__
        }
    } });
    window.dispatchEvent(event);
  })();
