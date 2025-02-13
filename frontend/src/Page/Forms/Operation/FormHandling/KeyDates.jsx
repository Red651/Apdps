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
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";
import HeaderForm from "../../../Components/Form/LabelForm";

const KeyDates = ({ errorForms = {} }) => {
    const [localErrorForms, setLocalErrorForms] = useState(errorForms);
    const { state, dispatch } = useJobContext();
  const [formData, setFormData] = useState({
    spud_date: "",
    final_drill_date: "",
    completion_date: "",
    abandonment_date: "",
    rig_on_site_date: "",
    rig_release_date: "",
  });

  const debounceRef = useRef(null);

  useEffect(() => {
    if (state?.initialOperationData?.actual_job?.well) {
      const wellData = state.initialOperationData.actual_job.well;
      setFormData({
        spud_date: wellData.spud_date || "",
        final_drill_date: wellData.final_drill_date || "",
        completion_date: wellData.completion_date || "",
        abandonment_date: wellData.abandonment_date || "",
        rig_on_site_date: wellData.rig_on_site_date || "",
        rig_release_date: wellData.rig_release_date || "",
      });
    }
  }, [state?.initialOperationData?.actual_job?.well]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));

      // Debounce dispatch
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        dispatch({
          type: UPDATE_OPERATION_DATA,
          payload: {
            ...state.initialOperationData,
            actual_job: {
              ...state.initialOperationData?.actual_job,
              well: {
                ...state.initialOperationData?.actual_job?.well,
                [name]: value, // Gunakan nilai yang terbaru
              },
            },
          },
        });
      }, 300); // Waktu debounce 300ms
    },
    [dispatch, state.initialOperationData]
  );

  const renderFormControl = (label, name, desc, disabledBool) => (
    <FormControl isInvalid={!!localErrorForms[`well.${name}`]}>
      <HeaderForm title={label} desc={desc} />
      <Input
        name={name}
        type="date"
        value={formData[name]}
        onChange={handleChange}
        placeholder={label}
        {...{ disabled: disabledBool }}
      />
      {localErrorForms[`well.${name}`] && (
        <FormErrorMessage>{localErrorForms[`well.${name}`]}</FormErrorMessage>
      )}
    </FormControl>
  );

   // Efek untuk memantau perubahan form data dan menghapus error
   useEffect(() => {
    const newErrorForms = { ...localErrorForms };


    // Daftar field yang akan dicek
    const fieldsToCheck = [
      "spud_date",
      "final_drill_date",
      "completion_date",
      "abandonment_date",
      "rig_on_site_date",
      "rig_release_date",
    ];


    fieldsToCheck.forEach(field => {
        // Hapus error jika field sudah terisi
        if (formData[field]) {
            delete newErrorForms[`well.${field}`];
        }
    });


    // Update local error forms jika ada perubahan
    if (Object.keys(newErrorForms).length !== Object.keys(localErrorForms).length) {
        setLocalErrorForms(newErrorForms);
    }
}, [formData]);


// Update error forms dari prop
useEffect(() => {
    setLocalErrorForms(errorForms);
}, [errorForms]);

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
              true
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
