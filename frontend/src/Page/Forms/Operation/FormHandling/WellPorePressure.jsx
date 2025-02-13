import React from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormInputFile from "../../Components/FormInputFile";
import { useToast, Button, Flex } from "@chakra-ui/react";

import { UploadFile } from "./Utils/UploadFileAPI";

const WellPorePressureForm = ({
  onDataChange = (e) => console.log(e),
  DataRaw,
}) => {
  const toast = useToast();
  const [file, setFile] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState(null);

  const handleFile = React.useCallback(
    (data) => {
      setFile(data);
    },
    [setFile]
  );

  React.useEffect(() => {
    onDataChange("well.well_ppfg", formData);
  }, [formData]);

  React.useEffect(() => {
    if (DataRaw?.well?.well_ppfg) {
      setFormData(DataRaw?.well?.well_ppfg);
    }
  }, [DataRaw]);
  // 
  // 
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
  const actionButtoRenderer = () => {
    return (
      <Button colorScheme="blue" width={"130px"} onClick={handleUpload}>
        Upload
      </Button>
    );
  };
  return (
    <CardFormK3
      title="Well Pore Pressure Form"
      actionButton={actionButtoRenderer()}
      subtitle="Well Pore Pressure Form"
    >
      <FormInputFile
        // acceptedOption={["csv", "xlsx", "xls"]}
        acceptedFormats=".pdf"
        label="Well PPFG"
        onFileSelect={(e) => handleFile(e)}
        valueName={formData?.filename}
      />
    </CardFormK3>
  );
};

export default WellPorePressureForm;
