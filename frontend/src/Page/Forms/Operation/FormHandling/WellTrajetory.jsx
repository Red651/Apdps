import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Grid
} from "@chakra-ui/react";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";
import { pathExecute } from "../../../../Page/API/APIKKKS";
import { PostUploadPhysicalItem } from "../../../API/PostKkks";

const WellTrajetory = ({ title = "Well Trajectory", subtitle = "Input Well Trajectory" }) => {
  const { state, dispatch } = useJobContext();
  const toast = useToast();
  const [formData, setFormData] = useState({
    unit_type: "METRICS",
    physical_item_id: null,
    survey_start_date: null,
    survey_end_date: null,
    top_depth: null,
    base_depth: null,
    survey_type: null,
    filename: null,
  });

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const cancelRef = useRef();
  const initialDataLoaded = useRef(false);

  // Load initial data only once

  // "well_trajectory": {
  //       "unit_type": "METRICS",
  //       "physical_item_id": "string",
  //       "survey_start_date": "2024-11-20",
  //       "survey_end_date": "2024-11-20",
  //       "top_depth": 0,
  //       "base_depth": 0,
  //       "survey_type": "string"
  // },
  
  useEffect(() => {
    const WellTrajetoryData =
    state?.initialOperationData?.actual_job?.well?.well_trajectory;
    if (WellTrajetoryData && !initialDataLoaded.current) {
      setFormData({
        unit_type: WellTrajetoryData.unit_type || "METRICS",
        physical_item_id: WellTrajetoryData.physical_item_id || null,
        survey_start_date: WellTrajetoryData.survey_start_date || null,
        survey_end_date: WellTrajetoryData.survey_end_date || null,
        top_depth: WellTrajetoryData.top_depth.toString() || null,
        base_depth: WellTrajetoryData.base_depth.toString() || null,
        survey_type: WellTrajetoryData.survey_type || null,
        filename: WellTrajetoryData.filename || null,
      });
      initialDataLoaded.current = true;
    }
  }, [state?.initialOperationData]);

  // Debounce the dispatch update
  useEffect(() => {
    if (!initialDataLoaded.current) return;

    const timeoutId = setTimeout(() => {
      const WellTrajetoryData =
        state?.initialOperationData?.actual_job?.well?.well_trajectory;
      const shouldDispatch = Object.keys(formData).some(
        (key) => formData[key] !== WellTrajetoryData?.[key]
      );

      if (shouldDispatch) {
        dispatch({
          type: UPDATE_OPERATION_DATA,
          payload: {
            ...state.initialOperationData,
            actual_job: {
              ...state.initialOperationData.actual_job,
              well: {
                ...state.initialOperationData.actual_job.well,
                well_trajectory: formData,
              },
            },
          },
        });
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData, dispatch, state.initialOperationData]);

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
      const responseData = await pathExecute(`/utils/download/file/${formData.physical_item_id}`, "get");
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
  }, [formData.delete_path, toast]);

  const handleInputChange = useCallback((field, value, type) => {
    let newValue;

    if (type === "date") {
      newValue = value; // Assume the date is a valid string
    } else {
      newValue = value === "" ? "" : parseFloat(value);
    }

    if (!isNaN(newValue) || newValue === "" || type === "date") {
      setFormData((prev) => ({
        ...prev,
        [field]: newValue,
      }));
    }
  }, []);

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
            onChange={(e) =>
              handleInputChange("survey_type", e.target.value)
            }
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
              handleInputChange(
                "survey_start_date",
                e.target.value,
                "date"
              )
            }
          />
          <FormControlCard
            labelForm="Survey End Date"
            value={formData.survey_end_date}
            type="date"
            onChange={(e) => handleInputChange("survey_end_date", e.target.value, "date")}
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
