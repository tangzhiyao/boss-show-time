import { infoLog, debugLog } from "../log";
import sqlite3InitModule, { Sqlite3Static } from "@sqlite.org/sqlite-wasm";
import { Job } from "@/data/domain/job";
import { Message } from "../api/message";
import dayjs from "dayjs";
import { JobDTO } from "@/data/dto/jobDTO";
import { toHump } from "../utils";
import { ChangeLogV1 } from "./changeLog/changeLogV1";
import { initChangeLog, getChangeLogList } from "./changeLog";
import { StatisticJobBrowseDTO } from "@/data/dto/statisticJobBrowseDTO";
import { SearchJobBO } from "@/data/bo/pageBO";
import { SearchJobDTO } from "@/data/dto/searchJobDTO";
import { bytesToBase64, base64ToBytes } from "@/utils/base64.js";
import JSZip from "jszip";
import { OFFSCREEN, WEB_WORKER } from "../api/bridgeCommon";

debugLog("worker ready");

const JOB_DB_FILE_NAME = "job.sqlite3";
const JOB_DB_PATH = "/" + JOB_DB_FILE_NAME;
let capi;
let oo;
let db;
let initializing = false;

export const WorkerBridge = {
  /**
   *
   * @param {*} message
   * @param {*} param
   */
  init: function (message, param) {
    debugLog("Loading and initializing sqlite3 module...");
    let changelogList = [];
    changelogList.push(new ChangeLogV1());
    initChangeLog(changelogList);
    sqlite3InitModule({
      print: debugLog,
      printErr: infoLog,
    }).then(function (sqlite3) {
      debugLog("Done initializing. Running app...");
      if (!initializing) {
        try {
          initDb(sqlite3);
          initializing = true;
          postSuccessMessage(message);
        } catch (e) {
          postErrorMessage(message, "init sqlite3 error : " + e.message);
        }
      } else {
        postSuccessMessage(message);
      }
    });
  },
  ping: function (message, param) {
    postSuccessMessage(message, "pong");
  },

  /**
   *
   * @param {Message} message
   * @param {Job[]} param
   */
  batchAddOrUpdateJobBrowse: function (message, param) {
    try {
      const now = new Date();
      db.exec({
        sql: "BEGIN TRANSACTION",
      });
      for (let i = 0; i < param.length; i++) {
        insertJobAndBrowseHistory(param[i], now);
      }
      db.exec({
        sql: "COMMIT",
      });
      postSuccessMessage(message, {});
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] addOrUpdateJobBrowse error : " + e.message
      );
    }
  },

  /**
   *
   * @param {Message} message
   * @param {Job} param
   */
  addOrUpdateJobBrowse: function (message, param) {
    try {
      const now = new Date();
      db.exec({
        sql: "BEGIN TRANSACTION",
      });
      insertJobAndBrowseHistory(param, now);
      db.exec({
        sql: "COMMIT",
      });
      postSuccessMessage(message, {});
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] addOrUpdateJobBrowse error : " + e.message
      );
    }
  },

  /**
   *
   * @param {*} message
   * @param {string[]} param
   *
   * @returns JobDTO[]
   */
  getJobBrowseInfoByIds: function (message, param) {
    try {
      let countMap = new Map();
      let ids = "'" + param.join("','") + "'";
      const SQL_QUERY_JOB_BOWSE_HISTORY_GROUP_COUNT =
        "SELECT job_id AS jobId ,count(*) AS total FROM job_browse_history WHERE job_id IN (" +
        ids +
        ") GROUP BY job_id;";
      let countRows = [];
      db.exec({
        sql: SQL_QUERY_JOB_BOWSE_HISTORY_GROUP_COUNT,
        rowMode: "object",
        resultRows: countRows,
      });
      for (let i = 0; i < countRows.length; i++) {
        let item = countRows[i];
        countMap.set(item.jobId, item.total);
      }
      let tempResultMap = new Map();
      const SQL_QUERY_JOB =
        "SELECT job_id,job_platform,job_url,job_name,job_company_name,job_location_name,job_address,job_longitude,job_latitude,job_description,job_degree_name,job_year,job_salary_min,job_salary_max,job_salary_total_month,boss_name,boss_company_name,boss_position,create_datetime,update_datetime FROM job WHERE job_id in (" +
        ids +
        ")";
      let rows = [];
      db.exec({
        sql: SQL_QUERY_JOB,
        rowMode: "object",
        resultRows: rows,
      });
      for (let i = 0; i < rows.length; i++) {
        let item = rows[i];
        let resultItem = new JobDTO();
        let keys = Object.keys(item);
        for (let n = 0; n < keys.length; n++) {
          let key = keys[n];
          resultItem[toHump(key)] = item[key];
        }
        tempResultMap.set(resultItem.jobId, resultItem);
      }
      let result = [];
      for (let j = 0; j < param.length; j++) {
        let jobId = param[j];
        let target = tempResultMap.get(jobId);
        if (target) {
          target.browseCount = countMap.get(jobId);
        }
        result.push(target);
      }
      postSuccessMessage(message, result);
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] getJobBrowseInfoByIds error : " + e.message
      );
    }
  },

  /**
   *
   * @param {Message} message
   * @param {SearchJobBO} param
   *
   * @returns SearchJobDTO
   */
  searchJob: function (message, param) {
    try {
      let result = new SearchJobDTO();
      let sqlQuery =
        "SELECT job_id AS jobId,job_platform AS jobPlatform,job_url AS jobUrl,job_name AS jobName,job_company_name AS jobCompanyName,job_location_name AS jobLocationName,job_address AS jobAddress,job_longitude AS jobLongitude,job_latitude AS jobLatitude,job_description AS jobDescription,job_degree_name AS jobDegreeName,job_year AS jobYear,job_salary_min AS jobSalaryMin,job_salary_max AS jobSalaryMax,job_salary_total_month AS jobSalaryTotalMonth,job_first_publish_datetime AS jobFirstPublishDatetime,boss_name AS bossName,boss_company_name AS bossCompanyName,boss_position AS bossPosition,create_datetime AS createDatetime,update_datetime AS updateDatetime FROM job";
      let sqlCount = "SELECT COUNT(*) AS total from job";
      let whereCondition = "";
      let orderBy = " ORDER BY create_datetime DESC";
      let limitStart = (param.pageNum - 1) * param.pageSize;
      let limitEnd = param.pageSize;
      let limit = " limit " + limitStart + "," + limitEnd;

      if (param.jobName) {
        whereCondition += " AND job_name LIKE '%" + param.jobName + "%' ";
      }
      if (param.jobCompanyName) {
        whereCondition +=
          " AND job_company_name LIKE '%" + param.jobCompanyName + "%' ";
      }
      if (param.startDatetime) {
        whereCondition +=
          " AND create_datetime >= '" +
          dayjs(param.startDatetime).format("YYYY-MM-DD HH:mm:ss") +
          "'";
      }
      if (param.endDatetime) {
        whereCondition +=
          " AND create_datetime < '" +
          dayjs(param.endDatetime).format("YYYY-MM-DD HH:mm:ss") +
          "'";
      }
      if (param.firstPublishStartDatetime) {
        whereCondition +=
          " AND job_first_publish_datetime >= '" +
          dayjs(param.firstPublishStartDatetime).format("YYYY-MM-DD HH:mm:ss") +
          "'";
      }
      if (param.firstPublishEndDatetime) {
        whereCondition +=
          " AND job_first_publish_datetime < '" +
          dayjs(param.firstPublishEndDatetime).format("YYYY-MM-DD HH:mm:ss") +
          "'";
      }
      if (whereCondition.startsWith(" AND")) {
        whereCondition = whereCondition.replace("AND", "");
        whereCondition = " WHERE " + whereCondition;
      }
      sqlQuery += whereCondition;
      sqlQuery += orderBy;
      sqlQuery += limit;
      let items = [];
      let total = 0;
      let queryRows = [];
      db.exec({
        sql: sqlQuery,
        rowMode: "object",
        resultRows: queryRows,
      });

      for (let i = 0; i < queryRows.length; i++) {
        let item = queryRows[i];
        let resultItem = new JobDTO();
        let keys = Object.keys(item);
        for (let n = 0; n < keys.length; n++) {
          let key = keys[n];
          resultItem[key] = item[key];
        }
        items.push(item);
      }

      //count
      sqlCount += whereCondition;
      let queryCountRows = [];
      db.exec({
        sql: sqlCount,
        rowMode: "object",
        resultRows: queryCountRows,
      });
      total = queryCountRows[0].total;

      result.items = items;
      result.total = total;
      postSuccessMessage(message, result);
    } catch (e) {
      postErrorMessage(message, "[worker] searchJob error : " + e.message);
    }
  },

  /**
   *
   * @param {Message} message
   * @param {*} param
   *
   * @returns {StatisticJobBrowseDTO}
   */
  statisticJobBrowse: function (message, param) {
    try {
      let result = new StatisticJobBrowseDTO();
      let now = dayjs();
      let todayStart = now.startOf("day").format("YYYY-MM-DD HH:mm:ss");
      let todayEnd = now
        .startOf("day")
        .add(1, "day")
        .format("YYYY-MM-DD HH:mm:ss");
      const SQL_QUERY_JOB_BOWSE_HISTORY_COUNT_TODAY =
        "SELECT COUNT(*) AS count FROM job_browse_history WHERE job_visit_datetime >= $startDatetime AND job_visit_datetime < $endDatetime";
      let browseCountToday = [];
      db.exec({
        sql: SQL_QUERY_JOB_BOWSE_HISTORY_COUNT_TODAY,
        rowMode: "object",
        resultRows: browseCountToday,
        bind: {
          $startDatetime: todayStart,
          $endDatetime: todayEnd,
        },
      });
      const SQL_QUERY_JOB_BOWSE_HISTORY_COUNT_TOTAL =
        "SELECT COUNT(*) AS count FROM job_browse_history";
      let browseTotalCount = [];
      db.exec({
        sql: SQL_QUERY_JOB_BOWSE_HISTORY_COUNT_TOTAL,
        rowMode: "object",
        resultRows: browseTotalCount,
      });
      const SQL_QUERY_JOB_COUNT_TOTAL = "SELECT COUNT(*) AS count FROM job;";
      let jobTotalCount = [];
      db.exec({
        sql: SQL_QUERY_JOB_COUNT_TOTAL,
        rowMode: "object",
        resultRows: jobTotalCount,
      });
      result.todayBrowseCount = browseCountToday[0].count;
      result.totalBrowseCount = browseTotalCount[0].count;
      result.totalJob = jobTotalCount[0].count;
      postSuccessMessage(message, result);
    } catch (e) {
      postErrorMessage(
        message,
        "[worker] statisticJobBrowse error : " + e.message
      );
    }
  },

  /**
   *
   * @param {*} message
   * @param { void } param
   */
  dbExport: async function (message, param) {
    try {
      let data = await capi.sqlite3_js_db_export(db);
      const zip = new JSZip();
      zip.file(JOB_DB_FILE_NAME, data);
      zip
        .generateAsync({
          compression: "DEFLATE",
          compressionOptions: { level: 9 },
          type: "uint8array",
        })
        .then(function (content) {
          postSuccessMessage(message, bytesToBase64(content));
        });
    } catch (e) {
      postErrorMessage(message, "[worker] dbExport error : " + e.message);
    }
  },

  /**
   *
   * @param {*} message
   * @param {string} param base64 zip file
   */
  dbImport: async function (message, param) {
    try {
      const zip = new JSZip();
      let zipContent = await zip.loadAsync(base64ToBytes(param));
      let dbContent;
      try {
        dbContent = await zipContent.file(JOB_DB_FILE_NAME).async("uint8array");
      } catch (e) {
        postErrorMessage(message, "file: " + JOB_DB_FILE_NAME + " not found");
        return;
      }
      let bytesToWrite = await oo.OpfsDb.importDb(JOB_DB_FILE_NAME, dbContent);
      postSuccessMessage(message, bytesToWrite);
    } catch (e) {
      postErrorMessage(message, "[worker] dbExport error : " + e.message);
    }
  },
};

