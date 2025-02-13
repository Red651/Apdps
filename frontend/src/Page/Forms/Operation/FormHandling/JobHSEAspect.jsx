import React, { useCallback, useEffect, useRef, useState } from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import { Flex } from "@chakra-ui/react";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";

const JobHSEAspect = () => {
  const { state, dispatch } = useJobContext();
  const [localData, setLocalData] = useState({
    near_miss: null,
    fatality: null,
    spill: null,
    unsafe_condition: null,
    unsafe_action: null,
    man_hour: null,
  });
  
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    if (state?.initialOperationData?.actual_job?.job_hse_aspect) {
      setLocalData(state.initialOperationData.actual_job?.job_hse_aspect);
    }
  }, [state]);

  const updateGlobalState = useCallback((newData) => {
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: {
        ...state.initialOperationData,
        actual_job: {
          ...state.initialOperationData.actual_job,
          job_hse_aspect : newData,
        },
      },
    });
  }, [dispatch, state.initialOperationData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const numericValue = Number(value);

    setLocalData(prev => ({
      ...prev,
      [name]: numericValue
    }));

    // Clear any existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set new timeout
    updateTimeoutRef.current = setTimeout(() => {
      updateGlobalState({
        ...localData,
        [name]: numericValue
      });
    }, 500);
  }, [updateGlobalState, localData]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <CardFormK3 title="Health Safety Environment Aspect" my="6">
      <Flex gap={4}>
        <FormControlCard
          labelForm="Near Miss"
          type="number"
          name="near_miss"
          value={localData.near_miss}
          onChange={handleChange}
        />
        <FormControlCard
          labelForm="Fatality"
          type="number"
          name="fatality"
          value={localData.fatality}
          onChange={handleChange}
        />
      </Flex>
      <Flex gap={4}>
        <FormControlCard
          labelForm="Spill"
          type="number"
          name="spill"
          value={localData.spill}
          onChange={handleChange}
        />
        <FormControlCard
          labelForm="Unsafe Condition"
          type="number"
          name="unsafe_condition"
          value={localData.unsafe_condition}
          onChange={handleChange}
        />
      </Flex>
      <Flex gap={4}>
        <FormControlCard
          labelForm="Unsafe Action"
          type="number"
          name="unsafe_action"
          value={localData.unsafe_action}
          onChange={handleChange}
        />
        <FormControlCard
          labelForm="Man Hour"
          type="number"
          name="man_hour"
          value={localData.man_hour}
          onChange={handleChange}
        />
      </Flex>
    </CardFormK3>
  );
};

export default React.memo(JobHSEAspect);