import { DeleteJobPlanning } from "../../API/PostKkks";

export const handleDelete = async (job_id) => {
    try {
      const response = await DeleteJobPlanning(job_id);
      return {
        data: response.data,
        message: "Job deleted successfully",
        status: response.status,
      };
    } catch (error) {
      throw {
        message: "Error deleting job",
        error,
      };
    }
  };