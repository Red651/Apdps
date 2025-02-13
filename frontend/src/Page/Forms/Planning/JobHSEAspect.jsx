import React, { useCallback, useEffect } from "react";
import CardFormK3 from "../Components/CardFormK3";
import FormControlCard from "../Components/FormControl";
import { Flex } from "@chakra-ui/react";
import { useJobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN } from "../../../Reducer/reducer";
import { useParams } from "react-router-dom";

const JobHSEAspect = ({
  handleChangeJobPlan = (e) => {
    console.log(e);
  },
  errorForms = {},
  TypeSubmit = "create",
  initialData = null,
}) => {
  const { state, dispatch } = useJobContext();
  const { job_id } = useParams();
  const jobPlanExpDev = state.jobPlanExpDev?.job_plan?.job_hse_aspect || null;
  // 
  // 

  const [data, setData] = React.useState({
    near_miss: null,
    fatality: null,
    spill: null,
    unsafe_condition: null,
    unsafe_action: null,
    man_hour: null,
  });

  React.useEffect(() => {
    if (TypeSubmit === "update" && initialData) {
      setData((prev) => ({
        ...prev,
        near_miss: initialData?.near_miss || null,
        fatality: initialData?.fatality || null,
        spill: initialData?.spill || null,
        unsafe_condition: initialData?.unsafe_condition || null,
        unsafe_action: initialData?.unsafe_action || null,
        man_hour: initialData?.man_hour || null,
      }));
    }
  }, [TypeSubmit]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      const numericValue = parseInt(value); // Ensure the value is a number
      setData((prev) => {
        const newData = {
          ...prev,
          [name]: numericValue,
        };

        // handleChangeJobPlan(newData); // Call handleChangeJobPlan with new data
        return newData;
      });
    },
    [data],
  );

  const dataNull = data.length === 0 ? null : data;
  useEffect(() => {
    // handleChangeJobPlan(data);
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN,
      payload: {
        job_hse_aspect: dataNull,
      },
    });
    // Call handleChangeJobPlan on initial render or when data changes
  }, [data]);

  return (
    <CardFormK3 title="Health Safety Environment Aspect" fontFamily={"Mulish"} my="6">
      <Flex gap={4}>
        <FormControlCard
          labelForm="Near Miss"
          type={"number"}
          errorMessage={errorForms.near_miss}
          isInvalid={!!errorForms.near_miss}
          placeholder="Near Miss"
          name="near_miss"
          value={data.near_miss}
          onChange={handleChange}
        />
        <FormControlCard
          labelForm="Fatality"
          type={"number"}
          errorMessage={errorForms.fatality}
          isInvalid={!!errorForms.fatality}
          placeholder="Fatality"
          name="fatality"
          value={data.fatality}
          onChange={handleChange}
        />
      </Flex>
      <Flex gap={4}>
        <FormControlCard
          labelForm="Spill"
          type={"number"}
          name="spill"
          errorMessage={errorForms.spill}
          isInvalid={!!errorForms.spill}
          placeholder="Spill"
          value={data.spill}
          onChange={handleChange}
        />
        <FormControlCard
          labelForm="Unsafe Condition"
          type={"number"}
          errorMessage={errorForms.unsafe_condition}
          isInvalid={!!errorForms.unsafe_condition}
          placeholder="Unsafe Condition"
          name="unsafe_condition"
          value={data.unsafe_condition}
          onChange={handleChange}
        />
      </Flex>
      <Flex gap={4}>
        <FormControlCard
          labelForm="Unsafe Action"
          type={"number"}
          errorMessage={errorForms.unsafe_action}
          isInvalid={!!errorForms.unsafe_action}
          placeholder="Unsafe Action"
          name="unsafe_action"
          value={data.unsafe_action}
          onChange={handleChange}
        />
        <FormControlCard
          labelForm="Man Hour"
          type={"number"}
          errorMessage={errorForms.man_hour}
          isInvalid={!!errorForms.man_hour}
          name="man_hour"
          placeholder="Man Hour"
          value={data.man_hour}
          onChange={handleChange}
        />
      </Flex>
    </CardFormK3>
  );
};

export default React.memo(JobHSEAspect);
