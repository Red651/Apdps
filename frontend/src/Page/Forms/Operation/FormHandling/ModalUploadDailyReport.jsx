import React, { useState, useMemo } from "react";
import ModalAndContent from "../../Components/ModalAndContent";
import { Button, Flex, useToast } from "@chakra-ui/react";
import FileHandlingUpload from "../../Components/FileHandlingUpload";
import { UploadWITSML } from "./Utils/UploadWitml";
import { useLocation, useParams } from "react-router-dom";

const ModalUploadDailyReport = ({ isOpen, onClose }) => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const { job_id } = useParams();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  // const location = useLocation();
  // 

  //  
  // 
  const handleFileChange = React.useCallback((file) => {
    if (file) {
      setUploadedFile(file);
    }
  }, []);

  const handleUploadWitsML = async () => {
    if (!uploadedFile) {
      toast({
        title: "Error",
        description: "No File Selected",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      const response = await UploadWITSML(uploadedFile, job_id);

      if (response.status === 200) {
        toast({
          title: response.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => {
          window.location.reload();
          setLoading(false);
        }, 1000);
        return response;
      }
    } catch (error) {
      console.error(error);
      if (error.status === 422) {
        setLoading(false);
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      if (error.status === 500) {
        setLoading(false);
        toast({
          title: "Error",
          description: error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      throw error;
    }
  };

  const buttomSubmitUpload = () => {
    return (
      <Flex gap={4}>
        <Button colorScheme="gray" onClick={onClose} variant="solid">
          Cancel
        </Button>
        <Button
          colorScheme="blue"
          onClick={handleUploadWitsML}
          isDisabled={!uploadedFile}
          isLoading={loading}
          variant="solid"
        >
          Upload
        </Button>
      </Flex>
    );
  }; // only re-create buttons when onClose changes

  return (
    <ModalAndContent
      isOpen={isOpen}
      title="Upload Daily Report"
      onClose={onClose}
      actionButton={buttomSubmitUpload()}
    >
      {<FileHandlingUpload handleChange={handleFileChange} />}
    </ModalAndContent>
  );
};

export default ModalUploadDailyReport;
