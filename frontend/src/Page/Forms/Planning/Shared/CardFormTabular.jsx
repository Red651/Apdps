import React, { useState } from "react";
import CardFormK3 from "../../Components/CardFormK3";

import {
  Box,
  Button,
  Flex,
  Icon,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import TableComponent from "../../Components/TableComponent";
import { FaCheck, FaPlus } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { ConvertDataToTable } from "../Utils/ConvertDataToTable";

import NewFileUploadTabular from "../../Components/NewFileUploadTabular";
import { IconFileUpload } from "@tabler/icons-react";
const CardFormTabular = ({
  title = "Title Here",
  subtitle = "Title",
  initialData = null,
  titleUploadFile = "Upload File",
  acceptFormat = [".xls", ".xlsx", ".csv"],
  file_id = null,
  name = null,
  visibleTable = true,
  maxFileSize = 5,
  OnChangeData = (e) => {},
}) => {
  //
  const toast = useToast();
  const [file, setFile] = useState(null);
  const { job_id } = useParams();
  const headaersAuthor = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const [formData, setFormData] = useState(null);

  //

 
  React.useEffect(() => {
    if (initialData) {
      const data = initialData?.data
        ? ConvertDataToTable(initialData?.data)
        : null;

      setFormData({
        file_id: initialData?.file_id,
        filename: initialData?.filename,
        data: data,
      });
    } else {
      // Jika tidak ada initialData atau tidak ada data yang valid, set formData ke null
      setFormData(null);
    }
  }, [job_id]);

  //

  React.useEffect(() => {
    OnChangeData(name, formData);
  }, [formData]);

  //

  const handleChange = (data) => {
    try {
      
      setFormData(data);  
    } catch (error) {
      
    }
    
  };

  return (
    <>
      <CardFormK3 mt={4} title={title} subtitle={subtitle}>
        <NewFileUploadTabular
          onChange={(e)=> handleChange(e)}
          initialData={initialData}
          title={titleUploadFile}
          acceptFormat={acceptFormat}
          maxFileSize={maxFileSize}
        />
        <SimpleGrid maxH={"400px"} overflow={"auto"}>
          <Box
            mt={4}
            overflowX={"auto"}
            Maxheight={"400px"}
            width={"100%"}
            gap={4}
          >
            <Flex alignItems="center" gap={2}>
              <Icon as={IconFileUpload} boxSize={6} color="blue.500" />
              <Text fontSize="sm" color="gray.600">
                Allowed types: {acceptFormat.join(", ")} (Max: {maxFileSize} MB)
              </Text>
            </Flex>
            {formData?.data && visibleTable === true && (
              <TableComponent
                headers={formData?.data.headers}
                data={formData?.data.item}
              />
            )}
          </Box>
        </SimpleGrid>
      </CardFormK3>
    </>
  );
};

export default CardFormTabular;
