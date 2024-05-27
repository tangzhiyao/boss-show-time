import {
  PLATFORM_51JOB,
  PLATFORM_BOSS,
  PLATFORM_ID_PREFIX_51JOB,
  PLATFORM_LAGOU,
  PLATFORM_ZHILIAN,
  JOB_STATUS_DESC_NEWEST,
} from './common';
import { Job } from '@/data/domain/job';
import { JobApi } from './api';
import { infoLog } from './log';
import dayjs from 'dayjs';

const SALARY_MATCH = /(?<min>[0-9\.]*)\D*(?<max>[0-9\.]*)\D*(?<month>\d*)/;
const JOB_YEAR_MATCH = /(?<min>[0-9\.]*)\D*(?<max>[0-9\.]*)/;

export async function saveBrowseJob(list, platform) {
  infoLog(
    'saveBrowseJob start,record size = ' +
      list.length +
      ',platform = ' +
      platform
  );
  let jobs;
  if (PLATFORM_51JOB == platform) {
    jobs = handle51JobData(list);
  } else if (PLATFORM_BOSS == platform) {
    jobs = handleBossData(list);
  } else if (PLATFORM_ZHILIAN == platform) {
    jobs = handleZhilianData(list);
  } else if (PLATFORM_LAGOU == platform) {
    jobs = handleLagouData(list);
  } else {
    //skip
  }
  await JobApi.batchAddOrUpdateJobBrowse(jobs);
  infoLog('saveBrowseJob success,record size = ' + list.length);
}

function genId(id, platform) {
  return platform + '_' + id;
}

export function getJobIds(list, platform) {
  var result = [];
  for (let i = 0; i < list.length; i++) {
    let item = list[i];
    let jobId;
    if (PLATFORM_51JOB == platform) {
      jobId = item.jobId;
    } else if (PLATFORM_BOSS == platform) {
      jobId = item.value.zpData.jobInfo.encryptId;
    } else if (PLATFORM_ZHILIAN == platform) {
      jobId = item.jobId;
    } else if (PLATFORM_LAGOU == platform) {
      jobId = item.positionId;
    } else {
      //skip
    }
    result.push(genId(jobId, platform));
  }
  return result;
}

function handleLagouData(list) {
  let jobs = [];
  for (var i = 0; i < list.length; i++) {
    var job = new Job();
    var item = list[i];
    const {
      positionId,
      positionName,
      companyFullName,
      city,
      positionAddress,
      longitude,
      latitude,
      positionDetail,
      education,
      workYear,
      salary,
      publisherId,
      createTime,
    } = item;
    job.jobId = genId(positionId, PLATFORM_LAGOU);
    job.jobPlatform = PLATFORM_LAGOU;
    job.jobUrl = 'https://www.lagou.com/wn/jobs/' + positionId + '.html';
    job.jobName = positionName;
    job.jobCompanyName = companyFullName;
    job.jobLocationName = city;
    job.jobAddress = positionAddress;
    job.jobLongitude = longitude;
    job.jobLatitude = latitude;
    job.jobDescription = positionDetail;
    job.jobDegreeName = education;
    //handle job year
    let jobYearGroups = workYear.match(JOB_YEAR_MATCH)?.groups;
    if(jobYearGroups){
      job.jobYear = jobYearGroups.min;
    }else{
      //skip
    }
    //handle salary
    let groups = salary.match(SALARY_MATCH)?.groups;
    if(groups){
      //unit is K,1K = 1000
      job.jobSalaryMin = Number.parseInt(groups?.min)*1000;
      job.jobSalaryMax = Number.parseInt(groups?.max)*1000;
    }else{
      //skip
    }
    job.jobSalaryTotalMonth = null;
    job.jobFirstPublishDatetime = createTime;
    job.bossName = publisherId;
    job.bossCompanyName = companyFullName;
    job.bossPosition = null;
    jobs.push(job);
  }
  return jobs;
}

function handleZhilianData(list) {
  let jobs = [];
  for (var i = 0; i < list.length; i++) {
    var job = new Job();
    var item = list[i];
    const {
      jobId,
      positionUrl,
      name,
      companyName,
      workCity,
      streetName,
      jobSummary,
      education,
      workingExp,
      salaryReal,
      firstPublishTime,
      salaryCount,
    } = item;
    const { staffName, hrJob } = item.staffCard;
    job.jobId = genId(jobId, PLATFORM_ZHILIAN);
    job.jobPlatform = PLATFORM_ZHILIAN;
    job.jobUrl = positionUrl;
    job.jobName = name;
    job.jobCompanyName = companyName;
    job.jobLocationName = workCity;
    job.jobAddress = streetName;
    job.jobLongitude = null;
    job.jobLatitude = null;
    job.jobDescription = jobSummary;
    job.jobDegreeName = education;
    //handle job year
    let jobYearGroups = workingExp.match(JOB_YEAR_MATCH)?.groups;
    if(jobYearGroups){
      job.jobYear = jobYearGroups.min;
    }else{
      //skip
    }
    //handle salary
    let groups = salaryReal.match(SALARY_MATCH)?.groups;
    if(groups){
      job.jobSalaryMin = Number.parseInt(groups?.min);
      job.jobSalaryMax = Number.parseInt(groups?.max);
    }else{
      //skip
    }
    //handle salary month
    let groupsSalaryCount = salaryCount.match(/(?<count>\d*)/)?.groups;
    job.jobSalaryTotalMonth = groupsSalaryCount.count;
    job.jobFirstPublishDatetime = firstPublishTime;
    job.bossName = staffName;
    job.bossCompanyName = companyName;
    job.bossPosition = hrJob;
    jobs.push(job);
  }
  return jobs;
}

