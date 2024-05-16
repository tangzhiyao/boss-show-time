import dayjs from "dayjs";
import { isOutsource } from "./data/outsource";
import { isTraining } from "./data/training";
import { convertTimeToHumanReadable } from "./utils";

export function renderTimeTag(divElement, lastModifyTime, brandName) {
  var timeHumanReadable;
  var timeText;
  if (lastModifyTime) {
    timeHumanReadable = convertTimeToHumanReadable(lastModifyTime);
    timeText = "【" + timeHumanReadable + "更新】";
  } else {
    timeHumanReadable = "【" + "未找到更新时间" + "】";
    timeText = timeHumanReadable;
  }
  var text = timeText;
  text += getCompanyInfoText(brandName);
  divElement.style = getRenderTimeStyle(lastModifyTime);
  divElement.innerHTML = text;
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
    if(!node) return;
    node.style = "display:flex;flex-direction: column;";
    //for zhilian
    const paginationNode = node.querySelector(".pagination");
    if (paginationNode) {
        paginationNode.style = "order:99999;";
    }
}

export function renderSortJobItem(list, getListItem, timeKey) {
  const idAndSortIndexMap = new Map();
  const sortList = JSON.parse(JSON.stringify(list)).sort((o1, o2) => {
    const minDate = dayjs('2000-01-01');
    // 如果时间不存在给一个默认最小值，主要为了 boss直聘 没有时间的情况
    const o1time = o1[timeKey] ? dayjs(o1[timeKey]) : minDate;
    const o2time = o2[timeKey] ? dayjs(o2[timeKey]) : minDate;
    return o2time.valueOf() - o1time.valueOf();
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