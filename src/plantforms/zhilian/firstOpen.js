import {
  setupSortJobItem,
  renderSortJobItem,
  createLoadingDOM,
  hiddenLoadingDOM,
} from '../../commonRender';
import { createDOM } from './index';
import { PLATFORM_ZHILIAN } from '../../common';
import { saveBrowseJob, getJobIds } from '../../commonDataHandler';
import { JobApi } from '../../api';

// 智联招聘首次打开页面时是服务端渲染，没法监听接口，但是 html 中保存了列表数据
export default async function firstOpen(data) {
  const dom = document.querySelector('.positionlist');
  setupSortJobItem(dom);
  const children = dom?.children;
  const { positionList = [] } = data;
  if (!children || !positionList || positionList.lenth === 0) return;
  positionList.forEach((item, index) => {
    const dom = children?.[index];
    const { companyName } = item;
    let loadingLastModifyTimeTag = createLoadingDOM(
      companyName,
      '__zhilian_time_tag'
    );
    dom.appendChild(loadingLastModifyTimeTag);
  });
  await saveBrowseJob(positionList, PLATFORM_ZHILIAN);
  let jobDTOList = await JobApi.getJobBrowseInfoByIds(
    getJobIds(positionList, PLATFORM_ZHILIAN)
  );
  positionList.forEach((item, index) => {
    const { publishTime, companyName, jobSummary, firstPublishTime } = item;
    const dom = children?.[index];
    item['firstBrowseDatetime'] = jobDTOList[index].createDatetime;
    if (!dom) return;

    let tag = createDOM(
      publishTime,
      companyName,
      jobSummary,
      firstPublishTime,
      jobDTOList[index]
    );
    dom.appendChild(tag);
  });
  hiddenLoadingDOM();
  renderSortJobItem(positionList, (index) => {
    return children?.[index];
  });
}
