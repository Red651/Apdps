import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Divider,
  InputRightAddon,
  InputGroup,
  Icon,
  Flex,
  Text,
  Textarea,
  FormErrorMessage,
  InputLeftAddon,
} from "@chakra-ui/react";
import { Select as ChakraSelect } from "chakra-react-select";
import { IconBriefcase } from "@tabler/icons-react";
import { setDate } from "date-fns";
import { getAreaID, GetFieldID, getRigList } from "../../../API/APIKKKS";
import { useContext } from "react";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";

const ProposedJob = ({ TypeOperasional }) => {
  const { state, dispatch } = useJobContext();
  const [areaid, setAreaID] = useState([]);
  const [fieldid, setFieldID] = useState([]);
  const [rigList, setRigList] = useState([]);

  const WorkOverCategory = [
    { label: "Acid Fracturing", value: "Acid Fracturing" },
    { label: "Add Perforation", value: "Add Perforation" },
    { label: "New Zone Behind Pipe", value: "New Zone Behind Pipe" },
    { label: "Recompletion", value: "Recompletion" },
    { label: "Stimulation / Acidizing", value: "Stimulation / Acidizing" },
  ];

  const [formData, setFormData] = useState({
    area_id: null,
    field_id: null,
    contract_type: null,
    afe_number: null,
    wpb_year: null,
    actual_job: {
      rig_id: null,
      total_budget: null,
      start_date: null,
      end_date: null,
    },
    equipment: [
      {
        name: "",
        description: "",
      },
    ],
  });

  useEffect(() => {
    if (state?.initialOperationData) {
      setFormData((prevState) => ({
        ...prevState,
        ...state.initialOperationData,
      }));
    }
  }, [state?.initialOperationData]);

  // Fungsi helper untuk update nested object
  const updateNestedObject = (obj, path, value) => {
    const pathArray = path.split(".");
    const newObj = { ...obj };
    let current = newObj;

    for (let i = 0; i < pathArray?.length - 1; i++) {
      current[pathArray[i]] = { ...current[pathArray[i]] };
      current = current[pathArray[i]];
    }

    current[pathArray[pathArray?.length - 1]] = value;
    return newObj;
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;

    // Handle different types
    if (type === "number") {
      processedValue =
        value === ""
          ? null
          : value.includes(".")
            ? parseFloat(value)
            : parseInt(value, 10);
    } else if (type === "date") {
      processedValue = value === "" ? null : value;
    }

    let updatedFormData;
    // Handle nested fields for actual_job
    if (
      name === "rig_id" ||
      name === "start_date" ||
      name === "end_date" ||
      name === "total_budget"
    ) {
      updatedFormData = updateNestedObject(
        formData,
        `actual_job.${name}`,
        processedValue,
      );
    } else {
      updatedFormData = {
        ...formData,
        [name]: processedValue,
      };
    }

    setFormData(updatedFormData);

    // Dispatch to reducer with the complete updated state
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: updatedFormData,
    });
  };

  const handleRigChange = (selectedOption) => {
    const updatedFormData = updateNestedObject(
      formData,
      "actual_job.rig_id",
      selectedOption?.value || null,
    );

    setFormData(updatedFormData);
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: updatedFormData,
    });
  };

  const handleEquipmentChange = (index, e) => {
    const { name, value } = e.target;
    const updatedEquipment = [...formData.equipment];
    updatedEquipment[index] = {
      ...updatedEquipment[index],
      [name]: value,
    };

    const updatedFormData = {
      ...formData,
      equipment: updatedEquipment,
    };

    setFormData(updatedFormData);

    // Dispatch updated state including equipment
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: updatedFormData,
    });
  };

  const addEquipmentField = () => {
    const updatedFormData = {
      ...formData,
      equipment: [...formData.equipment, { name: "", description: "" }],
    };

    setFormData(updatedFormData);

    // Dispatch updated state including new equipment
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: updatedFormData,
    });
  };

  // API calls useEffects remain the same
  useEffect(() => {
    const fetchAreaID = async () => {
      try {
        const response = await getAreaID();
        setAreaID(response);
      } catch (error) {
        console.error("Error fetching Area ID", error);
      }
    };

    if (formData.area_id) {
      const fetchFieldID = async () => {
        try {
          const response = await GetFieldID(formData.area_id);
          setFieldID(response);
        } catch (error) {
          console.error("Error fetching Field ID", error);
        }
      };
      fetchFieldID();
    }

    fetchAreaID();
  }, [formData.area_id]);

  useEffect(() => {
    const fetchRigList = async () => {
      try {
        const response = await getRigList();
        const formattedResponse = response.map((rig) => ({
          value: rig.value,
          label: rig.name,
        }));
        setRigList(formattedResponse);
      } catch (error) {
        console.error("Error fetching Rig List", error);
      }
    };
    fetchRigList();
  }, []);

  return (
    <Box borderWidth="1px" borderRadius="lg" p={6} fontFamily={"Mulish"}>
      <Flex alignItems="center" mb={6}>
        <Icon as={IconBriefcase} boxSize={12} color="gray.800" mr={3} />
        <Flex flexDirection={"column"}>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="gray.700"
            fontFamily={"Mulish"}
          >
            {"Actual Job"}
          </Text>
          <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
            {"subtitle"}
          </Text>
        </Flex>
      </Flex>
      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Area</FormLabel>
            <Select
              name="area_id"
              onChange={handleChange}
              value={formData.area_id}
              disabled
            >
              <option value="" disabled selected>
                {" "}
                Select Area
              </option>
              {areaid?.length > 0 &&
                areaid.map((item) => (
                  <option value={item.value}>{item.name}</option>
                ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Field</FormLabel>
            <Select
              name="field_id"
              onChange={handleChange}
              value={formData.field_id}
              disabled
            >
              <option value="" disabled selected>
                Select Field
              </option>
              {fieldid?.length > 0 &&
                fieldid.map((item) => (
                  <option value={item.value}>{item.name}</option>
                ))}
            </Select>
          </FormControl>
        </HStack>
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Contract Type</FormLabel>
            <Select
              name="contract_type"
              value={formData.contract_type}
              onChange={handleChange}
              disabled
            >
              <option value="" disabled selected>
                Select Contract Type
              </option>
              <option value="COST-RECOVERY">COST-RECOVERY</option>
              <option value="GROSS-SPLIT">GROSS-SPLIT</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>AFE Number</FormLabel>
            <Input
              name="afe_number"
              value={formData.afe_number}
              onChange={handleChange}
              placeholder="AFE Number"
              disabled
            />
          </FormControl>
          
        </HStack>
        <HStack spacing={4}>
        <FormControl>
            <FormLabel>Total Budget</FormLabel>
            <InputGroup>
              <InputLeftAddon>USD</InputLeftAddon>
              <Input
                name="total_budget"
                type="number"
                onChange={handleChange}
                placeholder="Total Budget"
                value={formData.actual_job.total_budget}
              />
            </InputGroup>
          </FormControl>
          <FormControl>
            <FormLabel>WP&B Year</FormLabel>
            <InputGroup>
              <Input
                name="wpb_year"
                type="number"
                onChange={handleChange}
                value={formData.wpb_year}
                placeholder="WPNB Year"
                disabled
              />
            </InputGroup>
          </FormControl>
        </HStack>
      </VStack>
      <Divider my={10} borderWidth="1px" borderColor={"gray.200"} />

      <VStack spacing={4} align="stretch">
        {TypeOperasional === "WORKOVER" || TypeOperasional === "WELLSERVICE" ? (
          <>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>
                  {(TypeOperasional === "WORKOVER" && "Workover Job Type") ||
                    (TypeOperasional === "WELLSERVICE" &&
                      "Well Service Job Type")}
                </FormLabel>
                <Select
                  name="job_category"
                  value={formData.job_category}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      job_category: e.target.value,
                    }));
                  }}
                >
                  <option value="Select Work Over Job Tyoe" disabled></option>
                  {WorkOverCategory.map((item, index) => (
                    <option key={index} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Job Description</FormLabel>
                <Textarea
                  name="job_description"
                  type="text"
                  value={formData.job_description}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      job_description: e.target.value,
                    }));
                  }}
                  placeholder="Job Description"
                />
              </FormControl>
            </VStack>

            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Equipment</FormLabel>
                <Input
                  name="equipment"
                  type="text"
                  value={formData.equipment}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      equipment: e.target.value,
                    }));
                  }}
                  placeholder="Equipment"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Equipment Spesification</FormLabel>
                <Input
                  name="equipment_specifications"
                  type="text"
                  value={formData.equipment_specifications}
                  onChange={(e) => {
                    setFormData((prev) => ({
                      ...prev,
                      equipment_specifications: e.target.value,
                    }));
                  }}
                  placeholder="Equipment Spesification"
                />
              </FormControl>
            </HStack>
          </>
        ) : (
          <>
            <HStack spacing={4}>
              <FormControl>
                <FormLabel>Rig</FormLabel>
                <ChakraSelect
                  name="rig_id"
                  value={rigList.find(
                    (option) => option.value === formData.actual_job.rig_id,
                  )}
                  onChange={handleRigChange}
                  options={rigList}
                  placeholder="Select Rig"
                  isClearable
                  isSearchable
                />
              </FormControl>
            </HStack>
          </>
        )}
      </VStack>
    </Box>
  );
};

export default ProposedJob;