const ACTION_FUNCTION = new Map();
let keys = Object.keys(WorkerBridge);
for (let i = 0; i < keys.length; i++) {
  let key = keys[i];
  ACTION_FUNCTION.set(key, WorkerBridge[key]);
}

function insertJobAndBrowseHistory(param, now) {
  let rows = [];
  const SQL_JOB_BY_ID = `SELECT job_id,job_platform,job_url,job_name,job_company_name,job_location_name,job_address,job_longitude,job_latitude,job_description,job_degree_name,job_year,job_salary_min,job_salary_max,job_salary_total_month,job_first_publish_datetime,boss_name,boss_company_name,boss_position,create_datetime,update_datetime FROM job WHERE job_id = ?`;
  db.exec({
    sql: SQL_JOB_BY_ID,
    rowMode: "object",
    bind: [param.jobId],
    resultRows: rows,
  });
  if (rows.length > 0) {
    //skip
  } else {
    const SQL_INSERT_JOB = `
  INSERT INTO job (job_id,job_platform,job_url,job_name,job_company_name,job_location_name,job_address,job_longitude,job_latitude,job_description,job_degree_name,job_year,job_salary_min,job_salary_max,job_salary_total_month,job_first_publish_datetime,boss_name,boss_company_name,boss_position,create_datetime,update_datetime) VALUES ($job_id,$job_platform,$job_url,$job_name,$job_company_name,$job_location_name,$job_address,$job_longitude,$job_latitude,$job_description,$job_degree_name,$job_year,$job_salary_min,$job_salary_max,$job_salary_total_month,$job_first_publish_datetime,$boss_name,$boss_company_name,$boss_position,$create_datetime,$update_datetime)
`;
    db.exec({
      sql: SQL_INSERT_JOB,
      bind: {
        $job_id: param.jobId,
        $job_platform: param.jobPlatform,
        $job_url: param.jobUrl,
        $job_name: param.jobName,
        $job_company_name: param.jobCompanyName,
        $job_location_name: param.jobLocationName,
        $job_address: param.jobAddress,
        $job_longitude: param.jobLongitude,
        $job_latitude: param.jobLatitude,
        $job_description: param.jobDescription,
        $job_degree_name: param.jobDegreeName,
        $job_year: param.jobYear,
        $job_salary_min: param.jobSalaryMin,
        $job_salary_max: param.jobSalaryMax,
        $job_salary_total_month: param.jobSalaryTotalMonth,
        $job_first_publish_datetime: dayjs(
          param.jobFirstPublishDatetime
        ).isValid()
          ? dayjs(param.jobFirstPublishDatetime).format("YYYY-MM-DD HH:mm:ss")
          : null,
        $boss_name: param.bossName,
        $boss_company_name: param.bossCompanyName,
        $boss_position: param.bossPosition,
        $create_datetime: dayjs(now).format("YYYY-MM-DD HH:mm:ss"),
        $update_datetime: dayjs(now).format("YYYY-MM-DD HH:mm:ss"),
      },
    });
  }
  const SQL_INSERT_JOB_BROWSE_HISTORY = `
INSERT INTO job_browse_history (job_id,job_visit_datetime,job_visit_type) VALUES ($job_id,$job_visit_datetime,$job_visit_type)
`;
  db.exec({
    sql: SQL_INSERT_JOB_BROWSE_HISTORY,
    bind: {
      $job_id: param.jobId,
      $job_visit_datetime: dayjs(now).format("YYYY-MM-DD HH:mm:ss"),
      $job_visit_type: "SEARCH",
    },
  });
}

