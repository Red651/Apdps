import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormLabel,
  Textarea,
  VStack,
  Select,
  useToast,
  Text,
  Icon,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  HStack,
  Grid,
  GridItem
} from "@chakra-ui/react";
import { 
  IconTable, 
  IconFiles, 
  IconTrash, 
  IconEdit,
  IconFileText,
  IconPlus,
  IconX
} from "@tabler/icons-react";
import FormInputFile from "../../Components/FormInputFile";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";
const JobDocuments = () => {
  const { state, dispatch } = useJobContext();
  const [onChangeData, setOnChangeData] = useState([]);
  const clearFileRef = useRef(null);
  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    file_id: "",
    document_type: "DRILLING_PLAN",
    remark: "",
    filename: "",
  });
  const fileInputRef = useRef(null);
  const toast = useToast();
  useEffect(() => {
    if (state?.initialOperationData?.actual_job?.job_documents) {
      setOnChangeData(state.initialOperationData.actual_job.job_documents);
    }
  }, [state]);
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }, []);
  const handleFileChange = useCallback(
    (file) => {
      if (file) {
         
        const allowedTypes = [
          "application/vnd.ms-excel",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "text/csv",
        ];
        
        if (allowedTypes.includes(file.type)) {
          setFiles(file);
        } else {
          toast({
            title: "Invalid file type",
            description: "Please upload a CSV or Excel file.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current();
          }
        }
      }
    },
    [toast]
  );
  const updateGlobalState = useCallback(
    (newData) => {
      dispatch({
        type: UPDATE_OPERATION_DATA,
        payload: {
          ...state.initialOperationData,
          actual_job: {
            ...state.initialOperationData.actual_job,
            job_documents: newData.length === 0 ? null : newData,
          },
        },
      });
    },
    [dispatch, state.initialOperationData]
  );
  const resetForm = useCallback(() => {
    setFormData({
      file_id: "",
      document_type: "DRILLING_PLAN",
      remark: "",
      filename: "",
    });
    setFiles(null);
    setEditIndex(null);
    if (fileInputRef.current) {
      fileInputRef.current();
    }
  }, []);
  const validateForm = useCallback(() => {
    const { document_type, remark } = formData;
    const errors = [];
    if (!document_type) {
      errors.push("Document Type");
    }
    if (editIndex === null && !files) {
      errors.push("File");
    }
    if (errors.length > 0) {
      toast({
        title: "Error",
        description: `Harap isi: ${errors.join(", ")}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    return true;
  }, [formData, files, editIndex, toast]);
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (!validateForm()) return;
  
  
      // Debug: Log file information
       
       
  
  
      // Validasi file duplikat
      const isDuplicateFile = onChangeData.some((item) => {
        // Jika sedang mengedit, abaikan file yang sedang diedit
        if (editIndex !== null && item === onChangeData[editIndex]) {
          return false;
        }
        return item.filename === files?.name;
      });
  
  
      if (isDuplicateFile) {
        toast({
          title: "Duplikasi File",
          description: "File dengan nama yang sama sudah ada.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return;
      }
  
  
      setLoading(true);
      const formFile = new FormData();
      
      try {
        // Debug: Pastikan file ditambahkan ke FormData
        if (files) {
          formFile.append("file", files);
           
        } else {
          console.error("No file selected");
          throw new Error("No file selected");
        }
  
  
        let newData;
        if (editIndex !== null) {
          // Update existing entry
          newData = { 
            ...formData, 
            file_id: onChangeData[editIndex].file_id, 
            filename: onChangeData[editIndex].filename 
          };
  
  
          if (files) {
            const response = await axios.post(
              `${import.meta.env.VITE_APP_URL}/utils/upload/file`,
              formFile,
              {
                headers: {
                  "Content-Type": "multipart/form-data",
                  "accept": "application/json",
                  "Authorization": `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
  
  
            // Debug: Log full response
             
  
  
            const fileInfo = response.data.data.file_info;
            newData.filename = fileInfo.filename;
            newData.file_id = fileInfo.id;
          }
        } else {
          // Add new entry
          const response = await axios.post(
            `${import.meta.env.VITE_APP_URL}/utils/upload/file`,
            formFile,
            {
              headers: {
                "Content-Type": "multipart/form-data",
                "accept": "application/json",
                "Authorization": `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
  
  
          // Debug: Log full response
           
  
  
          const fileInfo = response.data.data.file_info;
          newData = { 
            ...formData, 
            file_id: fileInfo.id, 
            filename: fileInfo.filename 
          };
        }
  
  
        const updatedData = editIndex !== null 
          ? onChangeData.map((item, index) => (index === editIndex ? newData : item))
          : [...onChangeData, newData];
  
  
        setOnChangeData(updatedData);
        updateGlobalState(updatedData);
        toast({
          title: editIndex !== null ? "Dokumen berhasil diperbarui" : "Dokumen berhasil ditambahkan",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        resetForm();
      } catch (error) {
        // Detailed error logging
        console.error("Full Error:", error);
        console.error("Error Response:", error.response?.data);
        console.error("Error Message:", error.message);
  
  
        toast({
          title: "Upload gagal",
          description: error.response?.data?.message || error.message || "Terjadi kesalahan saat mengunggah file.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    },
    [
      files,
      formData,
      onChangeData,
      editIndex,
      validateForm,
      toast,
      updateGlobalState,
      resetForm,
    ]
  );
  const handleEdit = useCallback((row, index) => {
    setFormData({
      file_id: row.file_id,
      document_type: row.document_type,
      remark: row.remark,
      filename: row.filename,
    });
    setEditIndex(index);
  }, []);
  const handleDelete = useCallback(
    (index) => {
      const updatedData = onChangeData.filter((_, i) => i !== index);
      setOnChangeData(updatedData);
      updateGlobalState(updatedData);
      toast({
        title: "File dihapus",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    },
    [onChangeData, updateGlobalState, toast]
  );
  const docType = [
    { name: "Drilling Plan", value: "Drilling Plan" },
    { name: "Completion Plan", value: "Completion Plan" },
    { name: "Well Design", value: "Well Design" },
    { name: "Mud Plan", value: "Mud Plan" },
    { name: "Cementing Plan", value: "Cementing Plan" },
    { name: "Well Trajectory Plan", value: "Well Trajectory Plan" },
    { name: "Risk Assessment Plan", value: "Risk Assessment Plan" },
    { name: "Safety Plan", value: "Safety Plan" },
    { name: "Environmental Plan", value: "Environmental Plan" },
    { name: "Logging Plan", value: "Logging Plan" },
    { name: "Pore Pressure Prediction", value: "Pore Pressure Prediction" },
    { name: "Hydraulics Plan", value: "Hydraulics Plan" },
    { name: "Casing Plan", value: "Casing Plan" },
    { name: "Contingency Plan", value: "Contingency Plan" },
  ];
  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
    <GridItem>
      <Flex p={4} borderWidth={1} borderRadius="md" direction="column">
        <Flex alignItems="center" mb={6}>
          <Icon as={IconFiles} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text fontSize="xl" fontWeight="bold" color="gray.700" fontFamily={"Mulish"}>
              {"Job Documents"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {"subtitle"}
            </Text>
          </Flex>
        </Flex>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Document Type</FormLabel>
            <Select
              name="document_type"
              value={formData.document_type}
              onChange={handleInputChange}
            >
              {docType.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Upload File</FormLabel>
            <VStack align="stretch" spacing={3}>
              <FormInputFile
                label=""
                onClearFile={(clear) => (fileInputRef.current = clear)}
                onFileSelect={handleFileChange}
              />
              {editIndex !== null && formData.filename && (
                <Flex 
                  alignItems="center" 
                  bg="blue.100" 
                  p={2} 
                  borderRadius="md"
                >
                  <Icon as={IconFileText} mr={2} />
                  <Text flex={1}>
                    Selected File: {formData.filename}
                  </Text>
                </Flex>
              )}
            </VStack>
          </FormControl>
          <FormControl>
            <FormLabel>Remarks</FormLabel>
            <Textarea
              name="remark"
              placeholder="Enter remarks"
              value={formData.remark}
              onChange={handleInputChange}
            />
          </FormControl>
          <Flex justifyContent="flex-end" mt={4}>
            <HStack spacing={2}>
              <Button
                colorScheme={editIndex !== null ? "yellow" : "blue"}
                onClick={handleSubmit}
                borderRadius="full"
                leftIcon={<Icon as={editIndex !== null ? IconEdit : IconPlus} />}
              >
                {editIndex !== null ? "Update" : "Tambah"} Equipment
              </Button>
              {editIndex !== null && (
                <Button
                  colorScheme="gray"
                  onClick={resetForm}
                  borderRadius="full"
                  leftIcon={<Icon as={IconX} />}
                >
                  Batal
                </Button>
              )}
            </HStack>
          </Flex>
        </VStack>
      </Flex>
    </GridItem>
    <GridItem>
      <Flex p={6} borderWidth={1} borderRadius="md" direction="column">
        <Flex alignItems="center" mb={6}>
          <Icon as={IconTable} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text fontSize="xl" fontWeight="bold" color="gray.700" fontFamily={"Mulish"}>
              {"Table"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {"subtitle"}
            </Text>
          </Flex>
        </Flex>
        {onChangeData.length > 0 ? (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Document Type</Th>
                <Th>File Name</Th>
                <Th>Remarks</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {onChangeData.map((row, index) => (
                <Tr key={index}>
                  <Td>{row.document_type}</Td>
                  <Td>{row.filename}</Td>
                  <Td>{row.remark}</Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        icon={<Icon as={IconEdit} />}
                        colorScheme="yellow"
                        size="sm"
                        onClick={() => handleEdit(row, index)}
                        aria-label="Edit row"
                        borderRadius={"full"}
                      />
                      <IconButton
                        icon={<Icon as={IconTrash} />}
                        colorScheme="red"
                        size="sm"
                        onClick={() => handleDelete(index)}
                        aria-label="Delete row"
                        borderRadius={"full"}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Text textAlign="center" color="gray.600">
            No variable data
          </Text>
        )}
      </Flex>
    </GridItem>
  </Grid>
  );
};
export default JobDocuments;