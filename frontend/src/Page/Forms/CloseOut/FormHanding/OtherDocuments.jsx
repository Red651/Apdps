import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Card,
  CardBody,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Textarea,
  VStack,
  useToast,
  Text,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import { IconTable, IconFiles, IconTrash } from "@tabler/icons-react";
import FormInputFile from "../../Components/FormInputFile";

const OtherDocuments = ({ data, onChange }) => {
  const [onChangeData, setOnChangeData] = useState([]);
  const clearFileRef = useRef(null);

  useEffect(() => {
    if (data?.well?.dokumen_lainnya) {
      setOnChangeData(data.well?.dokumen_lainnya);
    }
  }, [data]);

  const [files, setFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    file_id: "",
    remark: "",
    filename: "",
  });

  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (file) => {
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
      }
    }
  };

  const handleAddClick = async (e) => {
    e.preventDefault();
    if (!files) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    const formFile = new FormData();
    formFile.append("file", files);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_URL}/utils/upload/file`,
        formFile,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const fileInfo = response.data.data.file_info;

      const newData = {
        ...formData,
        file_id: fileInfo.id,
        filename: fileInfo.filename,
      };

      const updatedData = [...onChangeData, newData];
      setOnChangeData(updatedData);

      onChange("dokumen_lainnya", updatedData);

      setFormData({
        file_id: "",
        remark: "",
        filename: "",
      });

      setFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current();
      }

      toast({
        title: "File uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error.response?.data || error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading the file.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (index) => {
    const updatedData = onChangeData.filter((_, i) => i !== index);
    setOnChangeData(updatedData);
    onChange("dokumen_lainnya", updatedData);

    toast({
      title: "File deleted successfully",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Flex gap={6}>
      <Card width="50%">
        <Flex alignItems="center" mb={6}>
          <Icon as={IconFiles} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              {"Dokumen Lainnya"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {""}
            </Text>
          </Flex>
        </Flex>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <FormControl>
              <FormLabel>Upload File</FormLabel>
              <FormInputFile
                label=""
                onClearFile={(clear) => (fileInputRef.current = clear)}
                onFileSelect={handleFileChange}
              />
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
            <Button
              colorScheme="blue"
              isLoading={loading}
              onClick={handleAddClick}
              loadingText="Uploading..."
            >
              Add
            </Button>
          </VStack>
        </CardBody>
      </Card>
      <Card width="50%">
        <Flex alignItems="center" mb={6}>
          <Icon as={IconTable} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              {"Table"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {"subtitle"}
            </Text>
          </Flex>
        </Flex>
        <CardBody>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>File Name</Th>
                <Th>Remarks</Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {onChangeData.map((row, index) => (
                <Tr key={index}>
                  <Td>{row.filename}</Td>
                  <Td>{row.remark}</Td>
                  <Td>
                    <IconButton
                      icon={<Icon as={IconTrash} />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleDelete(index)}
                      aria-label="Delete row"
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Flex>
  );
};

export default React.memo(OtherDocuments);