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
  var offsetTimeDay;
  if (lastModifyTime) {
    offsetTimeDay = dayjs().diff(dayjs(lastModifyTime), "day");
  } else {
    lastModifyTime = -1;
  }
  const isOutsourceBrand = isOutsource(brandName);
  const isTrainingBrand = isTraining(brandName);
  var text = timeText;
  var style =
    "color:white;font-size:12px;background-color: " +
    getTimeColorByoffsetTimeDay(offsetTimeDay) +
    ";";
  if (isOutsourceBrand) {
    text += "【疑似外包公司】";
    divElement.classList.add("__is_outsourcing_or_training");
  }
  if (isTrainingBrand) {
    text += "【疑似培训机构】";
    divElement.classList.add("__is_outsourcing_or_training");
  }
  if (isOutsourceBrand || isTrainingBrand) {
    text += "⛅";
  } else {
    text += "☀";
  }
  divElement.style = style;
  divElement.innerHTML = text;
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
  sortList.forEach((item, index) => {
    idAndSortIndexMap.set(JSON.stringify(item), index);
  });
  list.forEach((item, index) => {
    const { itemId } = item;
    const dom = getListItem(itemId ? itemId : index);
    dom.style = "order:" + idAndSortIndexMap.get(JSON.stringify(item));
  });
}
