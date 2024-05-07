import {
  renderTimeTag,
  setupSortJobItem,
  renderSortJobItem,
} from "../../commonRender";
import onlineFilter from "./onlineFilter";

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

// 解析数据，插入时间标签
function parseBossData(list, getListItem) {
  const urlList = [];
  list.forEach((item) => {
    const { itemId } = item;
    const dom = getListItem(itemId);
    const jobItemDetailUrl = dom.childNodes[0].childNodes[0].href;
    const url = new URL(jobItemDetailUrl);
    var pureJobItemDetailUrl = url.origin + url.pathname;
    urlList.push(pureJobItemDetailUrl);
  });
  let promiseList = [];
  urlList.forEach((url) => {
    const promise = new Promise((resolve, reject) => {
      const fetchJobItemDetailIframe = document.createElement("iframe");
      fetchJobItemDetailIframe.setAttribute("src", url);
      fetchJobItemDetailIframe.style.width = "0px";
      fetchJobItemDetailIframe.style.height = "0px";
      fetchJobItemDetailIframe.addEventListener("load", (event) => {
        const text =
          fetchJobItemDetailIframe.contentWindow.document.body.innerHTML;
        if (isExistsLastModifyTime(text)) {
          resolve(text);
          document.body.removeChild(fetchJobItemDetailIframe);
        } else {
          fetchJobItemDetailIframe.contentWindow.addEventListener(
            "hashchange",
            function () {
              const text =
                fetchJobItemDetailIframe.contentWindow.document.body.innerHTML;
              if (isExistsLastModifyTime(text)) {
                resolve(text);
                document.body.removeChild(fetchJobItemDetailIframe);
              } else {
                //skip
              }
            }
          );
        }
      });
      fetchJobItemDetailIframe.addEventListener("error", (event) => {
        resolve(fetchJobItemDetailIframe.contentWindow.document.body.innerHTML);
        document.body.removeChild(fetchJobItemDetailIframe);
      });
      document.body.appendChild(fetchJobItemDetailIframe);
    });
    promiseList.push(promise);
  });
  const lastModifyTimeList = [];
  console.log("loading job item lastModifyTime start");
  Promise.allSettled(promiseList)
    .then((textList) => {
      console.log("loading job item lastModifyTime end");
      textList.forEach((item) => {
        const regxMatchArrayResult = item.value.match(
          '<p class="gray">更新于：.*</p>'
        );
        if (regxMatchArrayResult && regxMatchArrayResult.length > 0) {
          let date = regxMatchArrayResult[0]?.match(
            /(\d{4}[-](\d{2})[-](\d{2}))/g
          );
          lastModifyTimeList.push(date);
        } else {
          lastModifyTimeList.push(null);
        }
      });
      list.forEach((item, index) => {
        item["lastModifyTime"] = lastModifyTimeList[index];
      });
      list.forEach((item) => {
        const { itemId, lastModifyTime, brandName } = item;
        const dom = getListItem(itemId);
        let tag = createDOM(lastModifyTime, brandName);
        dom.appendChild(tag);
      });
      renderSortJobItem(list, getListItem);
    })
    .catch((error) => {
      console.log("loading job item lastModifyTime end");
      console.log(error);
      list.forEach((item) => {
        const { itemId, lastModifyTime, brandName } = item;
        const dom = getListItem(itemId);
        let tag = createDOM(lastModifyTime, brandName);
        dom.appendChild(tag);
      });
    });
}

function isExistsLastModifyTime(text) {
  const regxMatchArrayResult = text.match('<p class="gray">更新于：.*</p>');
  return regxMatchArrayResult && regxMatchArrayResult.length > 0;
}

function createDOM(lastModifyTime, brandName) {
  const div = document.createElement("div");
  div.classList.add("__boss_time_tag");
  renderTimeTag(div, lastModifyTime, brandName);
  return div;
}
