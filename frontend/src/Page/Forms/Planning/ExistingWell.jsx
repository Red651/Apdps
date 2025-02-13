import React, { useEffect, useState } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Box,
  Grid,
} from "@chakra-ui/react";
import { getExistingWellList } from "../../../Page/API/APIKKKS";
import AsyncSelect from "react-select/async";
import { useParams } from "react-router-dom";
import { useJobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN } from "../../../Reducer/reducer";
import { initialData } from "../../../Reducer/initialData";

const ExistingWell = ({ formErrors = {}, dataExistingWell,initialData=null,TypeSubmit="create" }) => {
  const userID = JSON.parse(localStorage.getItem("user")).kkks_id;
  const [wellInstance, setWellInstance] = useState([]);
  const { state, dispatch } = useJobContext();
  const initialDataJobPlan = state.jobPlanExpDev?.job_plan;

   
  // 
  const { job_id } = useParams();
  const [selectedWell, setSelectedWell] = React.useState(null);
  // 
  

  useEffect(() => {
     

    const getData = async () => {
      const data = await getExistingWellList(userID);
      // 
      if (initialDataJobPlan.well_id && data.length > 0) {
        const initialWell = data.find((well) => well.value === initialDataJobPlan.well_id);
        // 
        
        if (initialWell) {
          setSelectedWell({
            value: initialWell.value,
            label: initialWell.name,
          });
        }
      }
      // 
      setWellInstance(data);
    };
    getData();
  }, [initialDataJobPlan]);
  const [formData, setFormData] = React.useState({
    well_id: "",
    onstream_gas: "",
    onstream_oil: "",
    onstream_water_cut: "",
    target_gas: "",
    target_water_cut: "",
    target_oil: "",
  });

  React.useEffect(() => {
  

    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN,
      payload: formData,
    });
  }, [formData]);
  // 
  React.useEffect(() => {
    

    if (TypeSubmit === "update" && initialData) {
      setFormData((prev) => ({
        ...prev,
        well_id: initialData?.well_id,
        onstream_gas: initialData?.onstream_gas,
        onstream_oil: initialData?.onstream_oil,
        onstream_water_cut: initialData?.onstream_water_cut,
        target_gas: initialData?.target_gas,
        target_water_cut: initialData?.target_water_cut,
        target_oil: initialData?.target_oil,
      }));
    }
  }, [TypeSubmit]);
  const handleChange = (field) => (e) => {
    
    // dataExistingWell({ [field]: e.target.value });
    setFormData((prevData) => ({ ...prevData, [field]: e.target.value }));
  };

  const handleChangeNumber = (field) => (e) => {
    // dataExistingWell({ [field]: Number(e.target.value) });
    setFormData((prevData) => ({
      ...prevData,
      [field]: Number(e.target.value),
    }));
  };

  // Function to filter well options with flexible search
  const filterWellOptions = (inputValue) => {
    return wellInstance
      .filter(
        (well) => well.name.toLowerCase().includes(inputValue.toLowerCase()) // Pastikan key-nya sesuai dengan data dari API
      )
      .map((well) => ({
        value: well.id,
        label: well.name, // Pastikan key-nya sesuai dengan data dari API
      }));
  };

  const loadOptions = (inputValue, callback) => {
    const filteredOptions = filterWellOptions(inputValue);
    callback(filteredOptions);
  };
 

  const handleWellChange = (selectedOption) => {
    setSelectedWell(selectedOption);

    handleChange("well_id")({ target: { value: selectedOption.value } });
  };
  return (
    <Box>
      {/* Searchable Dropdown for Existing Well */}
      <FormControl isInvalid={formErrors["well_id"]}>
        <FormLabel>Existing Well</FormLabel>
        <AsyncSelect
          cacheOptions
          loadOptions={loadOptions}
          defaultOptions={wellInstance.map((well) => ({
            value: well.value, // gunakan key 'id' yang benar sesuai API
            label: well.name, // gunakan key 'name' yang benar sesuai API
          }))}
          value={selectedWell}
          onChange={handleWellChange}
          placeholder="Select Existing Well"

          
        />
        {formErrors["well_id"] && (
          <FormErrorMessage>{formErrors["well_id"]}</FormErrorMessage>
        )}
      </FormControl>

      {/* Grid Layout for Onstream to Target Water Cut Fields */}
      <Grid templateColumns="repeat(2, 1fr)" gap={6} mt={4}>
        {/* Field Onstream Oil */}
        <FormControl isInvalid={formErrors["onstream_oil"]}>
          <FormLabel>Onstream Oil</FormLabel>
          <Input
            type="number"
            onChange={handleChangeNumber("onstream_oil")}
            value={formData.onstream_oil}
          />
          {formErrors["onstream_oil"] && (
            <FormErrorMessage>
              {formErrors["onstream_oil"]}
            </FormErrorMessage>
          )}
        </FormControl>

        {/* Field Onstream Gas */}
        <FormControl isInvalid={formErrors["onstream_gas"]}>
          <FormLabel>Onstream Gas</FormLabel>
          <Input
            type="number"
            onChange={handleChangeNumber("onstream_gas")}
            value={formData.onstream_gas}
          />
          {formErrors["onstream_gas"] && (
            <FormErrorMessage>
              {formErrors["onstream_gas"]}
            </FormErrorMessage>
          )}
        </FormControl>

        {/* Field Onstream Water Cut */}
        <FormControl isInvalid={formErrors["onstream_water_cut"]}>
          <FormLabel>Onstream Water Cut</FormLabel>
          <Input
            type="number"
            onChange={handleChangeNumber("onstream_water_cut")}
            value={formData.onstream_water_cut}
          />
          {formErrors["onstream_water_cut"] && (
            <FormErrorMessage>
              {formErrors["onstream_water_cut"]}
            </FormErrorMessage>
          )}
        </FormControl>

        {/* Field Target Oil */}
        <FormControl isInvalid={formErrors["target_oil"]}>
          <FormLabel>Target Oil</FormLabel>
          <Input
            type="number"
            onChange={handleChangeNumber("target_oil")}
            value={formData.target_oil}
          />
          {formErrors["target_oil"] && (
            <FormErrorMessage>
              {formErrors["target_oil"]}
            </FormErrorMessage>
          )}
        </FormControl>

        {/* Field Target Gas */}
        <FormControl isInvalid={formErrors["target_gas"]}>
          <FormLabel>Target Gas</FormLabel>
          <Input
            type="number"
            onChange={handleChangeNumber("target_gas")}
            value={formData.target_gas}
          />
          {formErrors["target_gas"] && (
            <FormErrorMessage>
              {formErrors["target_gas"]}
            </FormErrorMessage>
          )}
        </FormControl>

        {/* Field Target Water Cut */}
        <FormControl isInvalid={formErrors["target_water_cut"]}>
          <FormLabel>Target Water Cut</FormLabel>
          <Input
            type="number"
            onChange={handleChangeNumber("target_water_cut")}
            value={formData.target_water_cut}
          />
          {formErrors["target_water_cut"] && (
            <FormErrorMessage>
              {formErrors["target_water_cut"]}
            </FormErrorMessage>
          )}
        </FormControl>
      </Grid>
    </Box>
  );
};

export default ExistingWell;
