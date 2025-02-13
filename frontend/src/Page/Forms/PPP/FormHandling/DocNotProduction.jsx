import React from "react";
import CardFormK3 from "../../Components/CardFormK3";
import { Button, Text, useToast } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";
import FormInputFile from "../../Components/FormInputFile";
import UploadFile from "../utils/uploadFile";
import { IoMdCloseCircle } from "react-icons/io";
import { CheckIcon } from "@chakra-ui/icons";
import NewFileUpload from "../../Components/NewFileUpload";

const DocNotProduction = ({onChangeData=(e)=> console.log(e)}) => {
  const toast = useToast();
  const [color, setColor] = React.useState("blue");
  const [isLoading, setIsLoading] = React.useState(false);
  const [icon, setIcon] = React.useState(<FaPlus />);

  const [data, setData] = React.useState({
    file_id: null,
    filename: null,
  });

  // 

  React.useEffect(() => {
    onChangeData("dokumen_sumur_tidak_berproduksi", data);
  }, [data]);
  const [file, setFile] = React.useState(null);

  const uploadFIle = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await UploadFile(file);
      // 
      if (response.success === false) {
        toast({
          title: "Error",
          description: response.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setColor("red");
        setIcon(<IoMdCloseCircle />);
        setIsLoading(false);
      }
      if (response.success === true) {
        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setData({
          filename: response.data.file_info.filename,
          file_id: response.data.file_info.id,
        });
        setColor("green");
        setIcon(<CheckIcon />);
        setIsLoading(false);
      }
    } catch (error) {
      if (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "Internal Server Error",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setIsLoading(false);
      }
    }
  };
  const ResetUploadButton =()=> {
    setColor("blue");
    setIcon(<FaPlus />);
    setIsLoading(false);
  }
  const renderActioButton = () => {
    return (
      <Button colorScheme={color} leftIcon={icon} p="18px" onClick={uploadFIle}>
        Upload
      </Button>
    );
  };
  return (
    <div>
      <CardFormK3
        title="Dokumen Sumar Tidak Berproduksi"
        subtitle="* Required" colorSubtitle="red"
        icon={null}
        
      >
        <Text fontSize="18px">
          Untuk sumur yang ditutup dan tidak akan diproduksikan dilengkapi
          dengan:
          <br />
          a. Fotokopi formulir Migas bentuk lxi. <br />
          b. Data hasil uji kandungan lapisan atau hasil logging.
        </Text>
        <NewFileUpload title="Format PDF" acceptFormat=".pdf" onChange={(file) => setData({
          filename: file.filename,
          file_id: file.file_id
        })}/>
      </CardFormK3>
    </div>
  );
};

export default DocNotProduction;
