import { createDOM } from './index';

// 智联招聘首次打开页面时是服务端渲染，没法监听接口，但是 html 中保存了列表数据
;(function firstOpen() {
    const children = document.querySelector('.positionlist')?.children;
    const { positionList = [] } = window.__INITIAL_STATE__;
    if(!children || !positionList || positionList.lenth === 0) return;

    positionList.forEach((item, index) => {
        const {
            firstPublishTime,
        }  = item;
        const dom = children?.[index];
        if(!dom) return;
        let tag = createDOM(`发布时间：${firstPublishTime}`); 
        dom.appendChild(tag);
    });
})()