/**
 *
 * @param {Sqlite3Static} sqlite3
 * @returns
 */
const initDb = async function (sqlite3) {
  capi = sqlite3.capi; // C-style API
  oo = sqlite3.oo1; // High-level OO API
  debugLog(
    "SQLite3 version",
    capi.sqlite3_libversion(),
    capi.sqlite3_sourceid()
  );
  if ("OpfsDb" in oo) {
    db = new oo.OpfsDb(JOB_DB_PATH);
    debugLog("[DB] The OPFS is available.");
    debugLog("[DB] Persisted db =" + db.filename);
  } else {
    db = new oo.DB(JOB_DB_PATH, "ct");
    debugLog("[DB] The OPFS is not available.");
    debugLog("[DB] transient db =" + db.filename);
  }
  infoLog("[DB] schema checking...");
  let changelogList = getChangeLogList();
  let oldVersion = 0;
  let newVersion = changelogList.length;
  try {
    const SQL_SELECT_SCHEMA_COUNT =
      "SELECT COUNT(*) AS count FROM sqlite_schema;";
    let schemaCount = 0;
    let schemaCountRow = [];
    db.exec({
      sql: SQL_SELECT_SCHEMA_COUNT,
      rowMode: "object",
      resultRows: schemaCountRow,
    });
    if (schemaCountRow.length > 0) {
      schemaCount = schemaCountRow[0].count;
    }
    infoLog("[DB] current schemaCount = " + schemaCount);
    if (schemaCount == 0) {
      const SQL_PRAGMA_AUTO_VACUUM = "PRAGMA auto_vacuum = 1";
      db.exec(SQL_PRAGMA_AUTO_VACUUM);
      infoLog("[DB] execute " + SQL_PRAGMA_AUTO_VACUUM);
    }
  } catch (e) {
    console.error("[DB] checking schema fail," + e.message);
    return;
  }
  try {
    db.exec({
      sql: "BEGIN TRANSACTION",
    });
    const SQL_CREATE_TABLE_VERSION = `
    CREATE TABLE IF NOT EXISTS version(
      num INTEGER
    )
  `;
    db.exec(SQL_CREATE_TABLE_VERSION);
    const SQL_QUERY_VERSION = "SELECT num FROM version";
    let rows = [];
    db.exec({
      sql: SQL_QUERY_VERSION,
      rowMode: "object",
      resultRows: rows,
    });
    if (rows.length > 0) {
      oldVersion = rows[0].num;
    } else {
      const SQL_INSERT_VERSION = `INSERT INTO version(num) values($num)`;
      db.exec({
        sql: SQL_INSERT_VERSION,
        bind: { $num: 0 },
      });
    }
    infoLog(
      "[DB] schema oldVersion = " + oldVersion + ", newVersion = " + newVersion
    );
    if (newVersion > oldVersion) {
      infoLog("[DB] schema upgrade start");
      for (let i = oldVersion; i < newVersion; i++) {
        let currentVersion = i + 1;
        let changelog = changelogList[i];
        let sqlList = changelog.getSqlList();
        infoLog(
          "[DB] schema upgrade changelog version = " +
            currentVersion +
            ", sql total = " +
            sqlList.length
        );
        for (let seq = 0; seq < sqlList.length; seq++) {
          infoLog(
            "[DB] schema upgrade changelog version = " +
              currentVersion +
              ", execute sql = " +
              (seq + 1) +
              "/" +
              sqlList.length
          );
          let sql = sqlList[seq];
          db.exec(sql);
        }
      }
      const SQL_UPDATE_VERSION = `UPDATE version SET num = $num`;
      db.exec({
        sql: SQL_UPDATE_VERSION,
        bind: { $num: newVersion },
      });
      infoLog("[DB] schema upgrade finish to version = " + newVersion);
      infoLog("[DB] current schema version = " + newVersion);
    } else {
      infoLog("[DB] skip schema upgrade");
      infoLog("[DB] current schema version = " + oldVersion);
    }
    db.exec({
      sql: "COMMIT",
    });
  } catch (e) {
    console.error("[DB] schema upgrade fail," + e.message);
    db.exec({
      sql: "ROLLBACK TRANSACTION",
    });
  }
};

