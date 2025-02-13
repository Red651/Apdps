import React, { useState } from "react";
import CardFormK3 from "../Components/CardFormK3";
import FormInputFile from "../Components/FormInputFile";
import { readTabularFile } from "./Utils/ReadTabularFile";
import { Button } from "@chakra-ui/react";
import TableComponent from "../Components/TableComponent";

const WellCorePlan = () => {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [formData, setFormData] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected for upload");
    }
    try {
      const response = await readTabularFile(file);
      
      setHeaders(response.data.headers);
    } catch (error) {
      console.error(error);
    }
  };

  const actionButton = () => {
    return (
      <Button colorScheme="blue" onClick={handleUpload}>
        Upload
      </Button>
    );
  };
  return (
    <>
      <CardFormK3
        mt={4}
        title="Well Core "
        actionButton={actionButton()}
        subtitle="Log"
      >
        <FormInputFile onFileSelect={setFile} />
      </CardFormK3>

      {headers && (
        <CardFormK3 mt={4} title="Well Core Table"  subtitle="Log">
          <TableComponent headers={headers} />
        </CardFormK3>
      )}
    </>
  );
};

export default WellCorePlan;
