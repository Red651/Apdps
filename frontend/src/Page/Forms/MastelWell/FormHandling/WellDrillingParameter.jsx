import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Button,
  Text,
  Icon,
  Grid,
  GridItem,
  Flex,
  IconButton,
  useToast,
  Spinner,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Heading,
} from "@chakra-ui/react";
import { IconFile, IconTrash, IconUpload } from "@tabler/icons-react";
import axios from "axios";
import FormInputFile from "../../Components/FormInputFile";
import { PostUploadFile } from "../../../API/PostKkks";


const WellDrillingParameter = ({ onParameterChange, initialData }) => {
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const clearFileInput = useRef(null);
  const [formData, setFormData] = useState(null);
  
  
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (initialData) {
          setUploadedFile(initialData);
          
        }
      } catch (error) {
        console.error("Error fetching initial data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [initialData]);

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFile = event.target.files[0];
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleRemoveUploadedFile = () => {
    setUploadedFile(null);
    onParameterChange(null);
  };

  const handleFileSelect = useCallback((file) => {
    setFormData((prevData) => ({
      ...prevData,
      image_file: file,
    }));
  }, []);

  const handleUpload = useCallback(async () => {
    setLoading(true);

    try{
    if (!formData.image_file) {
      toast({
        title: "No file selected",
        description: "Please select a file to upload.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // const url = `${import.meta.env.VITE_APP_URL}/utils/upload/file`;
    // const formData = new FormData();
    // formData.append("file", file);

    const formDataUpload = new FormData();
    formDataUpload.append("file", formData.image_file);

    const response = await PostUploadFile(formDataUpload);

      if (response?.data?.success) {
        const uploadedFileInfo = {
          file_id: response.data.data.file_info.id,
          filename: response.data.data.file_info.filename,
        };

        setUploadedFile(uploadedFileInfo);
        onParameterChange(uploadedFileInfo);
        setFile(null);

        toast({
          title: "File uploaded successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("File upload failed");
      }
    } catch (error) {
      console.error("File upload failed. Error details:", error);
      toast({
        title: "File upload failed",
        description: "An error occurred while uploading the file. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  });
  

  if (loading) {
    return (
      <Box textAlign="center" p={4}>
        <Spinner />
      </Box>
    );
  }

  // 
  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={4} fontFamily={"Mulish"}>
      <GridItem>
        <Box borderWidth="1px" borderRadius="lg" p={6} height="100%">
          <Flex justifyContent="space-between" alignItems="center" mb={6}>
            <Flex alignItems="center" flexDirection="row">
              <Icon as={IconFile} boxSize={12} color="gray.800" mr={3} />
              <Flex flexDirection="column">
                <Text fontSize="xl" fontWeight="bold" color="gray.700">
                  Well Drilling Parameters
                </Text>
                <Text fontSize="md" color="gray.600">
                  Upload Well Drilling Parameters
                </Text>
              </Flex>
            </Flex>
          </Flex>

          <VStack spacing={4} align="stretch">
            {/* <FormControl>
              <FormLabel>Select Parameter File</FormLabel>
              <Input type="file" onChange={handleFileChange} accept=".csv,.xlsx,.xls" />
            </FormControl> */}

            <FormInputFile
            label="Upload Image"
            acceptedFormats=".jpg,.jpeg,.png"
            onFileSelect={handleFileSelect}
            onClearFile={(clearFn) => {
              clearFileInput.current = clearFn;
            }}
          />

            {/* {file && (
              <Box borderWidth="1px" borderRadius="md" p={4}>
                <Text fontWeight="bold" mb={2}>Selected File:</Text>
                <Flex justifyContent="space-between" alignItems="center">
                  <Text>{file.name}</Text>
                  <IconButton
                    icon={<Icon as={IconTrash} />}
                    colorScheme="red"
                    size="sm"
                    onClick={handleRemoveFile}
                    aria-label="Remove file"
                  />
                </Flex>
              </Box>
            )} */}

            <Flex justifyContent="flex-end">
              <Button
                colorScheme="blue"
                onClick={handleUpload}
                // isDisabled={!file}
                leftIcon={<Icon as={IconUpload} />}
              >
                Upload Parameter
              </Button>
            </Flex>
          </VStack>
        </Box>
      </GridItem>

        <GridItem>
        <Box borderWidth="1px" borderRadius="lg" height="100%">
        <Tabs display="flex" flexDirection="column" height="100%">
          <TabList position="sticky" top={0} bg="white" zIndex={1}>
            <Tab>File</Tab>
          </TabList>
          <TabPanels flex={1} overflowY="auto">
            <TabPanel height="100%" p={6}>
              <Box overflowX="auto" height="100%">
            {uploadedFile ? (
            <Flex justifyContent="space-between" alignItems="center">
              <Text>{uploadedFile?.filename || initialData?.well_drilling_parameter?.filename}</Text>
              <IconButton
                icon={<Icon as={IconTrash} />}
                colorScheme="red"
                size="sm"
                onClick={handleRemoveUploadedFile}
                aria-label="Remove uploaded parameter"
              />
            </Flex>
            ): (
              <Flex
              justifyContent="center"
              flexDirection={"column"}
              alignItems="center"
              height="100%"
            >
              <Heading fontFamily={"Mulish"}>Tidak Ada File</Heading>
            </Flex>
            )}
          </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
        </GridItem>
    </Grid>
  );
};

export default WellDrillingParameter;