onmessage = function (e) {
  let message = e.data;
  if (message) {
    if (message.from == OFFSCREEN && message.to == WEB_WORKER) {
      debugLog(
        "6.[worker][receive][" +
          message.from +
          " -> " +
          message.to +
          "] message [action=" +
          message.action +
          ",callbackId=" +
          message.callbackId +
          ",error=" +
          message.error +
          "]"
      );
      let action = message.action;
      debugLog("[worker] invoke action = " + action);
      ACTION_FUNCTION.get(action)(message, message.param);
    }
  }
};

function postSuccessMessage(message, data) {
  message.from = WEB_WORKER;
  message.to = OFFSCREEN;
  debugLog(
    "7.[worker][send][" +
      message.from +
      " -> " +
      message.to +
      "] message [action=" +
      message.action +
      ",callbackId=" +
      message.callbackId +
      ",error=" +
      message.error +
      "]"
  );
  let resultMessage = JSON.parse(JSON.stringify(message));
  resultMessage.data = data;
  postMessage({
    data: resultMessage,
  });
}

function postErrorMessage(message, error) {
  message.from = WEB_WORKER;
  message.to = OFFSCREEN;
  debugLog(
    "7.[worker][send][" +
      message.from +
      " -> " +
      message.to +
      "] message [action=" +
      message.action +
      ",callbackId=" +
      message.callbackId +
      ",error=" +
      message.error +
      "]"
  );
  infoLog(error);
  let resultMessage = JSON.parse(JSON.stringify(message));
  debugLog(resultMessage);
  resultMessage.error = error;
  postMessage({
    data: resultMessage,
  });
}
