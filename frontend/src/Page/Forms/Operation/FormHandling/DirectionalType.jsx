import React, { useCallback, useEffect, useRef, useState } from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import { Flex, HStack, VStack } from "@chakra-ui/react";
import { FaOilWell } from "react-icons/fa6";
import { SelectComponent, SelectOption } from "../../Components/SelectOption";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";

const DirectionalType = ({ data }) => {
  const { state, dispatch } = useJobContext();
  const updateTimeoutRef = useRef(null);
  
  // Using local state for immediate UI updates
  const [formData, setFormData] = useState({
    well_directional_type: "",
    kick_off_point: 0,
    maximum_inclination: 0,
    azimuth: 0
  });

  const directionalTypeOptions = [
    { value: "J-TYPE", label: "J-TYPE" },
    { value: "S-TYPE", label: "S-TYPE" },
    { value: "HORIZONTAL", label: "HORIZONTAL" },
    { value: "VERTICAL", label: "VERTICAL" }, 
  ];

  useEffect(() => {
    if (state?.initialOperationData?.actual_job?.well) {
      const wellData = state.initialOperationData.actual_job.well;
      setFormData({
        well_directional_type: wellData.well_directional_type || "",
        kick_off_point: wellData.kick_off_point || 0,
        maximum_inclination: wellData.maximum_inclination || 0,
        azimuth: wellData.azimuth || 0
      });
    }
  }, [state?.initialOperationData?.actual_job?.well]);

  const updateGlobalState = useCallback((newData) => {
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: {
        ...state.initialOperationData,
        actual_job: {
          ...state.initialOperationData.actual_job,
          well: {
            ...state.initialOperationData.actual_job.well,
            ...newData
          }
        }
      }
    });
  }, [dispatch, state.initialOperationData]);

  const handleChange = useCallback((name, value) => {
    const numericValue = name === 'well_directional_type' ? value : Number(value);
    
    // Update local state immediately for responsive UI
    setFormData(prev => ({
      ...prev,
      [name]: numericValue
    }));

    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set new timeout for global state update
    updateTimeoutRef.current = setTimeout(() => {
      updateGlobalState({
        ...formData,
        [name]: numericValue
      });
    }, 300);
  }, [formData, updateGlobalState]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, []);

  return (
    <CardFormK3
      title="Directional"
      icon={FaOilWell}
      subtitle="Directional Type"
      iconColor="black"
      padding="18px 36px"
    >
      <Flex gap={2}>
        <SelectComponent
          value={formData.well_directional_type}
          onChange={(e) => handleChange("well_directional_type", e.target.value)}
        >
          {directionalTypeOptions.map((option, index) => (
            <SelectOption key={index} value={option.value} label={option.label} />
          ))}
        </SelectComponent>
      </Flex>
      <VStack>
        <FormControlCard
          type="number"
          labelForm="Kick Off Point"
          placeholder="Kick Off Point"
          name="kick_off_point"
          value={formData.kick_off_point}
          onChange={(e) => handleChange("kick_off_point", e.target.value)}
        />
      </VStack>
      <HStack>
        <FormControlCard
          type="number"
          labelForm="Maximum Inclination"
          placeholder="Maximum Inclination"
          name="maximum_inclination"
          value={formData.maximum_inclination}
          onChange={(e) => handleChange("maximum_inclination", e.target.value)}
        />
        <FormControlCard
          type="number"
          labelForm="Azimuth"
          placeholder="Azimuth"
          name="azimuth"
          value={formData.azimuth}
          onChange={(e) => handleChange("azimuth", e.target.value)}
        />
      </HStack>
    </CardFormK3>
  );
};

export default React.memo(DirectionalType);