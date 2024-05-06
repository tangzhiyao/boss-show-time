import { renderTimeTag } from "../../commonRender";
import onlineFilter from './onlineFilter';

export function getBossData(responseText) {
    try {
        const data = JSON.parse(responseText);
        mutationContainer().then((node) => {
            parseBossData(data?.zpData?.jobList || [], getListByNode(node));
            onlineFilter();
        })
        return 
    } catch(err) {
        console.error('解析 JSON 失败', err);
    }
}

// 获取职位列表节点
function getListByNode(node) {
    return function getListItem(itemId) {
        return node.querySelector(`[ka="search_list_${itemId}"]`);
    }
}


// 监听 search-job-result 节点，判断职位列表是否被挂载
function mutationContainer () {
   return new Promise((resolve, reject) => {
        const dom = document.querySelector('.search-job-result');
        const observer = new MutationObserver(function(childList, obs) {
            (childList || []).forEach(item => {
                const {
                    addedNodes
                } = item;
                if(addedNodes && addedNodes.length > 0)  {
                    addedNodes.forEach(node => {
                        const {
                            className,
                        } = node;
                        if(className === 'job-list-box') {
                            observer.disconnect();
                            resolve(node);
                        }
                    })
                } 
            });
            return reject('未找到职位列表');

        })

        observer.observe(dom, {
            childList: true,
            subtree: false
        })
   })
}

// 解析数据，插入时间标签
function parseBossData(list, getListItem) {
    list.forEach(item => {
        const {
            itemId, lastModifyTime, brandName
        }  = item;
        const dom = getListItem(itemId);
        let tag = createDOM(lastModifyTime,brandName); 
        dom.appendChild(tag);
    });
}

function createDOM(lastModifyTime,brandName) {
    const div = document.createElement('div');
    div.classList.add('__boss_time_tag');
    renderTimeTag(div,lastModifyTime,brandName);
    return div;
}
