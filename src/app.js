import { getBossData } from './plantforms/boss/index.js';
import { getZhiLianData } from './plantforms/zhilian/index.js';
import { getJob51Data } from './plantforms/job51/index.js'
import zhilianFirstOpen from './plantforms/zhilian/firstOpen.js';

import './app.css'; // 为了能够走打包逻辑，如果不想在这写，那么直接放在 webpack 里也行
import { createLink, createScript } from './utils.js';
import $ from 'jquery';
(function() {
    // 这里的 window 和页面的 window 不是同一个
    window.$ = window.jQuery = $;
    const head = document.head;
    const proxyScript = createScript(chrome.runtime.getURL("./proxyAjax.js"))
    const link = createLink(chrome.runtime.getURL("./app.css"));
    head.appendChild(link);

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
        if(responseURL){
            if(responseURL.indexOf('/search/joblist.json') !== -1) {
                getBossData(data?.response);
            }

            // 智联招聘接口
            if(responseURL.indexOf('/search/positions') !== -1) {
                getZhiLianData(data?.response, true);
            }
            
            // 前程无忧接口
            if(responseURL.indexOf('/api/job/search-pc') !== -1) {
                getJob51Data(data?.response, true);
            }
        }
    })

    window.addEventListener('proxyScriptLoaded', function(e) {
        // 不通过直接注入脚本的方式处理 ssr 页面，否则一些引入的模块需要重新打包
        if(location.host === 'sou.zhaopin.com') {
            const data = e?.detail?.zhipin?.initialState
            zhilianFirstOpen(data || {});
        }
        
    })




})();
