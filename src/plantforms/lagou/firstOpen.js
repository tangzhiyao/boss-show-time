

import { setupSortJobItem,renderSortJobItem } from "../../commonRender";
import { createDOM } from './index';
import { mutationContainer, getListValue } from './index'
import { createOtherLink } from '../../utils'
// 首次打开页面时是服务端渲染，没法监听接口，但是 html 中保存了列表数据
export default function firstOpen(data) {
    mutationContainer().then(dom => {
        setupSortJobItem(dom);
        const children = dom?.children;
        const list = getListValue(data?.props?.pageProps?.initData) || [];
        if(!children || !list || list.lenth === 0) return;
            list.forEach((item, index) => {
                const {
                    createTime,
                    companyShortName,
                }  = item;
                const dom = children?.[index];
                if(!dom) return;
                
                let tag = createDOM(createTime, companyShortName); 
                dom.appendChild(tag);
                dom.appendChild(createOtherLink(companyShortName));
            });
            renderSortJobItem(list, (index)=>{
                return children?.[index];
            }, 'createTime')
    });
}