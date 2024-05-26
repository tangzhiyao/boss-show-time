import dayjs from "dayjs";
import {
  renderTimeTag,
  setupSortJobItem,
  renderSortJobItem,
  createLoadingDOM,
  hiddenLoadingDOM,
} from "../../commonRender";
import { getRandomInt } from "../../utils";
import onlineFilter from "./onlineFilter";
import {
  JOB_STATUS_DESC_NEWEST,
  JOB_STATUS_DESC_RECRUITING,
  JOB_STATUS_DESC_UNKNOW,
} from "../../common";
import { PLATFORM_BOSS } from "../../common";
import { saveBrowseJob,getJobIds } from "../../commonDataHandler";
import { JobApi} from "../../api"

const DELAY_FETCH_TIME = 75; //ms
const DELAY_FETCH_TIME_RANDOM_OFFSET = 50; //ms

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
    const observer = new MutationObserver(function (childList, obs) {
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

function convertJobStatusDesc(statusText) {
  if (statusText == JOB_STATUS_DESC_NEWEST.key) {
    return JOB_STATUS_DESC_NEWEST;
  } else if (statusText == JOB_STATUS_DESC_RECRUITING.key) {
    return JOB_STATUS_DESC_RECRUITING;
  } else {
    return JOB_STATUS_DESC_UNKNOW;
  }
}

// 解析数据，插入时间标签
function parseBossData(list, getListItem) {
  const apiUrlList = [];
  const urlList = [];
  list.forEach((item) => {
    const { itemId, brandName, securityId } = item;
    const dom = getListItem(itemId);
    //apiUrl
    var pureJobItemDetailApiUrl =
      "https://www.zhipin.com/wapi/zpgeek/job/detail.json?securityId=" +
      securityId;
    apiUrlList.push(pureJobItemDetailApiUrl);
    //jobUrl
    const jobItemDetailUrl = dom.childNodes[0].childNodes[0].href;
    const url = new URL(jobItemDetailUrl);
    let pureJobItemDetailUrl = url.origin + url.pathname;
    urlList.push(pureJobItemDetailUrl);

    let loadingLastModifyTimeTag = createLoadingDOM(brandName,"__boss_time_tag");
    dom.appendChild(loadingLastModifyTimeTag);
  });
  let promiseList = [];
  apiUrlList.forEach(async (url, index) => {
    const delay = (
      ms = DELAY_FETCH_TIME * index +
        getRandomInt(DELAY_FETCH_TIME_RANDOM_OFFSET)
    ) => new Promise((r) => setTimeout(r, ms));
    await delay();
    const promise = new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(url);
        const result = await response.json();
        resolve(result);
      } catch (e) {
        reject(e);
      }
    });
    promiseList.push(promise);
    if (index == apiUrlList.length - 1) {
      const lastModifyTimeList = [];
      const jobStatusDescList = [];
      const jobDesc = [];
      var jobDTOList = [];
      Promise.allSettled(promiseList)
        .then( async (jsonList) => {
          jsonList.forEach((item,index) => {
            item.value.zpData.jobInfo.jobUrl = urlList[index];
          })
          
          await saveBrowseJob(jsonList,PLATFORM_BOSS);
          jobDTOList = await JobApi.getJobBrowseInfoByIds(getJobIds(jsonList,PLATFORM_BOSS));
          jsonList.forEach((item) => {
            lastModifyTimeList.push(
              dayjs(item.value?.zpData?.brandComInfo?.activeTime)
            );
            jobStatusDescList.push(
              convertJobStatusDesc(item.value?.zpData?.jobInfo?.jobStatusDesc)
            );
            jobDesc.push(item.value?.zpData?.jobInfo?.postDescription);
          });
          list.forEach((item, index) => {
            item["lastModifyTime"] = lastModifyTimeList[index];
            item["jobStatusDesc"] = jobStatusDescList[index];
            item["postDescription"] = jobDesc[index];
            item["firstBrowseDatetime"] = jobDTOList[index].createDatetime;
          });
          list.forEach((item,index) => {
            const {
              itemId,
              lastModifyTime,
              brandName,
              jobStatusDesc,
              postDescription,
            } = item;
            const dom = getListItem(itemId);
            let tag = createDOM(
              lastModifyTime,
              brandName,
              jobStatusDesc,
              postDescription,
              jobDTOList[index]
            );
            dom.appendChild(tag);
          });
          hiddenLoadingDOM();
          renderSortJobItem(list, getListItem);
        })
        .catch((error) => {
          console.log(error);
          list.forEach((item) => {
            const { itemId, lastModifyTime, brandName } = item;
            const dom = getListItem(itemId);
            let tag = createDOM(lastModifyTime, brandName,null,null,jobDTOList[index]);
            dom.appendChild(tag);
          });
          hiddenLoadingDOM();
        });
    }
  });
}

function createDOM(lastModifyTime, brandName, jobStatusDesc, postDescription,jobDTO) {
  const div = document.createElement("div");
  div.classList.add("__boss_time_tag");
  renderTimeTag(div, lastModifyTime, brandName, {
    jobStatusDesc: jobStatusDesc,
    jobDesc: postDescription,
    jobDTO: jobDTO
  });
  return div;
}
