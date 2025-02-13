import React from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormInputFile from "../../Components/FormInputFile";
import { useToast, Button } from "@chakra-ui/react";

import { UploadFile } from "./Utils/UploadFileAPI";

const MudLogsCard = ({ onDataChange=(e)=>console.log(e), DataRaw  }) => {
  const toast = useToast();
  const [file, setFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState({
    file_id: null,
    filename: null,
  });

  const handleFile = React.useCallback(
    (data) => {
      setFile(data);
    },
    [setFile]
  );

  React.useEffect(()=> {
    onDataChange('well.mud_logs',formData)
  },[formData])

  React.useEffect(() => {
    if(DataRaw?.mud_logs) {
      setFormData(DataRaw?.mud_logs)
      
    }
  }, [DataRaw])

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected for upload");
      toast({
        title: "Error",
        description: "No File Selected",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);
    return await UploadFile(file)
      .then((response) => {
        toast({
          title: "Success",
          description: "File uploaded successfully",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        // 
        setFormData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "File upload failed",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        console.error(error);
        setLoading(false);
      });
  };

  React.useEffect(() => {});
  return (
    <CardFormK3 title="Mud Logs" subtitle="Mud Logs">
      <FormInputFile
        acceptedOption={["csv", "xlsx", "xls"]}
        label="Mud Logs"
        onFileSelect={(e) => handleFile(e)}
      />
      <Button colorScheme="blue" onClick={handleUpload}>
        Upload
      </Button>
    </CardFormK3>
  );
};

export default MudLogsCard;
