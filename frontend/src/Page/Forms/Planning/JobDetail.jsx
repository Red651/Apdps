import React from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
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
  FormHelperText,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import { JobContext } from "../../../Context/JobContext";
import { IconBriefcase, IconInfoCircle } from "@tabler/icons-react";
import { ADD_JOB_EXP_DEV_JOB_PLAN_WELL } from "../../../Reducer/reducer";
import { useParams } from "react-router-dom";
import { SelectComponent, SelectOption } from "../Components/SelectOption";
import { hydrate, useQuery } from "@tanstack/react-query";
import { FetchReusable } from "../../API/FetchReusable";
// import { getParentWell } from "../../API/APIKKKS";
import { Select as ChakraSelect } from "chakra-react-select";
import { getParentWell } from "../../../Page/API/APIKKKS";
import HeaderForm from "../../Components/Form/LabelForm";

const JobDetail = ({
  TypeOperational,
  TypeSubmit="create",
  initialData = null,
  unittype,
  errorForms = (e, data) => {
    console.log(e, data);
  },
  wellType = [
    "DEALINATION",
    "WILDCAT",
    "INFILL",
    "PRODUCER",
    "INJECTION",
    "STEPOUT",
  ],
}) => {
  //  
  const { job_id } = useParams();

  const { state, dispatch } = React.useContext(JobContext);
  const jobPlanExpDev = state.jobPlanExpDev?.job_plan?.well || {};
  const kkks_id = JSON.parse(localStorage.getItem("user")).kkks_id;
  //
  const headersParentWell = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const {
    data: dataParentWell,
    error: errorParentWell,
    isLoading: isLoadingParentWell,
  } = useQuery({
    queryKey: ["parentWell"],
    queryFn: () => getParentWell(kkks_id),
    retry: 2,
  });
  //

  const profileType = [
    {
      label: "VERTICAL",
      value: "VERTICAL",
    },

    {
      label: "DIRECTIONAL",
      value: "DIRECTIONAL",
    },
    {
      label: "HORIZONTAL",
      value: "HORIZONTAL",
    },
    {
      label: "S-SHAPE",
      value: "S-SHAPE",
    },
  ];
  const [formData, setFormData] = React.useState({
    well_class: null,
    well_profile_type: null,
    environment_type: null,
    maximum_inclination: null,
    azimuth: null,
    depth_datum: null,
    kick_off_point: null,
    uwi: null,
    well_name: null,
    well_num: null,
    well_level_type: null,
    parent_well_id: null,
  });

  const [parentWell, setParentWell] = React.useState([]);

  //  
  //  

  React.useEffect(() => {
    if (TypeSubmit === "update" && initialData) {
      setFormData({
        well_class: initialData.well_class || null,
        well_profile_type: initialData.well_profile_type || null,
        environment_type: initialData.environment_type || null,
        maximum_inclination: initialData.maximum_inclination || null,
        azimuth: initialData.azimuth || null,
        depth_datum: initialData.depth_datum || null,
        kick_off_point: initialData.kick_off_point || null,
        uwi: initialData.uwi || null,
        well_name: initialData.well_name || null,
        well_num: initialData.well_num || null,
        parent_well_id: initialData.parent_well_id || null,
        well_level_type: initialData.well_level_type || null,
      });
    }
  }, [TypeSubmit]);

  React.useEffect(() => {
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
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let values;
    if (type === "number") {
      values = value.includes(".")
        ? parseFloat(value)
        : parseInt(value, 10) || 0;
    } else if (type === "text") {
      values = value;
    } else {
      values = value;
    }

    setFormData((prevData) => {
      return {
        ...prevData,
        [name]: values,
      };
    });

    // setFormData((prevData) => ({ ...prevData, [name]: values }));
  };
  //
  React.useEffect(() => {
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: formData,
    });
  }, [formData]);

  const well_type = wellType.map((type) => ({
    label: type,
    value: type,
  }));

  const well_level_type = [
    { label: "WELL", value: "WELL" },
    { label: "WELL ORIGIN", value: "WELL ORIGIN" },
    { label: "WELLBORE", value: "WELLBORE" },
    { label: "WELLBORE SEGMENT", value: "WELLBORE SEGMENT" },
    { label: "WELLBORE COMPLETION", value: "WELLBORE COMPLETION" },
    { label: "WELLBORE CONTACT INTERVAL", value: "WELLBORE CONTACT INTERVAL" },
  ];

  const environment_type = [
    { label: "SWAMP", value: "SWAMP" },
    { label: "MARINE", value: "MARINE" },
    { label: "LAND", value: "LAND" },
  ];

  const handleOptionChange = (name, selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      [name]: selectedOption ? selectedOption.value : null,
    }));
  };

  const RenderFormControl = (label, name, desc, isNumber = true) => (
    <FormControl isInvalid={!!errorForms[name]}>
      <HeaderForm title={label} desc={desc} />
      {/* <FormHelperText
        fontSize="md"
        color="gray.500"
        mb={2}
        display="flex"
        gap={2}
        alignItems="center"
      >
        {desc && <Icon as={IconInfoCircle} boxSize={4} />}
        {desc}
      </FormHelperText> */}

      <InputGroup>
        <Input
          name={name}
          placeholder={label}
          type={isNumber ? "number" : "text"}
          value={formData[name]}
          onChange={handleChange}
          step="any"
          borderColor={errorForms[name] ? "red.500" : "gray.300"}
          _focus={{ borderColor: "teal.500" }}
          _hover={{ borderColor: "teal.300" }}
          padding={4}
          borderRadius="md"
          fontSize="md"
        />
        {isNumber && (
          <InputRightAddon>
            {unittype === "METRICS" ? "m" : "ft"}
          </InputRightAddon>
        )}
      </InputGroup>
      {errorForms[name] && (
        <FormErrorMessage color="red.500" fontSize="sm" mt={2}>
          {`${label} is required`}
        </FormErrorMessage>
      )}
    </FormControl>
  );

  const renderSelectControl = (label, name, desc, options) => (
    <FormControl isInvalid={!!errorForms[name]}>
      <FormLabel display={"flex"} gap={2} alignItems={"center"}>
        {label}
        {desc && (
          <Tooltip label={desc}>
            <Icon as={IconInfoCircle} boxSize={4} />
          </Tooltip>
        )}
      </FormLabel>
      <ChakraSelect
        name={name}
        value={options.find((opt) => opt.value === formData[name])} // Mengambil nilai dari `formData` secara dinamis
        onChange={(selectedOption) => handleOptionChange(name, selectedOption)} // Memanggil fungsi universal
        options={options}
        placeholder={`Select ${label}`}
        isClearable
        isSearchable
      />
      {errorForms[name] && (
        <FormErrorMessage color="red.500" fontSize="sm" mt={2}>
          {`${label} is required`}
        </FormErrorMessage>
      )}
    </FormControl>
  );

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
              {"subtitle"}
            </Text>
          </Flex>
        </Flex>
        <VStack spacing={4} align="stretch" mt={5}>
          <HStack spacing={4}>
            {RenderFormControl("Well Name", "well_name", "Name of Well", false)}
            {RenderFormControl(
              "Well Num",
              "well_num",
              "Well numbers are used to identify well completions in information systems",
              false
            )}
          </HStack>
          <HStack spacing={4}>
            {renderSelectControl(
              "Well Class",
              "well_class",
              "Well numbers are used to identify well completions in information systems",
              well_type
            )}
          </HStack>
          <HStack spacing={4}>
            {renderSelectControl(
              "Well Level Type",
              "well_level_type",
              "May be used if the type of component is not known. Well Sets should be loaded into WELL_SET. WELLHEAD STREAM is mapped into FACILITY.",
              well_level_type
            )}
            {renderSelectControl(
              "Well Profile Type",
              "well_profile_type",
              "A reference table describing a type of wellbore shape. For example vertical, horizontal, directional or s-shaped.",
              profileType
            )}
          </HStack>
          <HStack spacing={4}>
            {renderSelectControl(
              "Environment Type",
              "environment_type",
              "The type of environment that the well is in, such as land, marine, transition zone etc.",
              environment_type
            )}
            {TypeOperational === "development" && renderSelectControl(
              "Parent Well",
              "parent_well_id",
              "The initial well drilled in a horizontal pad well architecture to hold acreage and produced oil",
              parentWell
            )}
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};
//

export default JobDetail;
