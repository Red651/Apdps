import React, { useState } from "react";
import CardFormK3 from "../Components/CardFormK3";
import FormInputFile from "../Components/FormInputFile";
import { readTabularFile } from "./Utils/ReadTabularFile";
import { Button, Flex, SimpleGrid } from "@chakra-ui/react";
import TableComponent from "../Components/TableComponent";

const WellPPFG = () => {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [formData, setFormData] = useState(null);
  const [items, setItems] = useState(null);

  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected for upload");
    }
    try {
      const response = await readTabularFile(file);
      
      setHeaders(response.data.headers);
      setItems(response.data.item);
    } catch (error) {
      console.error(error);
    }
  };

  const actionButton = () => {
    return (
      <Flex gap={4}>
        <Button colorScheme="blue">Upload</Button>
        <Button colorScheme="teal" onClick={handleUpload}>
          Show Table
        </Button>
      </Flex>
    );
  };
  return (
    <>
      <CardFormK3
        mt={4}
        title="Well Pore Pressure Form"
        actionButton={actionButton()}
        subtitle="Log"
      >
        <FormInputFile onFileSelect={setFile} />
      </CardFormK3>

      {headers && (
        <SimpleGrid  mt={4} >
          <CardFormK3 mt={4} overflowX={"auto"} width={"100%"} gap={4} overflow={"auto"} title="Well PPFG Table" subtitle="Log">
            <TableComponent headers={headers} data={items} />
          </CardFormK3>
        </SimpleGrid>
      )}
    </>
  );
};

export default WellPPFG;
