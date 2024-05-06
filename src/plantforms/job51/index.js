import { renderTimeTag } from "../../commonRender";

export function getJob51Data(responseText) {
    try {
        const data = JSON.parse(responseText);
        mutationContainer().then((node) => {
            parseData(data?.resultbody?.job?.items || [], getListByNode(node));
        })
    } catch(err) {
        console.error('解析 JSON 失败', err);
    }
}

// 获取职位列表节点
function getListByNode(node) {
    const children = node?.children;
    return function getListItem(index) {
        return children?.[index]
    }
}


// 监听 positionList-hook 节点，判断职位列表是否被挂载
function mutationContainer () {
   return new Promise((resolve, reject) => {
        const dom = document.querySelector('.joblist');
        const observer = new MutationObserver(function(childList, obs) {
            const isAdd = (childList || []).some(item => {
               return item?.addedNodes?.length > 0
            });
            return isAdd ? resolve(dom) : reject('未找到职位列表');
        })

        observer.observe(dom, {
            childList: true,
            subtree: false
        })
   })
}

// 解析数据，插入时间标签
function parseData(list, getListItem) {
    list.forEach((item, index) => {
        const {
            updateDateTime,
            companyName,
        }  = item;
        const dom = getListItem(index);
        let tag = createDOM(updateDateTime, companyName); 
        dom.appendChild(tag);
    });
}

export function createDOM(lastModifyTime,brandName) {
    const div = document.createElement('div');
    div.classList.add('__job51_time_tag');
    renderTimeTag(div,lastModifyTime,brandName);
    return div;
}
