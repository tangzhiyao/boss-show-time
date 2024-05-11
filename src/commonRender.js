import dayjs from "dayjs";
import { isOutsource } from "./data/outsource";
import { isTraining } from "./data/training";
import { convertTimeToHumanReadable } from "./utils";

export function renderTimeTag(
  divElement,
  lastModifyTime,
  brandName,
  jobStatusDesc
) {
  var timeHumanReadable;
  var statusTag = null;
  //jobStatusDesc
  if (jobStatusDesc) {
    statusTag = document.createElement("span");
    statusTag.innerHTML = "【招聘状态:" + jobStatusDesc.label + "❔】";
    statusTag.title = "最新：未知；招聘中：代表至少三天前发布的岗位";
    divElement.appendChild(statusTag);
  }
  //lastModifyTime
  var lastModifyTimeTag = document.createElement("span");
  if (jobStatusDesc) {
    //for boss
    if (lastModifyTime) {
      timeHumanReadable = convertTimeToHumanReadable(lastModifyTime);
      lastModifyTimeTag.innerHTML +=
        "【岗位详情更新时间:" + timeHumanReadable + "❔】";
      lastModifyTimeTag.title =
        "招聘方登录后系统会自动修改岗位详情页的更新时间";
    } else {
      lastModifyTimeTag.innerHTML = "【" + "未找到更新时间" + "】";
    }
  } else {
    if (lastModifyTime) {
      timeHumanReadable = convertTimeToHumanReadable(lastModifyTime);
      lastModifyTimeTag.innerHTML += "【" + timeHumanReadable + "更新】";
    } else {
      lastModifyTimeTag.innerHTML = "【" + "未找到更新时间" + "】";
    }
  }
  divElement.appendChild(lastModifyTimeTag);
  //companyInfo
  var companyInfoTag = null;
  var companyInfoText = getCompanyInfoText(brandName);
  if (companyInfoText !== "") {
    companyInfoTag = document.createElement("span");
    companyInfoTag.innerHTML = companyInfoText;
    divElement.appendChild(companyInfoTag);
  }
  //other
  divElement.style = getRenderTimeStyle(lastModifyTime);
}

export function renderTimeLoadingTag(divElement, brandName) {
  var timeText = "【正查找更新时间⌛︎】";
  var text = timeText;
  text += getCompanyInfoText(brandName);
  divElement.style = getRenderTimeStyle();
  divElement.innerHTML = text;
}

function getCompanyInfoText(brandName) {
  var text = "";
  const isOutsourceBrand = isOutsource(brandName);
  const isTrainingBrand = isTraining(brandName);
  if (isOutsourceBrand) {
    text += "【疑似外包公司】";
  }
  if (isTrainingBrand) {
    text += "【疑似培训机构】";
  }
  if (isOutsourceBrand || isTrainingBrand) {
    text += "⛅";
  } else {
    text += "☀";
  }
  return text;
}

function getRenderTimeStyle(lastModifyTime) {
  var offsetTimeDay;
  if (lastModifyTime) {
    offsetTimeDay = dayjs().diff(dayjs(lastModifyTime), "day");
  } else {
    lastModifyTime = -1;
  }
  return (
    "color:white;font-size:12px;background-color: " +
    getTimeColorByoffsetTimeDay(offsetTimeDay) +
    ";"
  );
}

function getTimeColorByoffsetTimeDay(offsetTimeDay) {
  if (offsetTimeDay >= 0) {
    if (offsetTimeDay <= 7) {
      return "yellowgreen";
    } else if (offsetTimeDay <= 14) {
      return "green";
    } else if (offsetTimeDay <= 28) {
      return "orange";
    } else if (offsetTimeDay <= 56) {
      return "red";
    } else {
      return "gray";
    }
  } else {
    return "black";
  }
}

export function setupSortJobItem(node) {
  node.style = "display:flex;flex-direction: column;";
  //for zhilian
  const paginationNode = node.querySelector(".pagination");
  if (paginationNode) {
    paginationNode.style = "order:99999;";
  }
}

export function renderSortJobItem(list, getListItem) {
  const idAndSortIndexMap = new Map();
  const sortList = JSON.parse(JSON.stringify(list)).sort((o1, o2) => {
    return (
      dayjs(
        o2.lastModifyTime
          ? o2.lastModifyTime
          : o2.updateDateTime
          ? o2.updateDateTime
          : o2.firstPublishTime
      ).valueOf() -
      dayjs(
        o1.lastModifyTime
          ? o1.lastModifyTime
          : o1.updateDateTime
          ? o1.updateDateTime
          : o1.firstPublishTime
      ).valueOf()
    );
  });
  sortList.sort((o1, o2) => {
    if (o2.jobStatusDesc && o1.jobStatusDesc) {
      return o1.jobStatusDesc.order - o2.jobStatusDesc.order;
    } else {
      return 0;
    }
  });
  sortList.forEach((item, index) => {
    idAndSortIndexMap.set(JSON.stringify(item), index);
  });
  list.forEach((item, index) => {
    const { itemId } = item;
    const dom = getListItem(itemId ? itemId : index);
    dom.style = "order:" + idAndSortIndexMap.get(JSON.stringify(item));
  });
}
