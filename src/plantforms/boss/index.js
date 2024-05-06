import { isOutsource } from "../../data/outsource"
import { isTraining } from "../../data/training";
import {convertTimeToHumanReadable } from "../../utils"
import dayjs from 'dayjs';
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
            itemId, lastModifyTime,brandName
        }  = item;
        const timeHumanReadable = convertTimeToHumanReadable(lastModifyTime);
        const time = "【"+timeHumanReadable+"更新】";
        const dom = getListItem(itemId);
        let tag = createDOM(time,brandName); 
        dom.appendChild(tag);
    });
}

function createDOM(time,brandName) {
    const div = document.createElement('div');
    div.classList.add('__boss_time_tag');
    const isOutsourceBrand = isOutsource(brandName);
    const isTrainingBrand = isTraining(brandName);
    var text = time;
    if(isOutsourceBrand){
        text+="【疑似外包公司】";
        div.style = "color:red;font-size:12px;background-color: yellow;";
    }
    if(isTrainingBrand){
        text+="【疑似培训机构】";
        div.style = "color:red;font-size:12px;background-color: yellow;";
    }
    div.innerText = text;
    return div;
}
