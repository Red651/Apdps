import { useEffect, useState } from "react";
import { getValidationValueOperation } from "../../../../API/APIKKKS";

const useFetchFinishOperations = (job_id) => {
  const [listFinishOperations, setListFinishOperations] = useState([]);
  const [fetchError, setFetchError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getValidationValueOperation(job_id);
        setListFinishOperations(response.data);
      } catch (error) {
        setFetchError(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (job_id) {
      fetchData();
    }
  }, [job_id]);

  return { listFinishOperations, fetchError, isLoading };
};

export default useFetchFinishOperations;
