import dayjs from "dayjs";
import {
  renderTimeTag,
  setupSortJobItem,
  renderSortJobItem,
  createLoadingDOM,
  hiddenLoadingDOM,
} from "../../commonRender";
import { delay, createOtherLink } from "../../utils";
import onlineFilter from "./onlineFilter";
import {
  JOB_STATUS_DESC_NEWEST,
  JOB_STATUS_DESC_RECRUITING,
  JOB_STATUS_DESC_UNKNOW,
} from "../../common";
import { PLATFORM_BOSS } from "../../common";
import { saveBrowseJob, getJobIds } from "../../commonDataHandler";
import { JobApi } from "../../api";

const DELAY_FETCH_TIME = 75; //ms

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
    const jobItemDetailUrl = dom
      .querySelector(".job-card-body")
      .querySelector(".job-card-left").href;
    const url = new URL(jobItemDetailUrl);
    let pureJobItemDetailUrl = url.origin + url.pathname;
    urlList.push(pureJobItemDetailUrl);

    let loadingLastModifyTimeTag = createLoadingDOM(
      brandName,
      "__boss_time_tag"
    );
    dom.appendChild(loadingLastModifyTimeTag);
  });
  const promiseList = apiUrlList.map(async (url, index) => {
    await delay(DELAY_FETCH_TIME * index); // 避免频繁请求触发风控
    const response = await fetch(url);
    const result = await response.json();
    return result;
  });
  Promise.allSettled(promiseList)
    .then(async (jsonList) => {
      jsonList.forEach((item, index) => {
        item.value.zpData.jobInfo.jobUrl = urlList[index];
      });
      await saveBrowseJob(jsonList, PLATFORM_BOSS);
      const jobDTOList = await JobApi.getJobBrowseInfoByIds(
        getJobIds(jsonList, PLATFORM_BOSS)
      );
      list.forEach((item, index) => {
        item["lastModifyTime"] = jsonList?.[index]
          ? dayjs(jsonList[index].value?.zpData?.brandComInfo?.activeTime)
          : undefined;
        item["jobStatusDesc"] = jsonList?.[index]
          ? convertJobStatusDesc(jsonList[index].value?.zpData?.jobInfo?.jobStatusDesc)
          : undefined;
        item["postDescription"] = jsonList?.[index]
          ? jsonList[index].value?.zpData?.jobInfo?.postDescription
          : undefined;
        item["firstBrowseDatetime"] = jobDTOList[index].createDatetime;
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
        dom.appendChild(createOtherLink(brandName.replace('...', '')));
    });
      hiddenLoadingDOM();
      renderSortJobItem(list, getListItem);
    })
    .catch((error) => {
      console.log(error);
      list.forEach((item) => {
        const { itemId, lastModifyTime, brandName } = item;
        const dom = getListItem(itemId);
        let tag = createDOM(lastModifyTime, brandName, null, null, null);
        dom.appendChild(tag);
      });
      hiddenLoadingDOM();
    });
}

function createDOM(
  lastModifyTime,
  brandName,
  jobStatusDesc,
  postDescription,
  jobDTO
) {
  const div = document.createElement("div");
  div.classList.add("__boss_time_tag");
  renderTimeTag(div, lastModifyTime, brandName, {
    jobStatusDesc: jobStatusDesc,
    jobDesc: postDescription,
    jobDTO: jobDTO,
  });
  return div;
}
