import React, { useCallback, useEffect, useRef } from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import { Flex, HStack, VStack } from "@chakra-ui/react";
import { FaOilWell } from "react-icons/fa6";
import { SelectComponent, SelectOption } from "../../Components/SelectOption";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";

const WellProfile = () => {
  
  // const handleInputChange = (field, isJobPlanField = false) => (e) => {
  //   const value = e.target.value;

    // Update state lokal
    // switch (field) {
    //   case 'afe_number':
    //     setAfeNumber(value);
    //     break;
    //   case 'total_budget':
    //     setTotalBudget(value);
    //     break;
    //   case 'wpb_year':
    //     setWpbYear(value);
    //     break;
    //   case 'start_date':
    //     setStartDate(value);
    //     break;
    //   case 'rig_type':
    //     setRigType(value);
    //     break;
    //   case 'rig_name':
    //     setRigName(value);
    //     break;
    //   case 'rig_horse_power':
    //     setRigHorsePower(value);
    //     break;
    //   default:
    //     break;
    // }

    // Mengirim perubahan ke parent, menyesuaikan apakah field ada di dalam job_plan atau tidak
  //   if (isJobPlanField) {
  //     onChange(`job_plan.${field}`, value); // Field yang ada di dalam job_plan
  //   } else {
  //     onChange(field, value); // Field di luar job_plan
  //   }
  // };

  const { state, dispatch } = useJobContext();
  const dataRef = useRef({
    near_miss: 0,
    fatality: 0,
    spill: 0,
    unsafe_condition: 0,
    unsafe_action: 0,
    man_hour: 0,
  });

  useEffect(() => {
    if (state?.initialOperationData?.actual_job?.job_hse_aspect) {
      dataRef.current = state.initialOperationData.actual_job.job_hse_aspect;
    }
  }, [state]);

  const updateGlobalState = useCallback(() => {
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: {
        ...state.initialOperationData,
        actual_job: {
          ...state.initialOperationData.actual_job,
          job_hse_aspect: dataRef.current,
        },
      },
    });
  }, [dispatch, state.initialOperationData]);

  const debouncedUpdate = useCallback(() => {
    const timer = setTimeout(() => {
      updateGlobalState();
    }, 500);

    return () => clearTimeout(timer);
  }, [updateGlobalState]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    const numericValue = Number(value);
    dataRef.current = {
      ...dataRef.current,
      [name]: numericValue,
    };
    debouncedUpdate();
  }, [debouncedUpdate]);

  return (
    <CardFormK3
      title="Well Profile"
      icon={FaOilWell}
      subtitle="Well Profile"
      iconColor="black"
      padding="18px 36px"
    >
      <Flex gap={2}>
        {/* <FormControlCard
          
          labelForm="AFE Number"
          placeholder="AFE Number"
          value={afeNumber}
          onChange={handleInputChange('afe_number')}
          isDisabled // Field di luar job_plan
        /> */}
        <FormControlCard
          
          type="number"
          labelForm="Total Budget"
          placeholder="Total Budget"
          // value={totalBudget}
          // onChange={handleInputChange('total_budget', true)} // Field di dalam job_plan
        />
      </Flex>
      <VStack>
        <FormControlCard
          
          type="date"
          labelForm="Start Date"
          placeholder="Start Date"
          // value={startDate}
          // onChange={handleInputChange('start_date', true)} // Field di dalam job_plan
        />
      </VStack>
      <HStack>
        <SelectComponent label="Rig Type" placeholder="Rig Type"
          // value={rigType} onChange={handleInputChange('rig_type', true)}
        >
          <SelectOption value="FLOATER" label={"FLOATER"}/>
          <SelectOption value="SEMI-SUBMERSIBLE" label={"SEMI-SUBMERSIBLE"}/>
          <SelectOption value="DRILLSHIP" label={'DRILLSHIP'}/>
          <SelectOption value="JACK-UP" label={'JACK-UP'}/>
        </SelectComponent>
      </HStack>
      <VStack>
        <FormControlCard
          
          type="number"
          labelForm="Rig Horse Power"
          placeholder="Rig Horse Power"
          // value={rigHorsePower}
          inputRightOn="HP"
          // onChange={handleInputChange('rig_horse_power', true)} // Field di dalam job_plan
        />
      </VStack>
    </CardFormK3>
  );
};

export default WellProfile;
