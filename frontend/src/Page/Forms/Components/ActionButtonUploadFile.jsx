import { Button, useToast } from "@chakra-ui/react";
import React from "react";
import { UploadFileBatch } from "../../API/PostKkks";

const ActionButtonUploadFile = ({ file,typeJob,errorMessage }) => {
    const toast = useToast();
    const [isLoading, setIsLoading] = React.useState(false);
    const [errorFile, setErrorFile] = React.useState([]);


    // React.useEffect(() => {
    //   errorMessage(errorFile);
    // }, [errorFile]);
    const handleSubmit = async () => {
    //   setIsLoading(true);
      const formData = new FormData();
      formData.append("file", file);
      try {
        const response = await UploadFileBatch(formData, typeJob);
        toast({
          title: "Success",
          description: "File Upload Success",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setTimeout(() => {
          window.location.reload();
          setIsLoading(false);
        }, 3000);
      } catch (error) {
        console.error(error.response);
        if (error.response.status === 400) {
          setErrorFile(error.response.data.message);
          toast({
            title: "Error",
            description: "File Tidak Sesuai",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setIsLoading(false);
        }
        if (error.response.status === 500) {
          toast({
            title: "Error",
            description: "Internal Server Error",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setIsLoading(false);
        }

        setIsLoading(false);
      }
    };
    return (
      <Button colorScheme="blue" borderRadius={"full"} isLoading={isLoading} onClick={handleSubmit}>
        Upload File
      </Button>
    );
  };


  export default ActionButtonUploadFile;