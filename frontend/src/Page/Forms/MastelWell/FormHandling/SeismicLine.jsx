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
} from "@chakra-ui/react";
import { useJobContext } from "../../../../Context/JobContext";
import { ADD_WELL_MASTER } from "../../../../Reducer/reducer";
import { pathExecute } from "../../../../Page/API/APIKKKS";
import { PostUploadPhysicalItem } from "../../../API/PostKkks";

const SeismicLine = ({ title = "Seismic Line", subtitle = "Title" }) => {
  const { state, dispatch } = useJobContext();
  const toast = useToast();
  // "seismic_line": {
  //   "physical_item_id": "string",
  //   "seismic_line_name": "string",
  //   "average_velocity": 0,
  //   "shot_point_number": 0,
  //   "max_latitude": 0,
  //   "max_longitude": 0,
  //   "min_latitude": 0,
  //   "min_longitude": 0,
  //   "remark": "string"
  // },
  // const [formData, setFormData] = useState({
  //   physical_item_id: null,
  //   seismic_line_name: null,
  //   average_velocity: null,
  //   shot_point_number: null,
  //   max_latitude: null,
  //   max_longitude: null,
  //   min_latitude: null,
  //   min_longitude: null,
  //   remark: null,
  // });
  const [formData, setFormData] = useState(null);
// Initial form data structure
const initialFormDataStructure = {
  physical_item_id: null,
  seismic_line_name: null,
  average_velocity: null,
  shot_point_number: null,
  max_latitude: null,
  max_longitude: null,
  min_latitude: null,
  min_longitude: null,
  remark: null,
};
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const cancelRef = useRef();
  const initialDataLoaded = useRef(false);

  // Load initial data only once
  useEffect(() => {
    const seismicData = state?.wellMaster?.seismic_line;

    // Create formData with initial structure and available data
    const newFormData = {
      ...initialFormDataStructure,
      ...Object.fromEntries(
        Object.entries(seismicData || {}).filter(([_, v]) => v != null)
      ),
    };

    setFormData(newFormData);
    initialDataLoaded.current = true;
  }, [state?.wellMaster?.seismic_line]);

  // Debounce the dispatch update
  useEffect(() => {
    if (!initialDataLoaded.current || !formData) return;

    const timeoutId = setTimeout(() => {
      const seismicData = state?.wellMaster?.seismic_line;
      const shouldDispatch = Object.keys(initialFormDataStructure).some(
        (key) => formData[key] !== seismicData?.[key]
      );

      // if (shouldDispatch) {
      //   dispatch({
      //     type: ADD_WELL_MASTER,
      //     payload: {
      //       ...state.wellMaster,
      //       seismic_line: formData,
      //     },
      //   });
      // }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData, dispatch, state.wellMaster]);

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

          // Update formData with new file information
          setFormData((prev) => ({
            ...initialFormDataStructure,
            ...(prev || {}),
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
      const responseData = await pathExecute(
        `/utils/download/file/${formData?.physical_item_id}`,
        "get"
      );
      if (responseData) {
        const fileBlob = new Blob([responseData], {
          type: "application/octet-stream",
        });
        const fileURL = window.URL.createObjectURL(fileBlob);
        const downloadLink = document.createElement("a");

        const fileName = formData?.filename || "filename";

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
  }, [formData?.download_path, formData?.seismic_line_name, toast]);

  const handleDelete = useCallback(async () => {
    try {
      setDeleteLoading(true);
      const response = await pathExecute(formData?.delete_path, "delete");
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
  }, [formData?.delete_path, toast]);

  const handleInputChange = useCallback((field, value) => {
    setFormData((prev) => {
      // If this is the first input, create a new formData with all fields
      if (!prev) {
        return {
          ...initialFormDataStructure,
          [field]: value,
        };
      }

      // Otherwise, update the existing formData
      return {
        ...prev,
        [field]: value,
      };
    });
  }, []);

  return (
    <>
      <CardFormK3 mt={4} title={title} subtitle={subtitle}>
        <FormInputFile onFileSelect={handleUpload} isLoading={loading} />

        {formData?.physical_item_id && (
          <Flex alignItems="center" justifyContent="space-between">
            <Text bg="green.100" p={2} borderRadius="md" w="100%">
              Previous File: {formData?.filename}
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
        <SimpleGrid columns={2} gap={4}>
          <FormControlCard
            labelForm="Seismic Line Name"
            value={formData?.seismic_line_name}
            type="text"
            onChange={(e) =>
              handleInputChange("seismic_line_name", e.target.value)
            }
          />
          <FormControlCard
            labelForm="Shot Point Number"
            value={formData?.shot_point_number}
            type="number"
            onChange={(e) =>
              handleInputChange(
                "shot_point_number",
                e.target.value ? parseInt(e.target.value) : 0
              )
            }
          />
          <FormControlCard
            labelForm="Average Velocity"
            value={formData?.average_velocity}
            type="number"
            onChange={(e) =>
              handleInputChange(
                "average_velocity",
                e.target.value ? parseInt(e.target.value) : null
              )
            }
          />
          <FormControlCard
            labelForm="Remark"
            value={formData?.remark}
            type="text"
            onChange={(e) => handleInputChange("remark", e.target.value)}
          />
          {/* ///////////////////////////////////////// */}
          <FormControlCard
            labelForm="Min Latitude"
            value={formData?.min_latitude}
            type="number"
            step="any"
            onChange={(e) => handleInputChange("min_latitude", e.target.value)}
          />
          <FormControlCard
            labelForm="Max Latitude"
            value={formData?.max_latitude}
            type="number"
            step="any"
            onChange={(e) => handleInputChange("max_latitude", e.target.value)}
          />
          <FormControlCard
            labelForm="Min Longitude"
            value={formData?.min_longitude}
            type="number"
            step="any"
            onChange={(e) => handleInputChange("min_longitude", e.target.value)}
          />
          <FormControlCard
            labelForm="Max Longitude"
            value={formData?.max_longitude}
            type="number"
            step="any"
            onChange={(e) => handleInputChange("max_longitude", e.target.value)}
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

export default React.memo(SeismicLine);
