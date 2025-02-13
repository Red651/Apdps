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
  Button,
} from "@chakra-ui/react";
import { IconBriefcase } from "@tabler/icons-react";
import { setDate } from "date-fns";
import { getAreaID, GetFieldID } from "../../API/APIKKKS";
import { useContext } from "react";
import { JobContext, useJobContext } from "../../../Context/JobContext";
import {
  ADD_JOB_EXP_DEV,
  ADD_JOB_EXP_DEV_JOB_PLAN,
} from "../../../Reducer/reducer";
import { useParams } from "react-router-dom";
import { SelectComponent, SelectOption } from "../Components/SelectOption";
import { FetchReusable } from "../../API/FetchReusable";
import { useQuery } from "@tanstack/react-query";
const ProposedJob = ({
  handleChangeJob = (e) => {
    console.log(e, "RajsbxcobPlan");
  },
  children,
  TypeSubmit = "create",
  initialData=null,
  handleChangeJobPlan = (e) => {
    console.log("HandKJJAsdasdJobPlan", e);
  },
  TypeOperasional,
  errorForms = {},
}) => {

  //  
  const { job_id } = useParams();
  const { state, dispatch } = useJobContext();
  const [areaid, setAreaID] = useState([]);
  const [fieldid, setFieldID] = useState([]);
  const jobPlanState = state.jobPlanExpDev || {};
  // const { rigId, setRigId } = useState(null);
  const headersRequest = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const headersAuthorization = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}` || null,
    },
  };

 
  const {
    data: rigData,
    error: rigError,
    isLoading: rigIsLoading,
  } = useQuery({
    queryKey: ["rig"],
    queryFn: () => FetchReusable("/rig/list", "get", headersRequest),
    // enabled: false,
    retryDelay: 5000,
    retry: 3,
  });

  // 

  // 
  // 
  //

  const fieldId = [
    {
      name: "FIELD 1",
      value: "FIELD 1",
    },
    {
      name: "FIELD 2",
      value: "FIELD 2",
    },
    {
      name: "FIELD 3",
      value: "FIELD 3",
    },
    {
      name: "FIELD 4",
      value: "FIELD 4",
    },
    {
      name: "FIELD 5",
      value: "FIELD 5",
    },
  ];

  // 
  const enum_name =
    (TypeOperasional === "WORKOVER") && "workover_job_category" ||
    (TypeOperasional === "WELLSERVICE") && "wellservice_job_category";
  
  //  

  const {
    data: WoWsCategory,
    error: WoWsCategoryError,
    isLoading: WoWsCategoryIsLoading,
  } = useQuery({
    queryKey: ["WoWsCategory"],
    queryFn: () =>
      FetchReusable(`/utils/options/${enum_name}`, "get", headersAuthorization),
    refetchOnMount: true, // Refetch setiap kali komponen di-mount
    enabled: !!enum_name,
    // refetchOnWindowFocus: true, // Refetch ketika jendela mendapatkan fokus
    staleTime: 0,
  });

  //  
  // const [WoWsCategory, setWoWsCategory] = useState([]);
  // React.useEffect(() => {
  //   const FetchJobCategory = async () => {
  //     try {
  //       const res = await FetchReusable(`/utils/options/${enum_name}`, "get", headersAuthorization)
  //       
  //       setWoWsCategory(res)
  //     } catch (error) {

  //     }
  //   }
  //   FetchJobCategory()
  // }, [enum_name]);
console.error(errorForms)
  
  const WorkOverCategory = [
    { label: "Acid Fracturing", value: "Acid Fracturing" },
    { label: "Add Perforation", value: "Add Perforation" },
    {
      label: "Aditional Perfor & New Perfo",
      value: "Aditional Perfor & New Perfo",
    },
    { label: "CTG", value: "CTG" },
    { label: "CTI", value: "CTI" },
    { label: "CTO", value: "CTO" },
    { label: "Change Layer", value: "Change Layer" },
    {
      label: "Conversion from Injector to Producer",
      value: "Conversion from Injector to Producer",
    },
    { label: "Convert to Injector", value: "Convert to Injector" },
    { label: "ESP Installation", value: "ESP Installation" },
    { label: "Fract Pack", value: "Fract Pack" },
    { label: "Fracturing", value: "Fracturing" },
    { label: "GLV Installation", value: "GLV Installation" },
    { label: "GTO", value: "GTO" },
    { label: "HPU Installation", value: "HPU Installation" },
    { label: "Hydraulic Fracturing", value: "Hydraulic Fracturing" },
    { label: "Install ESP", value: "Install ESP" },
    { label: "Install HPU", value: "Install HPU" },
    { label: "New Perforation", value: "New Perforation" },
    { label: "New Zone Behind Pipe", value: "New Zone Behind Pipe" },
    { label: "P&A", value: "P&A" },
    { label: "PCTGL", value: "PCTGL" },
    { label: "POP", value: "POP" },
    { label: "Put On Production", value: "Put On Production" },
    {
      label: "Re-perforation & Acid Fracturing",
      value: "Re-perforation & Acid Fracturing",
    },
    { label: "Reactivation Well", value: "Reactivation Well" },
    {
      label: "Reactivation and Recompletion",
      value: "Reactivation and Recompletion",
    },
    { label: "Recompletion", value: "Recompletion" },
    {
      label: "Recompletion and Reperforation",
      value: "Recompletion and Reperforation",
    },
    { label: "Retubing", value: "Retubing" },
    { label: "SCON", value: "SCON" },
    { label: "SRP Installation", value: "SRP Installation" },
    {
      label: "Sand Cleanout - Add Perforation - Sand Screen",
      value: "Sand Cleanout - Add Perforation - Sand Screen",
    },
    {
      label: "Stimulation & Change Layer",
      value: "Stimulation & Change Layer",
    },
    { label: "Stimulation / Acidizing", value: "Stimulation / Acidizing" },
    { label: "Thru Tubing Perforation", value: "Thru Tubing Perforation" },
    {
      label: "Water Shut Off & Change Layer",
      value: "Water Shut Off & Change Layer",
    },
  ];
  const [formData, setFormData] = useState({
    area_id: null,
    field_id: null,
    contract_type: null,
    afe_number: null,
    wpb_year: null,
  });

  useEffect(() => {
    if (TypeSubmit === "update") {
      setFormData({
        area_id: initialData?.area_id || null,
        field_id: initialData?.field_id || null,
        contract_type: initialData?.contract_type || null,
        afe_number: initialData?.afe_number || null,
        wpb_year: initialData?.wpb_year || null,
      });
    }
  }, [TypeSubmit]);

  useEffect(() => {
    if (TypeSubmit === "update") {
      setDateChange({
        start_date: initialData.job_plan.start_date || null,
        end_date: initialData.job_plan.end_date || null,
        rig_id: initialData.job_plan.rig_id || null,
        total_budget: initialData.job_plan.total_budget || 0,
        rig_horse_power: initialData.job_plan.rig_horse_power || 0,
        job_category: initialData.job_plan.job_category || null,
        equipment: initialData.job_plan.equipment || null,
        equipment_specifications:
          initialData.job_plan.equipment_specifications || null,
      });
    }
  }, [TypeSubmit]);

  const [DateChange, setDateChange] = useState({
    start_date: null,
    end_date: null,
    rig_id: null,
    total_budget: 0,
  });

  useEffect(() => {
    dispatch({
      type: ADD_JOB_EXP_DEV,
      payload: formData,
    });
  }, [formData]);

  useEffect(() => {
    
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN,
      payload: DateChange,
    });
  }, [DateChange]);

  //  
  React.useEffect(() => {
    const GetAreaID = async () => {
      try {
        const response = await getAreaID();
        // 

        setAreaID(response);
      } catch (error) {
        console.error("Error get Area ID", error);
      }
    };
    if (formData.area_id) {
      const getFieldID = async () => {
        try {
          const response = await GetFieldID(formData.area_id);
          

          setFieldID(response);
        } catch (error) {
          console.error("Error get Area ID", error);
        }
      };
      getFieldID();
    }

    GetAreaID();
  }, [formData.area_id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue;

    // Periksa tipe input
    if (type === "number") {
      // Jika input tipe number, periksa apakah ada titik desimal untuk menentukan apakah itu float
      processedValue = value.includes(".")
        ? parseFloat(value)
        : parseInt(value, 10);

      // Jika value tidak valid atau kosong, default ke 0
      if (isNaN(processedValue)) {
        processedValue = 0;
      }
    } else {
      // Jika tipe selain number, anggap sebagai string
      processedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };
  // 

  const handleRig = (e) => {
    const { name, value, type } = e.target;

    let processedValue;

    // Periksa tipe input
    if (type === "number") {
      // Jika input tipe number, periksa apakah ada titik desimal untuk menentukan apakah itu float
      processedValue = value.includes(".")
        ? parseFloat(value)
        : parseInt(value, 10);

      // Jika value tidak valid atau kosong, default ke 0
      if (isNaN(processedValue)) {
        processedValue = 0;
      }
    } else {
      // Jika tipe selain number, anggap sebagai string
      processedValue = value;
    }

    handleChangeRigType({
      [name]: processedValue,
    });
  };
  const handleDateChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue;

    // Validasi berdasarkan tipe
    if (type === "number") {
      // Cek apakah nilai berisi titik desimal (float) atau tidak (integer)
      processedValue = value.includes(".")
        ? parseFloat(value)
        : parseInt(value, 10);
    } else if (type === "text" || !type) {
      // Jika tipe adalah text atau tidak ada tipe, jadikan string
      processedValue = value;
    } else {
      // Default jika tidak dikenal
      processedValue = value;
    }

    // Set state
    setDateChange((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

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
            {"Proposed Job"}
          </Text>
          <Text fontSize="md" color="red.500" fontFamily={"Mulish"}>
            {"*Required"}
          </Text>
        </Flex>
      </Flex>
      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <FormControl isInvalid={!!errorForms["area_id"]}>
            <FormLabel>Area</FormLabel>
            <Select
              name="area_id"
              onChange={handleChange}
              value={formData.area_id}
            >
              <option value="" disabled selected>
                {" "}
                Select Area
              </option>
              {areaid &&
                areaid.length > 0 &&
                areaid.map((item, index) => (
                  <option key={index} value={item.value}>
                    {item.name}
                  </option>
                ))}
            </Select>
            {errorForms["area_id"] && (
              <FormErrorMessage>Area ID is required</FormErrorMessage>
            )}
          </FormControl>
          <FormControl
            isInvalid={!!errorForms["field_id"]}
            value={formData.field_id}
          >
            <FormLabel>Field</FormLabel>
            <Select
              name="field_id"
              onChange={handleChange}
              value={formData.field_id}
            >
              <option value="" disabled selected>
                Select Field
              </option>
              {fieldId &&
                fieldId.length > 0 &&
                fieldid.map((item, index) => (
                  <option key={index} value={item.value}>
                    {item.name}
                  </option>
                ))}
            </Select>
            {errorForms["field_id"] && (
              <FormErrorMessage>Field ID is required</FormErrorMessage>
            )}
          </FormControl>
        </HStack>
        <HStack spacing={4}>
          <FormControl isInvalid={!!errorForms["contract_type"]}>
            <FormLabel>Contract Type</FormLabel>
            <Select
              name="contract_type"
              value={formData.contract_type}
              onChange={handleChange}
            >
              <option value="" disabled selected>
                Select Contract Type
              </option>
              <option value="COST-RECOVERY">COST-RECOVERY</option>
              <option value="GROSS-SPLIT">GROSS-SPLIT</option>
            </Select>
            {errorForms["contract_type"] && (
              <FormErrorMessage>Contract Type is required</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={!!errorForms["afe_number"]}>
            <FormLabel>AFE Number</FormLabel>
            <Input
              name="afe_number"
              value={formData.afe_number}
              onChange={handleChange}
              placeholder="AFE Number"
            />
            {errorForms["afe_number"] && (
              <FormErrorMessage>AFE Number is required</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={!!errorForms["total_budget"]}>
            <FormLabel>Total Budget</FormLabel>
            <InputGroup>
              <InputLeftAddon>USD</InputLeftAddon>
              <Input
                name="total_budget"
                type="number"
                // max={3}
                value={DateChange.total_budget}
                onChange={handleDateChange}
                placeholder="Total Budget"
              />
              
            </InputGroup>
            {errorForms["total_budget"] && (
                <FormErrorMessage>Total Budget is required</FormErrorMessage>
              )}
          </FormControl>
        </HStack>
        <HStack spacing={4}>
          <FormControl isInvalid={!!errorForms["wpb_year"]}>
            <FormLabel>WP&B Year</FormLabel>
            <InputGroup>
              <Input
                name="wpb_year"
                type="number"
                value={formData.wpb_year}
                onChange={handleChange}
                placeholder="WPNB Year"
              />
            </InputGroup>
            {errorForms["wpb_year"] && (
              <FormErrorMessage>WPNB Year is required</FormErrorMessage>
            )}
          </FormControl>

          {TypeOperasional === "WELLSERVICE" ||
          TypeOperasional === "WORKOVER" ? null : (
            <SelectComponent
              label="Select Rig"
              isInvalid={!!errorForms["rig_id"]}
              errorMessage={errorForms["rig_id"]}
              placeholder="Select Rig"
              value={DateChange.rig_id}
              name="rig_id"
              onChange={handleDateChange}
            >
              {rigData?.map((item, index) => (
                <SelectOption
                  key={index}
                  value={item?.value}
                  label={item?.name}
                />
              ))}
            </SelectComponent>
          )}

          {/* {errorForms["job_plan.rig_horse_power"] && (
                <FormErrorMessage>Rig Horse Power is required</FormErrorMessage>
              )} */}
        </HStack>
      </VStack>
      <Divider my={10} borderWidth="1px" borderColor={"gray.200"} />

      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <FormControl isInvalid={!!errorForms["start_date"]}>
            <FormLabel>Start Date</FormLabel>
            <Input
              name="start_date"
              type="date"
              value={DateChange.start_date}
              onChange={handleDateChange}
              placeholder="Start Date"
            />
            {errorForms["start_date"] && (
              <FormErrorMessage>Start Date is required</FormErrorMessage>
            )}
          </FormControl>
          <FormControl isInvalid={!!errorForms["end_date"]}>
            <FormLabel>End Date</FormLabel>
            <Input
              name="end_date"
              type="date"
              min={DateChange.start_date}
              value={DateChange.end_date}
              disabled={DateChange.start_date ? false : true}
              onChange={handleDateChange}
              placeholder="End Date"
            />
            {errorForms["end_date"] && (
              <FormErrorMessage>End Date is required</FormErrorMessage>
            )}
          </FormControl>
        </HStack>
        {TypeOperasional === "WORKOVER" || TypeOperasional === "WELLSERVICE" ? (
          <>
            <VStack spacing={4}>
              <FormControl isInvalid={!!errorForms["job_category"]}>
                <FormLabel >
                  {(TypeOperasional === "WORKOVER" && "Workover Job Type") ||
                    (TypeOperasional === "WELLSERVICE" &&
                      "Well Service Job Type")}
                </FormLabel>
                <Select
                  name="job_category"
                  value={DateChange.job_category}
                  onChange={(e) => {
                    setDateChange((prev) => ({
                      ...prev,
                      job_category: e.target.value,
                    }));
                  }}
                >
                  <option value="Select Work Over Job Tyoe" disabled></option>
                  {WoWsCategory &&
                    WoWsCategory.map((item, index) => (
                      <option key={index} value={item.value}>
                        {item.name}
                      </option>
                    ))}
                </Select>
                {errorForms["job_category"] && (
                  <FormErrorMessage>
                    Job Category is required
                  </FormErrorMessage>
                )}
              </FormControl>
              <FormControl isInvalid={!!errorForms["job_description"]}>
                <FormLabel>Job Description</FormLabel>
                <Textarea
                  name="job_description"
                  type="text"
                  value={DateChange.job_description}
                  onChange={(e) => {
                    setDateChange((prev) => ({
                      ...prev,
                      job_description: e.target.value,
                    }));
                  }}
                  placeholder="Job Description"
                />
                {errorForms["job_description"] && (
                  <FormErrorMessage>
                    Job Description is required
                  </FormErrorMessage>
                )}
              </FormControl>
            </VStack>

            <HStack spacing={4}>
              <FormControl isInvalid={!!errorForms["equipment"]}>
                <FormLabel>Equipment</FormLabel>
                <Input
                  name="equipment"
                  type="text"

                  value={DateChange.equipment}
                  onChange={(e) => {
                    setDateChange((prev) => ({
                      ...prev,
                      equipment: e.target.value,
                    }));
                  }}
                  placeholder="Equipment"
                />
                {errorForms["equipment"] && (
                  <FormErrorMessage>Equipment is required</FormErrorMessage>
                )}
              </FormControl>
              <FormControl isInvalid={!!errorForms["equipment_specifications"]}>
                <FormLabel>Equipment Spesification</FormLabel>
                <Input
                  name="equipment_specifications"
                  type="text"
                  value={DateChange.equipment_specifications}
                  onChange={(e) => {
                    setDateChange((prev) => ({
                      ...prev,
                      equipment_specifications: e.target.value,
                    }));
                  }}
                  placeholder="Equipment Spesification"
                />
                {errorForms["equipment_specifications"] && (
                  <FormErrorMessage>
                    Equipment Spesification is required
                  </FormErrorMessage>
                )}
              </FormControl>
            </HStack>
          </>
        ) : (
          <></>
        )}
      </VStack>
    </Box>
  );
};

export default ProposedJob;
