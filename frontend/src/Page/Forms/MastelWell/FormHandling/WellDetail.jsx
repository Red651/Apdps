import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Select,
  HStack,
  Grid,
  GridItem,
  InputGroup,
  InputRightAddon,
  Flex,
  Icon,
  Text,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Select as ChakraSelect } from "chakra-react-select";
import { IconInfoCircle } from "@tabler/icons-react";
import { useJobContext } from "../../../../Context/JobContext";
import { ADD_WELL_MASTER } from "../../../../Reducer/reducer";
import { isEqual } from "lodash";
import { getParentWell, getAreaID, GetFieldID, getWellStatus } from "../../../../Page/API/APIKKKS";
import HeaderForm from "../../../Components/Form/LabelForm";

const JobDetail = ({ errorForms = {} , fieldRefs }) => {
  const { state, dispatch } = useJobContext();
  const profileType = useMemo(
    () => [
      { name: "VERTICAL", value: "VERTICAL" },
      { name: "DIRECTIONAL", value: "DIRECTIONAL" },
    ],
    []
  );
  const [areaID, setAreaID] = useState([]);
  const [fieldID, setFieldID] = useState([]);
  const [wellStatus, setWellStatus] = useState([]);
  const [formData, setFormData] = useState({
    well_class: null,
    well_profile_type: null,
    // well_directional_type: null,
    environment_type: null,
    maximum_inclination: null,
    azimuth: null,
    kick_off_point: null,
    // uwi: null,
    well_name: null,
    well_num: null,
    parent_well_id: null,
    well_level_type: null,
    area_id: null,
    field_id: null,
    well_status: null,
  });

  useEffect(() => {
    const GetAreaID = async () => {
      try {
        const response = await getAreaID();
        setAreaID(response);
      } catch (error) {
        console.error("Error get Area ID", error);
      }
    };

    GetAreaID();
  }, []);

  const getFieldID = async () => {
    if (formData.area_id) {
      try {
        const response = await GetFieldID(formData.area_id);
        setFieldID(response);
      } catch (error) {
        console.error("Error get Field ID", error);
      }
    }
  };

  useEffect(() => {
    getFieldID();
  }, [formData.area_id]);

  useEffect(() => {
    const GetWellStatus = async () => {
      try {
        const response = await getWellStatus();
        setWellStatus(response);
      } catch (error) {
        console.error("Error get Well Status", error);
      }
    };

    GetWellStatus();
  }, []);

  useEffect(() => {
    if (fieldRefs) {
      // Hubungkan setiap input dengan fieldRefs
      fieldRefs.current.area_id = document.querySelector('[name="area_id"]');
      fieldRefs.current.field_id = document.querySelector('[name="field_id"]');
      fieldRefs.current.well_name = document.querySelector('[name="well_name"]');
      fieldRefs.current.well_num = document.querySelector('[name="well_num"]');
      fieldRefs.current.well_class = document.querySelector('[name="well_class"]');
      fieldRefs.current.well_profile_type = document.querySelector('[name="well_profile_type"]');
      fieldRefs.current.environment_type = document.querySelector('[name="environment_type"]');
      fieldRefs.current.well_level_type = document.querySelector('[name="well_level_type"]');
      fieldRefs.current.well_status = document.querySelector('[name="well_status"]');
    }
  }, [fieldRefs]);

  const wellType = useMemo(
    () => [
      "DELINEATION",
      "WILDCAT",
      "INFILL",
      "PRODUCER",
      "INJECTION",
      "STEPOUT",
    ],
    []
  );
  const environmentType = useMemo(() => ["SWAMP", "MARINE", "LAND"], []);
  const directionalType = useMemo(() => ["J-TYPE", "S-TYPE", "HORIZONTAL"], []);
  const [parentWell, setParentWell] = useState([]);

  const [initialData, setInitialData] = useState({});

  const initializeFormData = useCallback(() => {
    if (state?.wellMaster) {
      const wellData = state.wellMaster;
      const newData = {
        well_class: wellData.well_class || null,
        well_profile_type: wellData.well_profile_type || null,
        // well_directional_type: wellData.well_directional_type || null,
        environment_type: wellData.environment_type || null,
        maximum_inclination: wellData.maximum_inclination || null,
        azimuth: wellData.azimuth || null,
        kick_off_point: wellData.kick_off_point || null,
        // uwi: wellData.uwi || null,
        well_name: wellData.well_name || null,
        well_num: wellData.well_num || null,
        parent_well_id: wellData.parent_well_id || null,
        area_id: wellData.area_id || null,
        field_id: wellData.field_id || null,
        well_status: wellData.well_status || null,
      };
      setFormData(newData);
      setInitialData(newData);
    }
  }, [state?.wellMaster]);

  useEffect(() => {
    initializeFormData();
  }, [initializeFormData]);

  useEffect(() => { 
    const fetchParentWell = async () => {
      try {
        const response = await getParentWell();
        if (response) {
          const formattedWells = response.map((well) => ({
            value: well.value,
            label: well.name,
          }));
          setParentWell(formattedWells);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchParentWell();
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    let processedValue = value;

    if (type === "number") {
      processedValue = value === "" ? "" : parseFloat(value);
    }

    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [name]: processedValue,
      };

      if (name === "well_profile_type" && value !== "DIRECTIONAL") {
        // newData.well_directional_type = "";
        newData.kick_off_point = "";
        newData.maximum_inclination = "";
        newData.azimuth = "";
      }

      return newData;
    });
  }, []);

  const handleParentWellChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      parent_well_id: selectedOption ? selectedOption.value : null,
    }));
  };

  useEffect(() => {
    if (!isEqual(formData, initialData)) {
      const updatedWell = {
        ...state.wellMaster,
        ...formData,
      };
      const timer = setTimeout(() => {
        dispatch({
          type: ADD_WELL_MASTER,
          payload: {
                ...state.wellMaster,
                ...updatedWell,
          },
        });
      }, 500); 

      return () => clearTimeout(timer);
    }
  }, [formData, initialData, state.wellMaster, dispatch]);

  const wellLevelType = [
    "WELL",
    "WELL ORIGIN",
    "WELLBORE",
    "WELLBORE SEGMENT",
    "WELLBORE COMPLETION",
    "WELLBORE CONTACT INTERVAL",
  ];

  return (
    <VStack spacing={6} align="stretch" fontFamily={"Mulish"}>
      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <Flex alignItems="center">
          <Icon as={IconInfoCircle} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              {"Well Detail"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {"Enter well information"}
            </Text>
          </Flex>
        </Flex>
        <VStack spacing={4} align="stretch" mt={5}>

        <HStack spacing={4}>
            <FormControl isInvalid={!!errorForms["area_id"]}>
              <FormLabel>Select Area</FormLabel>
              <Select
                name="area_id"
                value={formData.area_id} // pastikan nilai ada
                onChange={handleChange}
                placeholder="Select Area"
              >
                {areaID.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Select Field</FormLabel>
              <Select
                name="field_id"
                value={formData.field_id} // pastikan nilai ada
                onChange={handleChange}
                placeholder={
                  state?.wellMaster?.area_id ? "Select Field" : "Please select Area first"
                }
                isDisabled={!state?.wellMaster?.area_id} // Disable jika area_id tidak ada
              >
                {fieldID.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </FormControl>
          </HStack>

          <HStack spacing={4}>
            {/* <FormControl isInvalid={!!errorForms.uwi}>
              <FormLabel>UWI</FormLabel>
              <Input
                name="uwi"
                value={formData.uwi}
                onChange={handleChange}
                placeholder="UWI"
              />
              {errorForms.uwi && (
                <FormErrorMessage>UWI is required</FormErrorMessage>
              )}
            </FormControl> */}
            <FormControl isInvalid={!!errorForms.well_name}>
              <HeaderForm title={"Well Name"} desc={"Name of Well"} />
              <Input
                name="well_name"
                value={formData.well_name}
                onChange={handleChange}
                placeholder="Well Name"
              />
                <FormErrorMessage>{errorForms.well_name}</FormErrorMessage>
            </FormControl>
          </HStack>
          
          <HStack spacing={4}>
            <FormControl isInvalid={!!errorForms.well_num}>
              <HeaderForm
                title={"Well Num"}
                desc={
                  "Well numbers are used to identify well completions in information systems."
                }
              />
              <Input
                name="well_num"
                value={formData.well_num}
                onChange={handleChange}
                placeholder="Well Num"
              />
                <FormErrorMessage>{errorForms.well_num}</FormErrorMessage>
            </FormControl>
            <FormControl isInvalid={!!errorForms.well_class}>
              <HeaderForm
                title={"Well Class"}
                desc={"A system for classifying wells based on their use."}
              />
              <Select
                name="well_class"
                value={formData.well_class}
                onChange={handleChange}
                placeholder="Select Well Type"
              >
                {wellType.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
                <FormErrorMessage>{errorForms.well_class}</FormErrorMessage>
            </FormControl>
          </HStack>
          <HStack spacing={4}>
            <FormControl
              isInvalid={!!errorForms.well_profile_type}
            >
              <HeaderForm
                title={"Well Profile Type"}
                desc={
                  "A reference table describing a type of wellbore shape. For example vertical, horizontal, directional or s-shaped."
                }
              />
              <Select
                name="well_profile_type"
                value={formData.well_profile_type}
                onChange={handleChange}
              >
                <option value="">Select Profile Type</option>
                {profileType.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.name}
                  </option>
                ))}
              </Select>
              {errorForms.well_profile_type && (
                <FormErrorMessage>
                  Well Profile Type is required
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl
              isInvalid={!!errorForms.environment_type}
            >
              <HeaderForm
                title={"Environment Type"}
                desc={
                  "The type of environment that the well is in, such as land, marine, transition zone etc."
                } 
              />
              <Select
                name="environment_type"
                value={formData.environment_type}
                onChange={handleChange}
                placeholder="Select Environment Type"
              >
                {environmentType.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              {errorForms.environment_type && (
                <FormErrorMessage>
                  Environment Type is required
                </FormErrorMessage>
              )}
            </FormControl>
          </HStack>

          <HStack spacing={4}>
            <FormControl>
              <FormControl isInvalid={!!errorForms.well_level_type}>
                <HeaderForm
                  title={"Well Level Type"}
                  desc={
                    "May be used if the type of component is not known. Well Sets should be loaded into WELL_SET. WELLHEAD STREAM is mapped into FACILITY."
                  }
                />
                <Select
                  name="well_level_type"
                  value={formData.well_level_type}
                  onChange={handleChange}
                  placeholder="Select Well Level Type"
                >
                  {wellLevelType.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </Select>
                {errorForms.well_level_type && (
                  <FormErrorMessage>
                    Well Level Type is required
                  </FormErrorMessage>
                )}
              </FormControl>
            </FormControl>
            <FormControl isInvalid={!!errorForms["well_status"]}>
              <FormLabel>Well Status</FormLabel>
              <Select
                name="well_status"
                value={formData.well_status}
                onChange={handleChange}
                placeholder="Select Well Status"
              >
                {wellStatus.map((option) => (
                  <option key={option.name} value={option.name}>
                    {option.value}
                  </option>
                ))}
              </Select>
            </FormControl>
          </HStack>

          <HStack>
            <FormControl>
              <HeaderForm
                title={"Parent Well"}
                desc={
                  "The initial well drilled in a horizontal pad well architecture to hold acreage and produced oil."
                }
              />
              <ChakraSelect
                name="parent_well_id"
                value={parentWell.find(
                  (opt) => opt.value === formData.parent_well_id
                )}
                onChange={handleParentWellChange}
                options={parentWell}
                placeholder="Search or select parent well..."
                isClearable
                isSearchable
              />
            </FormControl>
          </HStack>
        </VStack>
      </Box>
      {/* {formData.well_profile_type === "DIRECTIONAL" && (
        <Box
          borderWidth="1px"
          borderRadius="lg"
          p={6}
          boxShadow="md"
          bg="white"
        >
          <VStack align="stretch" spacing={4}>
            <Flex alignItems="center">
              <Icon as={IconInfoCircle} boxSize={12} color="gray.800" mr={3} />
              <Flex flexDirection={"column"}>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="gray.700"
                  fontFamily={"Mulish"}
                >
                  {"Directional Type"}
                </Text>
                <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
                  {"*Required"}
                </Text>
              </Flex>
            </Flex>

            <FormControl fontSize={"lg"}>
              <FormLabel>Directional Type</FormLabel>
              <Select
                name="well_directional_type"
                value={formData.well_directional_type}
                onChange={handleChange}
              >
                <option value="">Select Directional Type</option>
                {directionalType.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel>Kick Off Point</FormLabel>
              <InputGroup>
                <Input
                  name="kick_off_point"
                  placeholder="Kick off point"
                  onChange={handleChange}
                  type="number"
                  value={formData.kick_off_point}
                />
                <InputRightAddon>m</InputRightAddon>
              </InputGroup>
            </FormControl>

            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <FormControl>
                  <FormLabel>Maximum Inclination</FormLabel>
                  <InputGroup>
                    <Input
                      name="maximum_inclination"
                      placeholder="Maximum inclination"
                      onChange={handleChange}
                      type="number"
                      value={formData.maximum_inclination}
                    />
                    <InputRightAddon>°</InputRightAddon>
                  </InputGroup>
                </FormControl>
              </GridItem>
              <GridItem>
                <FormControl>
                  <FormLabel>Azimuth</FormLabel>
                  <InputGroup>
                    <Input
                      name="azimuth"
                      type="number"
                      placeholder="Azimuth"
                      onChange={handleChange}
                      value={formData.azimuth}
                    />
                    <InputRightAddon>°</InputRightAddon>
                  </InputGroup>
                </FormControl>
              </GridItem>
            </Grid>
          </VStack>
        </Box>
      )} */}
    </VStack>
  );
};

export default JobDetail;