function handleBossData(list) {
  let jobs = [];
  for (var i = 0; i < list.length; i++) {
    var job = new Job();
    var item = list[i];
    let zpData = item.value.zpData;
    const { brandName } = zpData.brandComInfo;
    const { name, brandName: bossBranchName, title } = zpData.bossInfo;
    const {
      encryptId,
      jobName,
      locationName,
      address,
      longitude,
      latitude,
      postDescription,
      degreeName,
      experienceName,
      salaryDesc,
      jobStatusDesc,
      jobUrl,
    } = zpData.jobInfo;
    job.jobId = genId(encryptId, PLATFORM_BOSS);
    job.jobPlatform = PLATFORM_BOSS;
    job.jobUrl = jobUrl;
    job.jobName = jobName;
    job.jobCompanyName = brandName;
    job.jobLocationName = locationName;
    job.jobAddress = address;
    job.jobLongitude = longitude;
    job.jobLatitude = latitude;
    job.jobDescription = postDescription;
    job.jobDegreeName = degreeName;
    //handle job year
    let jobYearGroups = experienceName.match(JOB_YEAR_MATCH)?.groups;
    if(jobYearGroups){
      job.jobYear = jobYearGroups.min;
    }else{
      //skip
    }
    //handle salary
    let groups = salaryDesc.match(SALARY_MATCH)?.groups;
    if(groups){
      //unit is K,1K = 1000
      job.jobSalaryMin = Number.parseInt(groups?.min)*1000;
      job.jobSalaryMax = Number.parseInt(groups?.max)*1000;
      job.jobSalaryTotalMonth = groups?.month;
    }else{
      //skip
    }
    if(jobStatusDesc == JOB_STATUS_DESC_NEWEST.key){
      //招聘状态为最新，则代表一周内发布的岗位。记录入库的时间设置取今天零点。
      job.jobFirstPublishDatetime = dayjs(new Date()).startOf('day');
    }else{
      job.jobFirstPublishDatetime = null;
    }
    job.bossName = name;
    job.bossCompanyName = bossBranchName;
    job.bossPosition = title;
    jobs.push(job);
  }
  return jobs;
}

function handle51JobData(list) {
  let jobs = [];
  for (var i = 0; i < list.length; i++) {
    var job = new Job();
    var item = list[i];
    const {
      jobId,
      jobHref,
      jobName,
      fullCompanyName,
      jobAreaString,
      lat,
      lon,
      jobDescribe,
      degreeString,
      jobSalaryMin,
      jobSalaryMax,
      hrName,
      hrPosition,
      confirmDateString,
      provideSalaryString,
      workYearString,
    } = item;
    job.jobId = genId(jobId, PLATFORM_51JOB);
    job.jobPlatform = PLATFORM_51JOB;
    job.jobUrl = jobHref;
    job.jobName = jobName;
    job.jobCompanyName = fullCompanyName;
    job.jobLocationName = jobAreaString;
    job.jobAddress = jobAreaString;
    job.jobLongitude = lon;
    job.jobLatitude = lat;
    job.jobDescription = jobDescribe;
    job.jobDegreeName = degreeString;
    if(workYearString.endsWith("无需经验")){
      job.jobYear = 0;
    }else{
      let groups = workYearString.match(/(?<min>[0-9\.]*)/)?.groups;
      job.jobYear = groups.min;
    }    
    job.jobSalaryMin = jobSalaryMin;
    job.jobSalaryMax = jobSalaryMax;
    if(provideSalaryString.endsWith("薪")){
      let groups = provideSalaryString.match(SALARY_MATCH)?.groups;
      job.jobSalaryTotalMonth = groups.month;
    }else{
      job.jobSalaryTotalMont = "";
    }
    job.jobFirstPublishDatetime = confirmDateString;
    job.bossName = hrName;
    job.bossCompanyName = fullCompanyName;
    job.bossPosition = hrPosition;
    jobs.push(job);
  }
  return jobs;
}
