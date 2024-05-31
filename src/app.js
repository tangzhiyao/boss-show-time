import { getBossData } from './plantforms/boss/index.js';
import { getZhiLianData } from './plantforms/zhilian/index.js';
import { getJob51Data } from './plantforms/job51/index.js'
import { getLaGouData } from './plantforms/lagou/index.js'
import zhilianFirstOpen from './plantforms/zhilian/firstOpen.js';
import lagouFirstOpen from './plantforms/lagou/firstOpen.js';

import './app.css'; // 为了能够走打包逻辑，如果不想在这写，那么直接放在 webpack 里也行
import { createLink, createScript } from './utils.js';
import $ from 'jquery';
import {initBridge} from "./api/common.js";

(async function() {
    // 这里的 window 和页面的 window 不是同一个
    window.$ = window.jQuery = $;
    const head = document.head;
    // eslint-disable-next-line no-undef
    const proxyScript = createScript(chrome.runtime.getURL("./proxyAjax.js"))
    // eslint-disable-next-line no-undef
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

            // 拉勾网接口
            if (responseURL.indexOf("/jobs/v2/positionAjax.json") !== -1) {
                /**
                 * Question: 接口响应是加密的，为什么这里拿到的是解密后的？
                 * 拉勾的加密是自己重写了 XMLHttpRequest，在 send 前进行加密，接受到响应后解密，再派发事件出去
                 * 由于拉勾的重写在 proxyAjax 之前运行，所以这里拿到的是解密后的数据
                 */
                getLaGouData(data?.response)
            }
        }
    })

    window.addEventListener('proxyScriptLoaded', async function(e) {
        await initBridge();
        // 不通过直接注入脚本的方式处理 ssr 页面，否则一些引入的模块需要重新打包
        if(location.host === 'sou.zhaopin.com') {
            // 智联招聘首次打开
            const data = e?.detail?.zhipin?.initialState
            zhilianFirstOpen(data || {});
        }
        
        if(location.host === 'www.lagou.com') {
            // 拉勾首次打开
            const data = e?.detail?.lagou?.initialState
            lagouFirstOpen(data || {});
        }
        
    })
    
})();
