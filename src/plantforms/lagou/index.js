import { renderTimeTag, setupSortJobItem, renderSortJobItem } from "../../commonRender";
import { debounce } from '../../utils';

export function getListValue(data = {}) {
    return [
        'content',
        'positionResult',
        'result'].reduce((value, key) => {
            return value ? value?.[key] : undefined;
        }, data)
}

export function getLaGouData(responseText) {
    try {
        const data = JSON.parse(responseText);
        console.log('tzy data', data)
        mutationContainer().then((node) => {
            setupSortJobItem(node); // 添加 flex 样式，以便后续用 order 进行排序
            parseLaGouData(getListValue(data) || [], getListByNode(node));
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


// 监听节点，判断职位列表是否被挂载
export function mutationContainer () {
   return new Promise((resolve, reject) => {
        const dom = document.getElementById('jobList');
        // 首次刷新页面的时候会触发多次，所以加上 debounce
        const observer = new MutationObserver(debounce(function(childList) {
            // 拉勾的页面会触发多次，都是先删除 jobList 节点，再添加回去
            const isAdd = (childList || []).some(item => {
               return item?.addedNodes?.length > 0
            });
            return isAdd ? resolve(dom.querySelector('.list__YibNq')) : reject('未找到职位列表');
        }, 1000))

        observer.observe(dom, {
            childList: true,
            subtree: false
        })
   })
}

// 解析数据，插入时间标签
function parseLaGouData(list, getListItem) {
    console.log('tzy data', list, getListItem(1) )

    list.forEach((item, index) => {
        const {
            createTime,
            companyShortName,
        }  = item;
        const dom = getListItem(index);
        let tag = createDOM(createTime, companyShortName); 
        dom.appendChild(tag);
    });
    renderSortJobItem(list, getListItem);
}

export function createDOM(lastModifyTime,brandName) {
    const div = document.createElement('div');
    div.classList.add('__zhipin_time_tag');
    renderTimeTag(div,lastModifyTime,brandName);
    return div;
}
