import React, { useState } from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormInputFile from "../../Components/FormInputFile";
import { readTabularFile } from "../../Planning/Utils/ReadTabularFile";
import { Box, Button, Flex, SimpleGrid, useToast } from "@chakra-ui/react";
import TableComponent from "../../Components/TableComponent";
import { FaCheck } from "react-icons/fa";
import FormControlCard from "../../Components/FormControl";
import { useParams } from "react-router-dom";
import { ConvertDataToTable } from "../../Planning/Utils/ConvertDataToTable"; 

const SeismicLine = ({
  title = "Seismic Line",
  subtitle = "* Required",
  value = null,
  name = null,
  OnChangeData = (e) => {
    
  },
}) => {
  const toast = useToast();
  const { job_id } = useParams();
  
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(false);
  const [icon, setIcon] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const [color, setColor] = useState("blue");
  const [formData, setFormData] = useState({
    file_id: null,
    filename: null,
    seismic_line_name: null,
    shot_point_number: null,
  });
  const [pathDownload, setPathDownload] = useState(null);
// 
  React.useEffect(() => {
    if (job_id !== undefined) {
      if (value) {
        setFormData({
          file_id: value?.file_id,
          filename: value?.filename,
          seismic_line_name: value?.seismic_line_name || null,
          shot_point_number: value?.shot_point_number || null,
        });
        
        setPathDownload({
          download_path: value?.download_path,
          delete_path: value?.delete_path,
        });

        const resultConvert = ConvertDataToTable(value.data);
        setHeaders(resultConvert?.headers);
        setItems(resultConvert?.item);
        setIsDisabled(true);
        setColor("green");
      } else {
        setFormData({
          file_id: null,
          filename: null,
          seismic_line_name: null,
          shot_point_number: null,
        });
        setIsDisabled(false);
        setColor("blue");
      }
    }
  }, [job_id, value]);

  React.useEffect(() => {
    OnChangeData(name, formData);
  }, [formData]);

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "No File Selected",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setColor("red");
      return;
    }

    try {
      setLoading(true);
      const response = await readTabularFile(file);
      
      setHeaders(response.data.headers);
      setItems(response.data.item);
      setFormData(prev => ({
        ...prev,
        file_id: response.data.file_id,
        filename: response.data.filename,
      }));

      toast({
        title: "Success",
        description: "File Berhasil di Upload",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      setIcon(<FaCheck />);
      setColor("green");
      setIsDisabled(true);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "File Tidak Sesuai",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setColor("red");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSetFile = (file) => {
    setFile(file);
    setIsDisabled(false);
  };

  const actionButton = () => {
    return (
      <Flex gap={2}>
        {isDisabled && <Button>Download</Button>}
        <Button
          colorScheme={color}
          rightIcon={icon}
          isLoading={loading}
          isDisabled={isDisabled}
          onClick={handleUpload}
        >
          Upload
        </Button>
      </Flex>
    );
  };

  return (
    <CardFormK3
      mt={4}
      title={title}
      actionButton={actionButton()}
      subtitle={subtitle}
    >
      <FormInputFile
        onFileSelect={handleChangeSetFile}
        acceptedFormats="[.csv,.xlsx,.xls]"
        valueName={formData?.filename}
      />
      
      <Flex gap={4}>
        <FormControlCard
          labelForm="Seismic Line Name"
          value={formData.seismic_line_name}
          type="text"
          onChange={(e) => {
            setFormData(prev => ({
              ...prev,
              seismic_line_name: e.target.value,
            }));
          }}
        />
        <FormControlCard
          labelForm="Shot Point Number"
          value={formData.shot_point_number}
          type="number"
          onChange={(e) => {
            setFormData(prev => ({
              ...prev,
              shot_point_number: parseInt(e.target.value),
            }));
          }}
        />
      </Flex>

      <SimpleGrid maxH={"400px"} overflow={"auto"}>
        <Box
          mt={4}
          overflowX="auto"
          Maxheight="400px"
          width="100%"
          gap={4}
        >
          {headers && <TableComponent headers={headers} data={items} />}
        </Box>
      </SimpleGrid>
    </CardFormK3>
  );
};

export default React.memo(SeismicLine);