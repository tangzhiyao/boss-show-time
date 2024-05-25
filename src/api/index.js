import { Job } from "../domain/Job";
import { JobDTO } from "../dto/jobDTO";
import { invoke } from "./bridge";

export const JobApi = {

    /**
     * 
     * @param {Job} job 
     */
    addOrUpdateJobBrowse: async function(job){
        await invoke(this.addOrUpdateJobBrowse.name,job);
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
    }
}