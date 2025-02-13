import React from "react";
import FormInputFile from "../../Components/FormInputFile";
import CardFormK3 from "../../Components/CardFormK3";
import { FaPlus } from "react-icons/fa6";
import { Button, Flex, Text, useToast } from "@chakra-ui/react";
import FormControlCard from "../../Components/FormControl";
import { PostUploadFile } from "../../../API/PostKkks";
import UploadFile from "../utils/uploadFile";
import { CheckIcon, CloseIcon } from "@chakra-ui/icons";
import { IoMdCloseCircle} from "react-icons/io"
import NewFileUpload from "../../Components/NewFileUpload";

const DocPengajuanP3 = ({onChangeOnData = (name,data) => console.log(name,data)}) => {
  const toast = useToast();
  const [color,setColor] = React.useState("blue");
  const [isLoading, setIsLoading] = React.useState(false);
  const [icon,setIcon] = React.useState(<FaPlus />);
  
  
  const [data, setData] = React.useState({
    file_id: null,
    filename:null,
  });
  React.useEffect(()=> {
    onChangeOnData('surat_pengajuan_ppp',data)
  },[data])

  // 
  const [file, setFile] = React.useState(null);

  const uploadFIle = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await UploadFile(file);
      // 
      if(response.success ===false) {
        toast({
          title: "Error",
          description: response.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        })
        setColor("red")
        setIcon(<IoMdCloseCircle/>)
        setIsLoading(false)
      }
      if(response.success ===true) {
        toast({
          title: "Success",
          description: response.message,
          status: "success",
          duration: 5000,
          isClosable: true,
        })
        setData({
          filename: response.data.file_info.filename,
          file_id: response.data.file_info.id
        })
        setColor("green")
        setIcon(<CheckIcon/>)
        setIsLoading(false)
      }
      
    } catch (error) {
      if(error){
        toast({
          title: "Error",
          description: "Internal Server Error",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
        setIsLoading(false)
      }
    }
  };

  const ResetUploadButton =()=> {
    setColor("blue");
    setIcon(<FaPlus />);
    setIsLoading(false);
  }

  const actionButtonRender = ()=> {
    return (
      <Button colorScheme={color} leftIcon={icon} p="18px" onClick={uploadFIle}>Upload</Button>
    )
  }
  return (
    <div>
      <CardFormK3 title="Dokumen Pengajuan P3" subtitle="* Required" colorSubtitle="red" icon={null}>
        <Flex gap={4} flexDirection={'column'}>
        <Text>
          Dokumen Pengajuan P3
          </Text>
          <NewFileUpload title="Format PDF" acceptFormat=".pdf" onChange={(file) => setData({
          filename: file.filename,
          file_id: file.file_id
        })}/>
          {/* <FormControlCard labelForm="Masukkan" type={"text"} /> */}
          
        </Flex>
      </CardFormK3>
    </div>
  );
};

export default DocPengajuanP3;
