import { getBossData } from './utils/boss.js';
import './app.css'; // 为了能够走打包逻辑，如果不想在这写，那么直接放在 webpack 里也行

(function() {

    const script = document.createElement('script');
    script.setAttribute('src', chrome.runtime.getURL("./proxyAjax.js"));
    const head = document.head;

    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('type', 'text/css');

    // 注意这里需要配置 manifest 的 web_accessible_resources 字段，否则无法加载
    link.setAttribute('href', chrome.runtime.getURL("./app.css"));
    link.setAttribute('crossorigin', 'anonymous');

    head.appendChild(link);
    if(head.firstChild) {
        head.insertBefore(script, head.firstChild);
    } else {
        head.appendChild(script);
    }
    
    window.addEventListener('ajaxGetData', function(e) {
        const data = e?.detail;
        if(!data) return;
        const responseURL = data?.responseURL;
        if(responseURL.indexOf('/joblist.json') !== -1) {
            getBossData(data?.response);
        }
    })

})();
