import dayjs from "dayjs";
import {
  renderTimeTag,
  setupSortJobItem,
  renderSortJobItem,
  renderTimeLoadingTag,
} from "../../commonRender";
import { delay, createOtherLink } from "../../utils";
import onlineFilter from "./onlineFilter";

const DELAY_FETCH_TIME = 100; //ms

export function getBossData(responseText) {
  try {
    const data = JSON.parse(responseText);
    mutationContainer().then((node) => {
      setupSortJobItem(node);
      parseBossData(data?.zpData?.jobList || [], getListByNode(node));
      onlineFilter();
    });
    return;
  } catch (err) {
    console.error("解析 JSON 失败", err);
  }
}

// 获取职位列表节点
function getListByNode(node) {
  return function getListItem(itemId) {
    return node.querySelector(`[ka="search_list_${itemId}"]`);
  };
}

// 监听 search-job-result 节点，判断职位列表是否被挂载
function mutationContainer() {
  return new Promise((resolve, reject) => {
    const dom = document.querySelector(".search-job-result");
    const observer = new MutationObserver(function (childList) {
      (childList || []).forEach((item) => {
        const { addedNodes } = item;
        if (addedNodes && addedNodes.length > 0) {
          addedNodes.forEach((node) => {
            const { className } = node;
            if (className === "job-list-box") {
              observer.disconnect();
              resolve(node);
            }
          });
        }
      });
      return reject("未找到职位列表");
    });

    observer.observe(dom, {
      childList: true,
      subtree: false,
    });
  });
}

// 解析数据，插入时间标签
function parseBossData(list, getListItem) {
    const urlList = list.map((item) => {
        const { itemId, brandName, securityId } = item;
        const dom = getListItem(itemId);
        var pureJobItemDetailUrl =
        "https://www.zhipin.com/wapi/zpgeek/job/detail.json?securityId=" + securityId;
        let loadingLastModifyTimeTag = createLoadingDOM(brandName);
        dom.appendChild(loadingLastModifyTimeTag);
        return pureJobItemDetailUrl;
    });

    const promiseList = urlList.map(async (url, index) => {
        await delay(DELAY_FETCH_TIME * index); // 避免频繁请求触发风控
        const response = await fetch(url);
        const result = await response.json();
        return result
    });

    Promise.allSettled(promiseList)
    .then((jsonList) => {
        let hasShowTag = localStorage.getItem('__boss_show_time_alert');
        if(!hasShowTag) {
            localStorage.setItem('__boss_show_time_alert', true);
            alert('目前仅提供一周内的时间显示！！！');
        }

        const newList = list.map((item, index) => {
            const jsonItem = jsonList[index];
            const { itemId, brandName } = item;
            const currentTime = dayjs();
            // 最新： 7天内发布； 招聘中： 7天之前；
            let time;
            if(jsonItem.status === 'fulfilled') {
                time = jsonItem.value?.zpData?.jobInfo?.jobStatusDesc === '最新' ? currentTime.subtract(7, 'day') : undefined
            }
            item.lastModifyTime = time;
            const dom = getListItem(itemId);
            let tag = createDOM(time, brandName);
            dom.appendChild(tag);
            dom.appendChild(createOtherLink(brandName.replace('...', '')));
            
            return item;
        });
          
        renderSortJobItem(newList, getListItem, 'lastModifyTime');
    })
    .catch((err) => {
        console.log('boss-show-time-error',err)
      list.forEach((item) => {
        const { itemId, lastModifyTime, brandName } = item;
        const dom = getListItem(itemId);
        let tag = createDOM(lastModifyTime, brandName);
        dom.appendChild(tag);
      });
    }).finally(() => {
        hiddenLoadingDOM();
    });
}

function createDOM(lastModifyTime, brandName) {
  const div = document.createElement("div");
  div.classList.add("__boss_time_tag");
  renderTimeTag(div, lastModifyTime, brandName);
  return div;
}

function createLoadingDOM(brandName) {
  const div = document.createElement("div");
  div.classList.add("__boss_time_tag");
  div.classList.add("__loading_tag");
  renderTimeLoadingTag(div, brandName);
  return div;
}

function hiddenLoadingDOM() {
  var loadingTagList = document.querySelectorAll(".__loading_tag");
  if (loadingTagList) {
    loadingTagList.forEach((item) => {
      item.style = "visibility: hidden;";
    });
  }
}
