import { ChangeLog } from './changelog';
const SQL_CREATE_TABLE_JOB = `
  CREATE TABLE job(
    job_id TEXT PRIMARY KEY,
    job_platform TEXT,
    job_url TEXT, 
    job_name TEXT,
    job_company_name TEXT,
    job_location_name TEXT,
    job_address TEXT,
    job_longitude NUMERIC,
    job_latitude NUMERIC,
    job_description TEXT,
    job_degree_name TEXT,
    job_year TEXT,
    job_salary_min TEXT,
    job_salary_max TEXT,
    job_salary_total_month TEXT,
    boss_name TEXT,
    boss_company_name  TEXT,
    boss_position TEXT,
    data_source TEXT,
    create_datetime DATETIME,
    update_datetime DATETIME
  )
  `;

const SQL_CREATE_TABLE_JOB_BROWSE_HISTORY = `
  CREATE TABLE job_browse_history(
    job_id TEXT,
    job_visit_datetime DATETIME,
    job_visit_type TEXT
  )
  `;
export class ChangeLogV1 extends ChangeLog {
  getSqlList() {
    let sqlList = [SQL_CREATE_TABLE_JOB, SQL_CREATE_TABLE_JOB_BROWSE_HISTORY];
    return sqlList;
  }
}
