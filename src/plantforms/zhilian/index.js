import {
  renderTimeTag,
  setupSortJobItem,
  renderSortJobItem,
  createLoadingDOM,
  hiddenLoadingDOM,
} from "../../commonRender";
import { PLATFORM_ZHILIAN } from "../../common";
import { saveBrowseJob,getJobIds } from "../../commonDataHandler";
import { JobApi} from "../../api"

export function getZhiLianData(responseText) {
  try {
    const data = JSON.parse(responseText);
    mutationContainer().then((node) => {
      setupSortJobItem(node);
      parseZhilianData(data?.data?.list || [], getListByNode(node));
    });
  } catch (err) {
    console.error("解析 JSON 失败", err);
  }
}

// 获取职位列表节点
function getListByNode(node) {
  const children = node?.children;
  return function getListItem(index) {
    return children?.[index];
  };
}

// 监听 positionList-hook 节点，判断职位列表是否被挂载
function mutationContainer() {
  return new Promise((resolve, reject) => {
    const dom = document.querySelector(".positionlist");
    const observer = new MutationObserver(function (childList) {
      const isAdd = (childList || []).some((item) => {
        return item?.addedNodes?.length > 0;
      });
      return isAdd ? resolve(dom) : reject("未找到职位列表");
    });

    observer.observe(dom, {
      childList: true,
      subtree: false,
    });
  });
}

// 解析数据，插入时间标签
async function parseZhilianData(list, getListItem) {
  list.forEach((item, index) => {
    const dom = getListItem(index);
    const { companyName } = item;
    let loadingLastModifyTimeTag = createLoadingDOM(
      companyName,
      '__zhilian_time_tag'
    );
    dom.appendChild(loadingLastModifyTimeTag);
  });
  await saveBrowseJob(list,PLATFORM_ZHILIAN);
  let jobDTOList = await JobApi.getJobBrowseInfoByIds(getJobIds(list,PLATFORM_ZHILIAN));
  list.forEach((item, index) => {
    const { publishTime, companyName, jobSummary, firstPublishTime } = item;
    const dom = getListItem(index);
    item["firstBrowseDatetime"] = jobDTOList[index].createDatetime;
    let tag = createDOM(publishTime, companyName, jobSummary, firstPublishTime,jobDTOList[index]);
    dom.appendChild(tag);
  });
  hiddenLoadingDOM();
  renderSortJobItem(list, getListItem);
}

export function createDOM(
  lastModifyTime,
  brandName,
  jobSummary,
  firstPublishTime,
  jobDTO
) {
  const div = document.createElement("div");
  div.classList.add("__zhilian_time_tag");
  renderTimeTag(div, lastModifyTime, brandName, {
    jobDesc: jobSummary,
    firstPublishTime: firstPublishTime,
    jobDTO:jobDTO,
  });
  return div;
}
