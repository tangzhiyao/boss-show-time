import dayjs from "dayjs";
import { isOutsource } from "../../data/outsource"
import { isTraining } from "../../data/training";
import {convertTimeToHumanReadable } from "../../utils"

export function getBossData(responseText) {
    try {
        const data = JSON.parse(responseText);
        mutationContainer().then((node) => {
            parseBossData(data?.zpData?.jobList || [], getListByNode(node));
            handleBossOnlineFilter(data?.zpData?.jobList || []);
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
        const offsetTimeDay = dayjs().diff(dayjs(lastModifyTime),"day");
        let tag = createDOM(time,brandName,offsetTimeDay); 
        dom.appendChild(tag);
    });
}

function createDOM(time,brandName,offsetTimeDay) {
    const div = document.createElement('div');
    div.classList.add('__boss_time_tag');
    const isOutsourceBrand = isOutsource(brandName);
    const isTrainingBrand = isTraining(brandName);
    var text = time;
    var style = "color:white;font-size:12px;background-color: "+getTimeColorByoffsetTimeDay(offsetTimeDay)+";"
    if(isOutsourceBrand){
        text+="【疑似外包公司】";
        style += "color:navajowhite;"
    }
    if(isTrainingBrand){
        text+="【疑似培训机构】";
        style += "color:navajowhite;"
    }
    if(isOutsourceBrand||isTrainingBrand){
        text+="⛅";
    }else{
        text+="☀";
    }
    div.style = style;
    div.innerText = text;
    return div;
}

function getTimeColorByoffsetTimeDay(offsetTimeDay){
    if(offsetTimeDay <= 7){
        return "yellowgreen";
    }else if(offsetTimeDay <= 14){
        return "green";
    }else if(offsetTimeDay <= 28){
        return "orange";
    }else if(offsetTimeDay <= 56){
        return "red";
    }else{
        return "gray";
    }
}

/**
 * 当ajax请求返回数据，派发自定义事件，将招聘人不在线的job id传递给自定义filter——"招聘人在线"的事件监听器
 * @param {Array} results - 最新职位列表数据
 */
function handleBossOnlineFilter(results) {
    let tmpArr = [];
    results.forEach((r) => {
        if (!r.bossOnline) {
            tmpArr.push(r.itemId);
        }
    });

    window.dispatchEvent(new CustomEvent('job-list-change', {
        detail: {
            bossOfflineJobIds: tmpArr
        }
    }));
}
