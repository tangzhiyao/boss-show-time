import { Job } from "../domain/job";
import { JobDTO } from "../dto/jobDTO";
import { invoke } from "./bridge";
import { StatisticJobBrowseDTO } from "../dto/statisticJobBrowseDTO"; 
import { SearchJobBO } from "../bo/searchJobBO";
import { SearchJobDTO } from "../dto/searchJobDTO";

export const JobApi = {


    /**
     * 
     * @param {Job[]} jobs 
     */
    batchAddOrUpdateJobBrowse: async function(jobs){
        await invoke(this.batchAddOrUpdateJobBrowse.name,jobs);
    },

    /**
     * 
     * @param {Job} job 
     */
    addOrUpdateJobBrowse: async function(job){
        await invoke(this.addOrUpdateJobBrowse.name,job);
    },

    /**
     * 
     * @param {SearchJobBO[]} param 
     * 
     * @returns {SearchJobDTO[]}
     */
    searchJob: async function(param){
        var result = await invoke(this.searchJob.name,param);
        return result.data;
    },

    /**
     * 
     * @param {string[]} ids 
     * 
     * @returns {JobDTO[]}
     */
    getJobBrowseInfoByIds: async function(ids){
        var result = await invoke(this.getJobBrowseInfoByIds.name,ids);
        return result.data;
    },

    /**
     * 
     * @returns {StatisticJobBrowseDTO}
     */
    statisticJobBrowse: async function(){
        var result = await invoke(this.statisticJobBrowse.name,{});
        return result.data;
    }
}