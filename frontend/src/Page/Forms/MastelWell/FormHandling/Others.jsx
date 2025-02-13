import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  VStack,
  Text,
  Flex,
  Icon,
  Box,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightAddon,
  FormErrorMessage,
  FormHelperText,
  Textarea,
  Select, // Chakra UI Select component
} from "@chakra-ui/react";
import { IconClover, IconInfoCircle } from "@tabler/icons-react";
import { useJobContext } from "../../../../Context/JobContext";
import { ADD_WELL_MASTER } from "../../../../Reducer/reducer";
import HeaderForm from "../../../Components/Form/LabelForm";

const Others = ({ errorForms = {} }) => {
  const { state, dispatch } = useJobContext();
  const unittype = state?.unit_type || "METRICS";
  const [formData, setFormData] = useState({
    hydrocarbon_target: null,
    net_pay: null,
    water_acoustic_vel: null,
    azimuth: null,
    maximum_inclination: null,
    kick_off_point: null,
    remark: null,
  });

  const debounceRef = useRef(null);

  // Load initial data
  useEffect(() => {
    if (state?.wellMaster) {
      const wellData = state.wellMaster;
      const initialData = {
        hydrocarbon_target: wellData.hydrocarbon_target || null,
        net_pay: wellData.net_pay?.toString() || null,
        water_acoustic_vel: wellData.water_acoustic_vel?.toString() || null,
        azimuth: wellData.azimuth?.toString() || null,
        maximum_inclination: wellData.maximum_inclination?.toString() || null,
        kick_off_point: wellData.kick_off_point?.toString() || null,
        remark: wellData.remark?.toString() || null,
      };
      setFormData(initialData);
    }
  }, [state?.wellMaster]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;

      // Update local state immediately
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Debounce the dispatch to context
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const valueToSend = value === "" ? null : value;

        dispatch({
          type: ADD_WELL_MASTER,
          payload: {
                ...state.wellMaster,
                [name]: valueToSend,
          },
        });
      }, 300);
    },
    [dispatch, state.wellMaster]
  );

  const renderFormControl = (
    label,
    name,
    placeholder,
    desc,
    isNumber = true
  ) => (
    <FormControl isInvalid={!!errorForms[`well.${name}`]}>
      <HeaderForm title={label} desc={desc} />
      <InputGroup>
        <Input
          name={name}
          placeholder={placeholder}
          type={isNumber ? "number" : "text"}
          value={formData[name]}
          onChange={handleChange}
          step="any"
          borderColor={errorForms[`well.${name}`] ? "red.500" : "gray.300"}
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
      {errorForms[`well.${name}`] && (
        <FormErrorMessage color="red.500" fontSize="sm" mt={2}>
          {`${label} is required`}
        </FormErrorMessage>
      )}
    </FormControl>
  );

  // Updated render for Select component for Hydrocarbon Target
  const renderSelectControl = (label, name, onChange, options, desc) => (
    <FormControl isInvalid={!!errorForms[`well.${name}`]}>
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
      <Select
        name={name}
        value={formData[name]}
        onChange={onChange}
        borderColor={errorForms[`well.${name}`] ? "red.500" : "gray.300"}
        _focus={{ borderColor: "teal.500" }}
        _hover={{ borderColor: "teal.300" }}
        // padding={4}
        borderRadius="md"
        fontSize="md"
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </Select>
      {errorForms[`well.${name}`] && (
        <FormErrorMessage color="red.500" fontSize="sm" mt={2}>
          {`${label} is required`}
        </FormErrorMessage>
      )}
    </FormControl>
  );

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      mt={4}
      bg="white"
      fontFamily={"Mulish"}
    >
      <VStack align="stretch" spacing={4}>
        <Flex alignItems="center">
          <Icon as={IconClover} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              {"Other"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {"Enter other details"}
            </Text>
          </Flex>
        </Flex>
        <Grid
          templateColumns="repeat(1, 1fr)"
          gap={4}
          border={1}
          borderColor={"gray.200"}
        >
          <GridItem>
            {renderSelectControl(
              "Hydrocarbon Target",
              "hydrocarbon_target",
              handleChange,
              ["OIL", "GAS"],
              "Pilih jenis target hidrokarbon"
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Net Pay",
              "net_pay",
              "Net Pay",
              "The cumulative reservoir rock capable of producing within the entire thickness of a pay zone. The net pay within a gross interval."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Water Acoustic Vel",
              "water_acoustic_vel",
              "Water Acoustic Vel",
              "The average acoustic velocity from surface to sea bed near the well site"
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Azimuth",
              "azimuth",
              "Azimuth",
              "Compass direction of a wellbore or directional survey, measured in degrees from 0 to 359."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Maximum Inclination",
              "maximum_inclination",
              "Maximum Inclination",
              "The maximum angle at which a surface can be tilted from the horizontal."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Kick of Point",
              "kick_off_point",
              "Kick of Point",
              "The point at which a wellbore is intentionally deviated from a vertical path to build it to a desired orientation."
            )}
          </GridItem>
          <GridItem>
            <FormControl isInvalid={!!errorForms["remark"]}>
              <FormLabel>Remark</FormLabel>
              <Textarea
                name="remark"
                value={formData.remark}
                onChange={handleChange}
                placeholder="Remark"
              />
            </FormControl>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

export default Others;
