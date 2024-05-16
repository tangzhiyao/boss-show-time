

import { setupSortJobItem,renderSortJobItem } from "../../commonRender";
import { createDOM } from './index';
import { mutationContainer, getListValue } from './index'
// 首次打开页面时是服务端渲染，没法监听接口，但是 html 中保存了列表数据
export default function firstOpen(data) {
    mutationContainer().then(dom => {
        setupSortJobItem(dom);
        const children = dom?.children;
        const list = getListValue(data?.props?.pageProps?.initData) || [];
        // 这里可以查看具体job list信息
        // console.log(list)
        if(!children || !list || list.lenth === 0) return;
            list.forEach((item, index) => {
                const {
                    createTime,
                    companyShortName,
                    positionDetail
                }  = item;
                const dom = children?.[index];
                if(!dom) return;
                
                let tag = createDOM(createTime, companyShortName,positionDetail); 
                dom.appendChild(tag);
            });
            renderSortJobItem(list,(index)=>{
                return children?.[index];
            })
    });
}