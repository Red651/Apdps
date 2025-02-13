import { getValidationValueOperation } from "../../../../API/APIKKKS";

const validationValue = async (data, job_id) => {
  if (!data) {
    return "No Data";
  }

  if (!job_id) {
    return "Job ID is required";
  }

  try {
    const validation = await getValidationValueOperation(job_id);
    return validation;
  } catch (error) {
    console.error("Validation result:", validation);
    throw error;
  }
};

export default validationValue;
