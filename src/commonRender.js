import dayjs from "dayjs";
import { isOutsource } from "./data/outsource";
import { isTraining } from "./data/training";
import { convertTimeToHumanReadable } from "./utils";

export function renderTimeTag(divElement, lastModifyTime, brandName) {
  const timeHumanReadable = convertTimeToHumanReadable(lastModifyTime);
  const timeText = "【" + timeHumanReadable + "更新】";
  const offsetTimeDay = dayjs().diff(dayjs(lastModifyTime), "day");
  const isOutsourceBrand = isOutsource(brandName);
  const isTrainingBrand = isTraining(brandName);
  var text = timeText;
  var style =
    "color:white;font-size:12px;background-color: " +
    getTimeColorByoffsetTimeDay(offsetTimeDay) +
    ";";
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
  divElement.style = style;
  divElement.innerText = text;
}

function getTimeColorByoffsetTimeDay(offsetTimeDay) {
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
}
