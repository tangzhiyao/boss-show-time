import dayjs from 'dayjs';
import { isOutsource } from './data/outsource';
import { isTraining } from './data/training';
import {
  convertTimeToHumanReadable,
  convertTimeOffsetToHumanReadable,
} from './utils';
import { JOB_STATUS_DESC_NEWEST } from './common';

export function renderTimeTag(
  divElement,
  lastModifyTime,
  brandName,
  { jobStatusDesc, jobDesc, firstPublishTime, jobDTO }
) {
  if (jobDesc) {
    divElement.title = jobDesc;
  }
  var statusTag = null;
  //jobStatusDesc
  if (jobStatusDesc) {
    statusTag = document.createElement('span');
    var statusToTimeText = '';
    if (jobStatusDesc == JOB_STATUS_DESC_NEWEST) {
      statusToTimeText = '一周内';
      statusTag.innerHTML = '【 ' + statusToTimeText + '发布❔】';
      statusTag.title =
        '当前招聘状态【' +
        jobStatusDesc.label +
        '】，招聘状态：最新：代表一周内发布；招聘中：代表发布时间超过一周';
      statusTag.classList.add('__time_tag_base_text_font');
      divElement.appendChild(statusTag);
    }
  }
  //firstPublishTime
  if (firstPublishTime) {
    var firstPublishTimeTag = document.createElement('span');
    var firstPublishTimeHumanReadable =
      convertTimeToHumanReadable(firstPublishTime);
    firstPublishTimeTag.innerHTML +=
      '【' + firstPublishTimeHumanReadable + '发布】';
    firstPublishTimeTag.classList.add('__time_tag_base_text_font');
    divElement.appendChild(firstPublishTimeTag);
  }
  //companyInfo
  var companyInfoTag = null;
  var companyInfoText = getCompanyInfoText(brandName);
  if (companyInfoText !== '') {
    companyInfoTag = document.createElement('span');
    companyInfoTag.innerHTML = companyInfoText;
    companyInfoTag.classList.add('__time_tag_base_text_font');
    divElement.appendChild(companyInfoTag);
  }
  //other
  divElement.style = getRenderTimeStyle(
    firstPublishTime ?? null,
    jobStatusDesc
  );
  if (jobDTO) {
    var firstBrowseTimeTag = document.createElement('div');
    var firstBrowseTimeHumanReadable = convertTimeOffsetToHumanReadable(
      jobDTO.createDatetime
    );
    firstBrowseTimeTag.innerHTML +=
      '【' +
      firstBrowseTimeHumanReadable +
      '看过(共' +
      jobDTO.browseCount +
      '次)】';
    firstBrowseTimeTag.classList.add('__time_tag_base_text_font');
    divElement.appendChild(firstBrowseTimeTag);
  }
  divElement.classList.add('__time_tag_base_text_font');
}

export function createLoadingDOM(brandName,styleClass) {
  const div = document.createElement("div");
  div.classList.add(styleClass);
  div.classList.add("__loading_tag");
  renderTimeLoadingTag(div, brandName);
  return div;
}

export function hiddenLoadingDOM() {
  var loadingTagList = document.querySelectorAll(".__loading_tag");
  if (loadingTagList) {
    loadingTagList.forEach((item) => {
      item.style = "visibility: hidden;";
    });
  }
}

export function renderTimeLoadingTag(divElement, brandName) {
  var timeText = '【正查找发布时间⌛︎】';
  var text = timeText;
  text += getCompanyInfoText(brandName);
  divElement.style = getRenderTimeStyle();
  divElement.classList.add('__time_tag_base_text_font');
  divElement.innerHTML = text;
}

function getCompanyInfoText(brandName) {
  var text = '';
  const isOutsourceBrand = isOutsource(brandName);
  const isTrainingBrand = isTraining(brandName);
  if (isOutsourceBrand) {
    text += '【疑似外包公司】';
  }
  if (isTrainingBrand) {
    text += '【疑似培训机构】';
  }
  if (isOutsourceBrand || isTrainingBrand) {
    text += '⛅';
  } else {
    text += '☀';
  }
  return text;
}

function getRenderTimeStyle(lastModifyTime, jobStatusDesc) {
  if (jobStatusDesc) {
    var offsetTimeDay;
    if (JOB_STATUS_DESC_NEWEST == jobStatusDesc) {
      offsetTimeDay = 7; // actual <7
    } else {
      offsetTimeDay = -1;
    }
  } else {
    if (lastModifyTime) {
      offsetTimeDay = dayjs().diff(dayjs(lastModifyTime), 'day');
    } else {
      lastModifyTime = -1;
    }
  }
  return (
    'background-color: ' + getTimeColorByOffsetTimeDay(offsetTimeDay) + ';'
  );
}

function getTimeColorByOffsetTimeDay(offsetTimeDay) {
  if (offsetTimeDay >= 0) {
    if (offsetTimeDay <= 7) {
      return 'yellowgreen';
    } else if (offsetTimeDay <= 14) {
      return 'green';
    } else if (offsetTimeDay <= 28) {
      return 'orange';
    } else if (offsetTimeDay <= 56) {
      return 'red';
    } else {
      return 'gray';
    }
  } else {
    return 'black';
  }
}

export function setupSortJobItem(node) {
  if (!node) return;
  node.style = 'display:flex;flex-direction: column;';
  //for zhilian
  const paginationNode = node.querySelector('.pagination');
  if (paginationNode) {
    paginationNode.style = 'order:99999;';
  }
}

export function renderSortJobItem(list, getListItem) {
  const idAndSortIndexMap = new Map();
  //sort updatetime
  const sortList = JSON.parse(JSON.stringify(list)).sort((o1, o2) => {
    return (
      dayjs(
        o2.lastModifyTime ??
          o2.lastModifyTime ??
          o2.updateDateTime ??
          o2.publishTime ??
          null
      ).valueOf() -
      dayjs(
        o1.lastModifyTime ??
          o1.lastModifyTime ??
          o1.updateDateTime ??
          o1.publishTime ??
          null
      ).valueOf()
    );
  });
  //sort firstBrowseDatetime
  sortList.sort((o1, o2) => {
    return (
      dayjs(o2.firstBrowseDatetime ?? null).valueOf() -
      dayjs(o1.firstBrowseDatetime ?? null).valueOf()
    );
  });
  //sort firstPublishTime
  sortList.sort((o1, o2) => {
    return (
      dayjs(
        o2.confirmDateString ?? o2.firstPublishTime ?? o2.createTime ?? null
      ).valueOf() -
      dayjs(
        o1.confirmDateString ?? o1.firstPublishTime ?? o1.createTime ?? null
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
    dom.style = 'order:' + idAndSortIndexMap.get(JSON.stringify(item));
  });
}
