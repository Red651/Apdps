import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Grid,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  VStack,
  Flex,
  Text,
  Icon,
  FormErrorMessage,
  GridItem,
} from "@chakra-ui/react";
import { IconDropCircle } from "@tabler/icons-react";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";
import HeaderForm from "../../../Components/Form/LabelForm";

const WellLocation = ({ errorForms = {} }) => {
  const { state, dispatch } = useJobContext();
  const [localErrorForms, setLocalErrorForms] = useState(errorForms);
  const [formData, setFormData] = useState({
    surface_longitude: "",
    surface_latitude: "",
    bottom_hole_longitude: "",
    bottom_hole_latitude: "",
  });
  const previousFormDataRef = useRef(formData);
  const debounceRef = useRef(null);


  // Initialize form data from context
  useEffect(() => {
    const wellData = state?.initialOperationData?.actual_job?.well || {};
    setFormData({
      surface_longitude: wellData.surface_longitude?.toString() || "",
      surface_latitude: wellData.surface_latitude?.toString() || "",
      bottom_hole_longitude: wellData.bottom_hole_longitude?.toString() || "",
      bottom_hole_latitude: wellData.bottom_hole_latitude?.toString() || "",
    });
  }, [state?.initialOperationData?.actual_job?.well]);


  // Coordinate formatting function
  const formatCoordinate = useCallback((value) => {
    if (value === "") return "";
    
    // Remove non-numeric characters except minus sign and decimal point
    let formattedValue = value.replace(/[^0-9.-]/g, "");
    
    // Ensure only one minus sign at the beginning
    if (formattedValue.split("-").length > 2) {
      formattedValue = `-${formattedValue.replace(/-/g, "")}`;
    }
    
    // Limit to one decimal point
    const parts = formattedValue.split(".");
    if (parts.length > 2) {
      formattedValue = `${parts[0]}.${parts.slice(1).join("")}`;
    }
    
    // Limit decimal places to 6
    if (parts[1] && parts[1].length > 6) {
      formattedValue = `${parts[0]}.${parts[1].substring(0, 6)}`;
    }
    
    return formattedValue;
  }, []);


  // Handle input changes
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      const formattedValue = formatCoordinate(value);
      
      setFormData((prev) => ({ ...prev, [name]: formattedValue }));
      
      // Debounce dispatch
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const numericFormData = Object.entries(formData).reduce(
          (acc, [key, value]) => {
            // Explicitly handle empty and invalid values
            acc[key] = value !== "" && !isNaN(parseFloat(value)) 
              ? parseFloat(value) 
              : null;
            return acc;
          },
          {}
        );


        // Only dispatch if data has changed
        if (
          JSON.stringify(numericFormData) !==
          JSON.stringify(previousFormDataRef.current)
        ) {
          dispatch({
            type: UPDATE_OPERATION_DATA,
            payload: {
              ...state.initialOperationData,
              actual_job: {
                ...state.initialOperationData?.actual_job,
                well: {
                  ...state.initialOperationData?.actual_job?.well,
                  ...numericFormData,
                },
              },
            },
          });
          previousFormDataRef.current = numericFormData;
        }
      }, 300);
    },
    [formatCoordinate, formData, dispatch, state.initialOperationData]
  );


  // Error handling effect
  useEffect(() => {
    const newErrorForms = { ...localErrorForms };
    const fieldsToCheck = [
      'surface_longitude',
      'surface_latitude',
      'bottom_hole_longitude',
      'bottom_hole_latitude'
    ];


    fieldsToCheck.forEach(field => {
      // Remove error if field is not empty and is a valid number
      if (formData[field] !== "" && !isNaN(parseFloat(formData[field]))) {
        delete newErrorForms[`well.${field}`];
      }
    });


    // Update local error forms if changed
    if (Object.keys(newErrorForms).length !== Object.keys(localErrorForms).length) {
      setLocalErrorForms(newErrorForms);
    }
  }, [formData, localErrorForms]);


  // Update error forms from prop
  useEffect(() => {
    setLocalErrorForms(errorForms);
  }, [errorForms]);

  return (
    <Box borderWidth="1px" borderRadius="lg" p={6} mt={4} fontFamily={"Mulish"}>
      <VStack align="stretch" spacing={4}>
        <Flex alignItems="center">
          <Icon as={IconDropCircle} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              {"Well Location"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {"Enter well coordinates"}
            </Text>
          </Flex>
        </Flex>

        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            <FormControl isInvalid={!!localErrorForms["well.surface_longitude"]}>
              <HeaderForm
                title={"Surface Longitude"}
                desc={
                  "Angular distance in decimal degrees, east or west of the prime meridian of the geodetic datum. A negative value represents a west longitude"
                }
              />
              <InputGroup>
                <Input
                  name="surface_longitude"
                  placeholder="Surface longitude"
                  type="text"
                  value={formData.surface_longitude}
                  onChange={handleChange}
                />
                <InputRightAddon>°</InputRightAddon>
              </InputGroup>
              {localErrorForms["well.surface_longitude"] && (
                <FormErrorMessage>
                  {localErrorForms["well.surface_longitude"]}
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>
          <GridItem>
            <FormControl isInvalid={!!localErrorForms["well.surface_latitude"]}>
              <HeaderForm
                title={"Surface Latitude"}
                desc={
                  "Angular distance in decimal degrees, north or south of the equator. A positive value represents a north latitude"
                }
              />
              <InputGroup>
                <Input
                  type="text"
                  name="surface_latitude"
                  placeholder="Surface latitude"
                  value={formData.surface_latitude}
                  onChange={handleChange}
                />
                <InputRightAddon>°</InputRightAddon>
              </InputGroup>
              {localErrorForms["well.surface_latitude"] && (
                <FormErrorMessage>
                  {localErrorForms["well.surface_latitude"]}
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>
        </Grid>

        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            <FormControl isInvalid={!!localErrorForms["well.bottom_hole_longitude"]}>
              <HeaderForm
                title={"Bottom Hole Longitude"}
                desc={
                  "Longitude of bottom hole point projected to surface. For straight wells this would be exactly the same as surface longitude or null"
                }
              />
              <InputGroup>
                <Input
                  name="bottom_hole_longitude"
                  placeholder="Bottom hole longitude"
                  type="text"
                  value={formData.bottom_hole_longitude}
                  onChange={handleChange}
                />
                <InputRightAddon>°</InputRightAddon>
              </InputGroup>
              {localErrorForms["well.bottom_hole_longitude"] && (
                <FormErrorMessage>
                  {localErrorForms["well.bottom_hole_longitude"]}
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>
          <GridItem>
            <FormControl isInvalid={!!localErrorForms["well.bottom_hole_latitude"]}>
              <HeaderForm
                title={"Bottom Hole Latitude"}
                desc={
                  "Latitude of bottom hole point projected to surface. For straight wells this would be exactly the same as surface latitude or null"
                }
              />
              <InputGroup>
                <Input
                  name="bottom_hole_latitude"
                  placeholder="Bottom hole latitude"
                  type="text"
                  value={formData.bottom_hole_latitude}
                  onChange={handleChange}
                />
                <InputRightAddon>°</InputRightAddon>
              </InputGroup>
              {localErrorForms["well.bottom_hole_latitude"] && (
                <FormErrorMessage>
                  {localErrorForms["well.bottom_hole_latitude"]}
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

export default WellLocation;
