import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
  FormErrorMessage,
} from "@chakra-ui/react";
import { IconCalendarDue } from "@tabler/icons-react";
import { useJobContext } from "../../../../Context/JobContext";
import { ADD_WELL_MASTER } from "../../../../Reducer/reducer";
import HeaderForm from "../../../Components/Form/LabelForm";
import { useDebounce } from "use-debounce";

const KeyDates = ({ errorForms = {} }) => {
  const { state, dispatch } = useJobContext();
  const [formData, setFormData] = useState({});
  const [initialData, setInitialData] = useState({});
  const debounceRef = useRef(null);

  const initializeFormData = useCallback(() => {
    if (state?.wellMaster) {
      setFormData(state.wellMaster);
      setInitialData(state.wellMaster);
    }
  }, [state?.wellMaster]);

  useEffect(() => {
    initializeFormData();
  }, [initializeFormData]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Debounce dispatch
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        dispatch({
          type: ADD_WELL_MASTER,
          payload: {
            ...state.wellMaster,
            [name]: value, // Gunakan nilai yang terbaru
          },
        });
      }, 300);
    },
    [dispatch, state.wellMaster]
  );

  const renderFormControl = (label, name, desc, disabledBool) => (
    <FormControl isInvalid={!!errorForms[`well.${name}`]}>
      <HeaderForm title={label} desc={desc} />
      <Input
        name={name}
        type="date"
        value={formData[name]}
        onChange={handleChange}
        placeholder={label}
        {...{ disabled: disabledBool }}
      />
      {errorForms[`well.${name}`] && (
        <FormErrorMessage>{`${label} is required`}</FormErrorMessage>
      )}
    </FormControl>
  );

  return (
    <VStack spacing={6} align="stretch" fontFamily={"Mulish"} mt={5}>
      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <Flex alignItems="center">
          <Icon as={IconCalendarDue} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              {"Key Dates"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {"subtitle"}
            </Text>
          </Flex>
        </Flex>
        <VStack spacing={4} align="stretch" mt={5}>
          <HStack spacing={4}>
            {renderFormControl(
              "Spud Date",
              "spud_date",
              "Date the drilling operations commenced on the well. The first day hole is made.",
            )}
            {renderFormControl(
              "Final Drill Date",
              "final_drill_date",
              "Date the drilling operations for the well were finalized."
            )}
          </HStack>
          <HStack spacing={4}>
            {renderFormControl(
              "Completion Date",
              "completion_date",
              "Date on the official filing or completion report indicating the well is established as ready to produce, inject or abandon."
            )}
            {renderFormControl(
              "Abandonment Date",
              "abandonment_date",
              "Date the well was plugged and permanently abandoned."
            )}
          </HStack>
          <HStack spacing={4}>
            {renderFormControl(
              "Rig On Site Date",
              "rig_on_site_date",
              "The date that the drilling rig is moved onto the well site."
            )}
            {renderFormControl(
              "Rig Release Date",
              "rig_release_date",
              "Date the drilling rig can be released from operations and moved from the well site as specified in the contract."
            )}
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};

export default KeyDates;

