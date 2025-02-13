import React, { useEffect, useState, useCallback } from "react";
import {
  FormControl,
  FormLabel,
  Input,
  Box,
  Grid,
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  HStack,
} from "@chakra-ui/react";
import { getExistingWellList, getEnum } from "../../../API/APIKKKS";
import { Select as ChakraSelect } from "chakra-react-select";
import { useParams } from "react-router-dom";
import { useJobContext } from "../../../../Context/JobContext";
import FileUploadSection from "../FormHandling/FileUploadSection";
import { putPlanningUpdate } from "../../../API/PostKkks";
import { debounce } from "lodash";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";

const TechnicalWOWS = ({ jobType, onWellNameChange }) => {
  const userID = JSON.parse(localStorage.getItem("user"))?.kkks_id;
  const [wellInstance, setWellInstance] = useState([]);
  const { state, dispatch } = useJobContext();
  const initialData = state?.initialOperationData?.actual_job;
  const { job_id } = useParams();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = React.useRef();
  const [isDirty, setIsDirty] = useState(false);
  const updatedData = state?.updatedOperationData;
  const [jobCategories, setJobCategories] = useState([]);

  const [formData, setFormData] = useState({
    well_id: "",
    onstream_gas: "",
    onstream_oil: "",
    onstream_water_cut: "",
    equipment: "",
    equipment_specifications: "",
    job_category: "SAND_CONTROL",
  });

  const wellName = wellInstance?.find(
    (opt) => opt?.value === formData?.well_id
  ) || { name: "-" };

  // Kirimkan wellName ke parent setiap kali nilai well_id berubah
  useEffect(() => {
    if (onWellNameChange) {
      onWellNameChange(wellName.name); // Mengirimkan nama well ke parent
    }
  }, [wellName, onWellNameChange]);
  
  const dispatchFormUpdate = useCallback(
    (data) => {
      dispatch({
        type: UPDATE_OPERATION_DATA,
        payload: {
          ...state?.initialOperationData,
          actual_job: {
            ...state?.initialOperationData?.actual_job,
            ...data,
          },
        },
      });
    },
    [dispatch, state?.initialOperationData]
  );

  const updateFormData = useCallback(
    debounce((data) => {
      if (isDirty) {
        dispatchFormUpdate(data);
        setIsDirty(false);
      }
    }, 1000),
    [dispatchFormUpdate, isDirty]
  );

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await getExistingWellList(userID);
        if (data) {
          setWellInstance(
            data.map((well) => ({
              value: well.value,
              label: well.name,
              ...well,
            }))
          );

          let jobCategoriesData = [];

          setTimeout(async () => {
            try {
              if (jobType == "workover") {
                jobCategoriesData = await getEnum("workover_job_category");
              } else if (jobType == "wellservice") {
                jobCategoriesData = await getEnum("wellservice_job_category");
              }
              setJobCategories(jobCategoriesData || []);
            } catch (error) {
              toast({
                title: "Error loading job categories",
                description: error.message,
                status: "error",
                duration: 3000,
                isClosable: true,
              });
            }
          }, 1000);

          if (initialData?.well_id && data.length > 0) {
            const initialWell = data.find(
              (well) => well.value === initialData.well_id
            );
            if (initialWell) {
              setFormData((prev) => ({
                ...prev,
                well_id: initialWell.value,
              }));
            }
          }
        }
      } catch (error) {
        toast({
          title: "Error loading well data",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
    getData();
  }, [userID, initialData?.well_id, toast, jobType]);

  useEffect(() => {
    if (job_id && initialData) {
      setFormData({
        well_id: initialData.well_id || "",
        onstream_gas: initialData.onstream_gas || "",
        onstream_oil: initialData.onstream_oil || "",
        onstream_water_cut: initialData.onstream_water_cut || "",
        equipment: initialData.equipment || "",
        equipment_specifications: initialData.equipment_specifications || "",
        job_category: initialData.job_category || "SAND_CONTROL",
      });
    }
  }, [job_id, initialData]);

  useEffect(() => {
    if (isDirty) {
      updateFormData(formData);
    }
    return () => updateFormData.cancel();
  }, [formData, updateFormData, isDirty]);

  const handleChangeNumber = (field) => (e) => {
    const value = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setIsDirty(true);
    }
  };

  const handleChangeText = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setIsDirty(true);
  };

  const handleWellChange = (selectedOption) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        well_id: selectedOption.value,
      }));
      setIsDirty(true);
  
      // Mengirimkan wellName ke parent
      const selectedWellName = selectedOption.label; // Mengambil nama well
      if (onWellNameChange) {
        onWellNameChange(selectedWellName); // Mengirim data ke parent
      }
    }
  };
  

  const handleJobCategoryChange = (selectedOption) => {
    if (selectedOption) {
      setFormData((prev) => ({
        ...prev,
        job_category: selectedOption.value,
      }));
      setIsDirty(true);
    }
  };

  const isFormValid = useCallback(() => {
    return (
      formData.well_id &&
      formData.onstream_gas &&
      formData.onstream_oil &&
      formData.onstream_water_cut &&
      formData.equipment &&
      formData.equipment_specifications &&
      formData.job_category
    );
  }, [formData]);

  const handleUpdate = async () => {
    if (!isFormValid()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await putPlanningUpdate(job_id, updatedData, jobType);
      toast({
        title: "Update Successful",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setIsDirty(false);
      onClose();
    } catch (error) {
      toast({
        title: "Update Failed",
        description: error.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <HStack>
        <FormControl isRequired>
          <FormLabel>Well</FormLabel>
          <ChakraSelect
            value={wellInstance?.find((opt) => opt?.value === formData.well_id)}
            onChange={handleWellChange}
            options={wellInstance}
            placeholder="Select well..."
            isClearable
            isSearchable
            getOptionLabel={(option) => option?.name}
            getOptionValue={(option) => option?.value}
          />
        </FormControl>
      </HStack>

      <Grid templateColumns="repeat(2, 1fr)" gap={6} mt={4}>
        <FormControl isRequired>
          <FormLabel>Onstream Oil</FormLabel>
          <Input
            type="text"
            pattern="[0-9]*"
            onChange={handleChangeNumber("onstream_oil")}
            value={formData.onstream_oil}
            onKeyDown={(e) => {
              if (
                e.key === "e" ||
                e.key === "E" ||
                e.key === "-" ||
                e.key === "+"
              ) {
                e.preventDefault();
              }
            }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Onstream Gas</FormLabel>
          <Input
            type="text"
            pattern="[0-9]*"
            onChange={handleChangeNumber("onstream_gas")}
            value={formData.onstream_gas}
            onKeyDown={(e) => {
              if (
                e.key === "e" ||
                e.key === "E" ||
                e.key === "-" ||
                e.key === "+"
              ) {
                e.preventDefault();
              }
            }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Onstream Water Cut</FormLabel>
          <Input
            type="text"
            pattern="[0-9]*"
            onChange={handleChangeNumber("onstream_water_cut")}
            value={formData.onstream_water_cut}
            onKeyDown={(e) => {
              if (
                e.key === "e" ||
                e.key === "E" ||
                e.key === "-" ||
                e.key === "+"
              ) {
                e.preventDefault();
              }
            }}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Equipment</FormLabel>
          <Input
            type="text"
            onChange={handleChangeText("equipment")}
            value={formData.equipment}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Equipment Specifications</FormLabel>
          <Input
            type="text"
            onChange={handleChangeText("equipment_specifications")}
            value={formData.equipment_specifications}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Job Category</FormLabel>
          <ChakraSelect
            value={jobCategories?.find(
              (opt) => opt?.value === formData.job_category
            )}
            onChange={handleJobCategoryChange}
            options={jobCategories}
            placeholder="Select job category..."
            isClearable
            isSearchable
            getOptionLabel={(option) => option?.value}
            getOptionValue={(option) => option?.value}
          />
        </FormControl>
      </Grid>

      <FileUploadSection
        title="Well Schematic"
        subtitle="Well Schematic"
        variableName="well_schematic"
        parentPath={null}
        allowedFileTypes={[".pdf", ".jpg", ".jpeg", ".png"]}
        maxFileSize={5}
      />

      <Button
        colorScheme="blue"
        onClick={() => setIsOpen(true)}
        mt={4}
        isDisabled={!isFormValid()}
      >
        Update Data
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Update
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to update this data?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleUpdate} ml={3}>
                Update
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default TechnicalWOWS;
