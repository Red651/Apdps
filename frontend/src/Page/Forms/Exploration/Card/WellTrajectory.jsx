import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Select,
  Input,
  Text,
  VStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Heading,
  Flex,
  Icon,
} from "@chakra-ui/react";
import Papa from "papaparse"; // You'll need to install this: npm install papaparse
import axios from "axios";
import {IconRoute2} from "@tabler/icons-react";

const WellTrajectory = ({ ondata }) => {
  const [fileType, setFileType] = useState("");
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const toast = useToast();
  const [msg, setMsg] = React.useState("");
  const fileInputRef = React.useRef(null);
  const [dataParent, setDataParent] = React.useState({
    file_id: null,
    data_format: null,
  });

  React.useEffect(() => {
    ondata(dataParent);
  }, [dataParent]);

  const handleFileTypeChange = (e) => {
    setFileType(e.target.value);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    setSelectedFile(selectedFile);
    if (selectedFile) {
      setFile(selectedFile);

      const formData = new FormData();
      formData.append("file", selectedFile);

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_APP_URL}/utils/read/tabular`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setCsvData(response.data);
        toast({
          title: "File read successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error reading file:", error);
        toast({
          title: "Error reading file",
          description:
            error.response?.data?.message || "An unexpected error occurred",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const parseCsvFile = (file) => {
    Papa.parse(file, {
      complete: (result) => {
        setCsvData(result.data);
      },
      header: true,
      skipEmptyLines: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_URL}/utils/upload/file`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      // 

      setDataParent({
        file_id: response.data.data.file_info.id,
        data_format: fileType,
      });

      setMsg(response.data.data.message);

      toast({
        title: msg,
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      toast({
        title: "File read successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      mt={6}
      padding={5}
      borderWidth="1px"
      borderRadius="lg"
      p={6}
      fontFamily={"Mulish"}
    >
      <form onSubmit={handleSubmit}>
        <Flex alignItems="center">
          <Icon as={IconRoute2} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              {"Trajectory"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {"subtitle"}
            </Text>
          </Flex>
        </Flex>
        <VStack spacing={4} align="stretch" mt={5}>
          <FormControl isRequired>
            <FormLabel>File Type</FormLabel>
            <Select
              placeholder="Select file type"
              value={fileType}
              onChange={handleFileTypeChange}
            >
              <option value="CSV">CSV</option>
              <option value="XLSX">XLSX</option>
              <option value="XLS">XLS</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Upload File</FormLabel>
            <Input
              hidden
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileChange}
            />
            <Button onClick={() => fileInputRef.current.click()}>
              Upload File
            </Button>
          </FormControl>

          {file && <Text>Selected file: {file.name}</Text>}

          <Button type="submit" colorScheme="blue">
            Upload
          </Button>
        </VStack>
      </form>

      {csvData && (
        <Box
          width={"100%"}
          maxWidth={"1500px"}
          maxHeight={"500px"}
          overflowY={"auto"}
          mt={6}
        >
          <Table variant="simple">
            <Thead>
              <Tr>
                {csvData.headers.map((row, rowIndex) => (
                  <>
                    <Th>NO</Th>
                    <Th key={rowIndex}>{row}</Th>
                  </>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {csvData.records.map((data, index) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  {Object.entries(data).map(([key, value]) => (
                    <>
                      <Td key={key}>{value}</Td>
                    </>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default WellTrajectory;
