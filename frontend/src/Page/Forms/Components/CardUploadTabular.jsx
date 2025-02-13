import React, { useState } from "react";
import CardFormK3 from "../Components/CardFormK3";
import FormInputFile from "../Components/FormInputFile";
import { readTabularFile } from "../Planning/Utils/ReadTabularFile";
import { Box, Button, Flex, SimpleGrid, useToast } from "@chakra-ui/react";
import TableComponent from "../Components/TableComponent";
import { FaCheck, FaPlus } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { ConvertDataToTable } from "../Planning/Utils/ConvertDataToTable";
import { FetchReusable } from "../../API/FetchReusable";
import NewFileUploadTabular from "./NewFileUploadTabular";

const CardUploadTabular = ({
  title = "Title Here",
  subtitle = "Title",
  value = null,
  file_id = null,
  name = null,
  

  OnChangeData = (e) => {
    console.log(e);
  },
}) => {
  const toast = useToast();
  const [file, setFile] = useState(null);
  const headaersAuthor ={
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  }
  const [headers, setHeaders] = useState(null);
  const [formData, setFormData] = useState(null);
  const [items, setItemss] = useState(null);
  const [loading, setLoading] = useState(false);
  const [icon, setIcon] = useState();
  const { job_id } = useParams();
  const jobID = job_id;
  const [isDisabled, setIsDisabled] = useState(false);
  const [color, setColor] = useState("blue");
  const [pathDonwload, setPathDonwload] = useState(null);

  // 
  // 

  React.useEffect(() => {
    if (jobID !== undefined) {
      if (value) {
        setFormData({
          file_id: value?.file_id,
          filename: value?.filename,
        });
      } else {
        setFormData(null);
      }
      // 
      setPathDonwload({
        download_path: value?.download_path,
        delete_path: value?.delete_path,
      });
      value ? setIsDisabled(true) : setIsDisabled(false);
      value ? setColor("green") : setColor("blue");
      // 
      if (value !== null) {
        const ResultConvert = ConvertDataToTable(value.data);
        // 
        setHeaders(ResultConvert?.headers);
        setItemss(ResultConvert?.item);
      }
      // setIsDisabled(true);
      // setColor("green");
    }
  }, [jobID]);

  React.useEffect(() => {
    OnChangeData(name, formData);
  }, [formData]);

  // const handleSetFile = (file) => {
  //   setFile(file);
  //   // value(false)
  //   setIsDisabled(false);
  // };

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
      setColor("red");
      return;
    }
    try {
      setLoading(true);
      const response = await readTabularFile(file);
      setHeaders(response.data.headers);
      setItemss(response.data.item);
      setFormData(() => {
        return {
          file_id: response.data.file_id,
          filename: response.data.filename,
        };
      });
      toast({
        title: "Success",
        description: "File Berhasil di Upload",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setIcon(<FaCheck />);
      setLoading(false);
      setColor("green");
      setIsDisabled(true);
      return OnChangeData(formData);
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
      throw error;
    }
  };

  const handleChangeSetFile = (file) => {
    setFile(file);
    // value(false)
    setIsDisabled(false);
  };

  const handlerDelete = async () => {
    try {
      const res = await FetchReusable(`/utils/delete/file/${formData?.file_id}`,'delete',headaersAuthor);
      if(res.success === true){
        toast({
          title: "Success",
          description: "File Berhasil di Hapus",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
        setFile(null);
        setHeaders(false);
        setColor("blue");
        setIsDisabled(false);
        setIcon(null);
        setFormData({
          file_id: null,
          filename: null,
        })
      }
      
    } catch (error) {
      toast({
        title: "Error",
        description: "File Gagal di Hapus",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  };
  const actionButton = () => {
    return (
      <Flex gap={2}>
        {isDisabled ? <Button onClick={handlerDelete} colorScheme={"red"}  >Delete</Button> : null}
        <Button
          colorScheme={color}
          rightIcon={icon}
          isLoading={loading}
          isDisabled={isDisabled}
          onClick={handleUpload}
          // onClick={handleUpload}
        >
          Upload
        </Button>
      </Flex>
    );
  };

  
  return (
    <>
      <CardFormK3
        mt={4}
        title={title}
        actionButton={actionButton()}
        subtitle={subtitle}
      >
        {/* <FormInputFile
          onFileSelect={handleChangeSetFile}
          acceptedFormats="[.csv,.xlsx,.xls]"
          valueName={formData?.filename}
        /> */}
        <NewFileUploadTabular />
        <SimpleGrid maxH={"400px"} overflow={"auto"}>
          <Box
            mt={4}
            overflowX={"auto"}
            Maxheight={"400px"}
            width={"100%"}
            gap={4}
          >
            {headers && <TableComponent headers={headers} data={items} />}
          </Box>
        </SimpleGrid>
      </CardFormK3>
    </>
  );
};

export default CardUploadTabular;