import { getBossData } from './plantforms/boss/index.js';
import { getZhiLianData } from './plantforms/zhilian/index.js';

import './app.css'; // 为了能够走打包逻辑，如果不想在这写，那么直接放在 webpack 里也行
import { createLink, createScript } from './utils.js';

(function() {

    const head = document.head;
    const proxyScript = createScript(chrome.runtime.getURL("./proxyAjax.js"))
    const zhilianFirstScript = createScript(chrome.runtime.getURL("./zhilianFirstOpen.js"))
    const link = createLink(chrome.runtime.getURL("./app.css"));
    
    
    head.appendChild(link);
    head.appendChild(zhilianFirstScript);
    if(head.firstChild) {
        // proxyScript 要保证在第一个插入
        head.insertBefore(proxyScript, head.firstChild);
    } else {
        head.appendChild(proxyScript);
    }

    window.addEventListener('ajaxGetData', function(e) {
        const data = e?.detail;
        if(!data) return;
        const responseURL = data?.responseURL;
        // boss 直聘接口
        if(responseURL.indexOf('/search/joblist.json') !== -1) {
            getBossData(data?.response);
        }

        // 智联招聘接口
        if(responseURL.indexOf('/search/positions') !== -1) {
            getZhiLianData(data?.response, true);
        }
    })




})();
