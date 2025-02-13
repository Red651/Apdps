import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormInputFile from "../../Components/FormInputFile";
import FormControlCard from "../../Components/FormControl";
import {
  Button,
  Flex,
  useToast,
  Text,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  SimpleGrid,
  Grid,
} from "@chakra-ui/react";
import { useJobContext } from "../../../../Context/JobContext";
import { ADD_WELL_MASTER } from "../../../../Reducer/reducer";
import { pathExecute } from "../../../../Page/API/APIKKKS";
import { PostUploadPhysicalItem } from "../../../API/PostKkks";

const WellTrajetory = ({
  title = "Well Trajectory",
  subtitle = "Input Well Trajectory",
}) => {
  const { state, dispatch } = useJobContext();
  const toast = useToast();


  // Memoize initial form data structure
  const initialFormDataStructure = useMemo(() => ({
    unit_type: "METRICS",
    physical_item_id: null,
    survey_start_date: null,
    survey_end_date: null,
    top_depth: null,
    base_depth: null,
    survey_type: null,
    filename: null,
  }), []);


  const [formData, setFormData] = useState(initialFormDataStructure);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  const cancelRef = useRef();
  const previousFormDataRef = useRef(initialFormDataStructure);
  const debounceRef = useRef(null);


  // Memoized comparison function
  const compareFormData = useCallback((current, previous) => {
    return Object.keys(current).some(key => {
      // Special handling for numeric fields
      if (['top_depth', 'base_depth'].includes(key)) {
        const currentValue = current[key] !== null ? parseFloat(current[key]) : null;
        const previousValue = previous[key] !== null ? parseFloat(previous[key]) : null;
        return currentValue !== previousValue;
      }
      
      // Default comparison for other fields
      return JSON.stringify(current[key]) !== JSON.stringify(previous[key]);
    });
  }, []);


  // Load initial data
  useEffect(() => {
    const wellTrajetoryData = state?.wellMaster?.well_trajectory;
    
    const newFormData = {
      ...initialFormDataStructure,
      unit_type: wellTrajetoryData?.unit_type || "METRICS",
      physical_item_id: wellTrajetoryData?.physical_item_id || null,
      survey_start_date: wellTrajetoryData?.survey_start_date || null,
      survey_end_date: wellTrajetoryData?.survey_end_date || null,
      top_depth: wellTrajetoryData?.top_depth != null 
        ? wellTrajetoryData.top_depth.toString() 
        : null,
      base_depth: wellTrajetoryData?.base_depth != null 
        ? wellTrajetoryData.base_depth.toString() 
        : null,
      survey_type: wellTrajetoryData?.survey_type || null,
      filename: wellTrajetoryData?.filename || null,
    };


    setFormData(newFormData);
    previousFormDataRef.current = newFormData;
  }, [state?.wellMaster?.well_trajectory, initialFormDataStructure]);


  // Dispatch effect with minimal dependencies
  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }


    // Create new timeout
    debounceRef.current = setTimeout(() => {
      // Convert form data to numeric values
      const numericFormData = Object.entries(formData).reduce((acc, [key, value]) => {
        acc[key] = ['top_depth', 'base_depth'].includes(key) 
          ? (value !== null ? parseFloat(value) : null)
          : value;
        return acc;
      }, {});


      // Check if data has changed
      const hasChanged = compareFormData(
        numericFormData, 
        previousFormDataRef.current
      );


      // Dispatch only if data has changed
      if (hasChanged) {
        dispatch({
          type: ADD_WELL_MASTER,
          payload: {
            ...state.wellMaster,
            well_trajectory: {
              ...state.wellMaster.well_trajectory,
              ...numericFormData,
            },
          },
        });


        // Update previous data reference
        previousFormDataRef.current = numericFormData;
      }
    }, 500);


    // Cleanup timeout
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [compareFormData, dispatch, state.wellMaster, formData]);


  // Memoized input change handler
  const handleInputChange = useCallback((field, value, type) => {
    setFormData(prev => {
      const newFormData = { ...prev };
      
      if (type === "date") {
        newFormData[field] = value;
      } else {
        newFormData[field] = value === "" 
          ? null 
          : type === "number" 
            ? parseFloat(value) 
            : value;
      }
      
      return newFormData;
    });
  }, []);

  const handleUpload = useCallback(
    async (selectedFile) => {
      if (!selectedFile) return;
      try {
        setLoading(true);
        const formDataUpload = new FormData();
        formDataUpload.append("file", selectedFile);
        const uploadResponse = await PostUploadPhysicalItem(formDataUpload);
        if (uploadResponse.data.success) {
          const newFileId =
            uploadResponse.data.data.physical_item_info.physical_item_id;
          setFormData((prev) => ({
            ...prev,
            physical_item_id: newFileId,
            filename: selectedFile.name,
          }));
          toast({
            title: "Success",
            description: "File successfully uploaded",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        } else {
          throw new Error(uploadResponse.data.message);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error.message || "Upload failed",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  const handleDownload = useCallback(async () => {
    try {
      const responseData = await pathExecute(
        `/utils/download/file/${formData.physical_item_id}`,
        "get"
      );
      if (responseData) {
        const fileBlob = new Blob([responseData], {
          type: "application/octet-stream",
        });
        const fileURL = window.URL.createObjectURL(fileBlob);
        const downloadLink = document.createElement("a");

        const fileName = formData.filename || "well_trajectory_file";

        downloadLink.href = fileURL;
        downloadLink.download = fileName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        window.URL.revokeObjectURL(fileURL);
      } else {
        throw new Error("Failed to download the file. Please try again.");
      }
    } catch (error) {
      toast({
        title: "Download Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [formData.download_path, formData.well_trajectory_name, toast]);

  const handleDelete = useCallback(async () => {
    try {
      setDeleteLoading(true);
      const response = await pathExecute(formData.delete_path, "delete");
      if (response) {
        toast({
          title: "Success",
          description: "File successfully deleted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setIsAlertOpen(false);
        setFormData((prev) => ({
          ...prev,
          physical_item_id: null,
          download_path: "",
          delete_path: "",
        }));
      } else {
        throw new Error("Failed to delete the file.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  }, [ toast]);


  return (
    <>
      <CardFormK3 mt={4} title={title} subtitle={subtitle}>
        <FormInputFile onFileSelect={handleUpload} isLoading={loading} />

        {formData.physical_item_id && (
          <Flex alignItems="center" justifyContent="space-between">
            <Text bg="green.100" p={2} borderRadius="md" w="100%">
              Previous File: {formData.filename}
            </Text>
            <Flex>
              <Button colorScheme="blue" ml={2} onClick={handleDownload}>
                Download
              </Button>
              <Button
                colorScheme="red"
                ml={2}
                onClick={() => setIsAlertOpen(true)}
                isLoading={deleteLoading}
              >
                Delete
              </Button>
            </Flex>
          </Flex>
        )}
        <Grid>
          <FormControlCard
            labelForm="Survey Type"
            value={formData.survey_type}
            type="text"
            onChange={(e) => handleInputChange("survey_type", e.target.value)}
          />
        </Grid>
        <SimpleGrid columns={2} gap={4}>
          <FormControlCard
            labelForm="Top Depth"
            value={formData.top_depth}
            type="number"
            onChange={(e) =>
              handleInputChange(
                "top_depth",
                e.target.value ? parseInt(e.target.value) : 0
              )
            }
          />
          <FormControlCard
            labelForm="Base Depth"
            value={formData.base_depth}
            type="number"
            onChange={(e) =>
              handleInputChange(
                "base_depth",
                e.target.value ? parseInt(e.target.value) : 0
              )
            }
          />
          <FormControlCard
            labelForm="Survey Start Date"
            value={formData.survey_start_date}
            type="date"
            onChange={(e) =>
              handleInputChange("survey_start_date", e.target.value, "date")
            }
          />
          <FormControlCard
            labelForm="Survey End Date"
            value={formData.survey_end_date}
            type="date"
            onChange={(e) =>
              handleInputChange("survey_end_date", e.target.value, "date")
            }
          />
        </SimpleGrid>
      </CardFormK3>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Delete{" "}
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this file? This action cannot be
              undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsAlertOpen(false)}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDelete}
                ml={3}
                isLoading={deleteLoading}
              >
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default React.memo(WellTrajetory);
