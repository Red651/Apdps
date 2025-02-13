import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  Icon,
  InputGroup,
  useToast,
  Spinner,
} from "@chakra-ui/react";
import { IconUpload } from "@tabler/icons-react";
import axios from "axios";
import { getAreaID, GetFieldID, getWellStatus } from "../../../API/APIKKKS";
import { useDebounce } from "use-debounce"; // Make sure to install this package
import CardFormK3 from "../../../Forms/Components/CardFormK3";

const WellGeneralInfo = ({ handleChange, errorForms, initialData }) => {
  const [areaID, setAreaID] = useState([]);
  const [fieldID, setFieldID] = useState([]);
  const [wellStatus, setWellStatus] = useState([]);
  const [formData, setFormData] = useState({
    hydrocarbon_target: null,
    depth_datum: null,
    well_status: null,
    remark: null,
    area_id: null,
    field_id: null,
  });
  const [debouncedFormData] = useDebounce(formData, 300);
  const [wellSchematicFile, setWellSchematicFile] = useState(null);
  const [wellPPFGFile, setWellPPFGFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const editedData = await initialData;
        setFormData((prev) => ({
          ...prev,
          ...editedData,
        }));
      } catch (error) {
        console.error("Error fetching initial data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [initialData]);

  useEffect(() => {
    handleChange(debouncedFormData);
  }, [debouncedFormData, handleChange]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, setFileState) => {
    const file = e.target.files[0];
    setFileState(file);
  };

  const uploadFile = async (file, fieldName) => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formDataToUpload = new FormData();
    formDataToUpload.append("file", file);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_URL}/utils/upload/file`,
        formDataToUpload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.success) {
        const fileId = response.data.data.file_info.id;
        const fileName = file.name; // Ambil nama file dari objek File
        setFormData((prev) => ({
          ...prev,
          [fieldName]: {
            file_id: fileId,
            filename: fileName, // Simpan nama file
          },
        }));

        toast({
          title: "File uploaded",
          description: `File for ${fieldName} uploaded successfully.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("File upload failed:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload file. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" p={4}>
        <Spinner />
      </Box>
    );
  }

  return (
    <CardFormK3
      title="Well General Info"
      subtitle="Please fill out the following information to proceed."
    >
      <Box fontFamily={"Mulish"}>
        <VStack spacing={4} align="stretch">
          <HStack spacing={4}>
            <FormControl isInvalid={!!errorForms["area_id"]}>
              <FormLabel>Select Area</FormLabel>
              <Select
                name="area_id"
                value={formData.area_id || ""} // pastikan nilai ada
                onChange={handleInputChange}
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
                value={formData.field_id || ""} // pastikan nilai ada
                onChange={handleInputChange}
                placeholder={
                  formData.area_id ? "Select Field" : "Please select Area first"
                }
                isDisabled={!formData.area_id} // Disable jika area_id tidak ada
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
            <FormControl isInvalid={!!errorForms["hydrocarbon_target"]}>
              <FormLabel>Hydrocarbon Target</FormLabel>
              <Select
                name="hydrocarbon_target"
                value={formData.hydrocarbon_target}
                onChange={handleInputChange}
                placeholder="Select Hydrocarbon Target"
              >
                <option value="OIL">OIL</option>
                <option value="GAS">GAS</option>
              </Select>
            </FormControl>
          </HStack>

          <HStack spacing={4}>
            <FormControl isInvalid={!!errorForms["depth_datum"]}>
              <FormLabel>Depth Datum</FormLabel>
              <Select
                name="depth_datum"
                value={formData.depth_datum}
                onChange={handleInputChange}
              >
                <option value="" disabled>
                  Select Depth Datum
                </option>
                <option value="RT">RT</option>
                <option value="KB">KB</option>
                <option value="MSL">MSL</option>
              </Select>
            </FormControl>
            <FormControl isInvalid={!!errorForms["well_status"]}>
              <FormLabel>Well Status</FormLabel>
              <Select
                name="well_status"
                value={formData.well_status}
                onChange={handleInputChange}
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

          <FormControl isInvalid={!!errorForms["remark"]}>
            <FormLabel>Remark</FormLabel>
            <Textarea
              name="remark"
              value={formData.remark}
              onChange={handleInputChange}
              placeholder="Remark"
            />
          </FormControl>
        </VStack>
      </Box>
    </CardFormK3>
  );
};

export default WellGeneralInfo;
