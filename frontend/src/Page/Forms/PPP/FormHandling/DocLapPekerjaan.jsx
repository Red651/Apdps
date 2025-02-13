import React from "react";
import CardFormK3 from "../../Components/CardFormK3";
import { Button, Text, useToast } from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { IoMdCloseCircle } from "react-icons/io";
import UploadFile from "../utils/uploadFile";
import { FaPlus } from "react-icons/fa";
import FormInputFile from "../../Components/FormInputFile";
import NewFileUpload from "../../Components/NewFileUpload";

const DocLapPekerjaan = ({onChangeData = (e,data)=> console.log(e,data)}) => {
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
    onChangeData("dokumen_laporan_pekerjaan", data);
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
        title="Dokumen Laporan Pekerjaan"
        subtitle="* Required" colorSubtitle="red"
        icon={null}
        
      >
        <Text fontSize="18px">
          Laporan Pekerjaan yang ditandatangani pejabat KKKSdan berisi informasi
          Berikut: <br />
          1. Resume/riwayat singkat operasi kegiatan pekerjaanpemboran sumur
          dari awal/MIRU sampai dengankompleksinasi produksi/P&A/Rig
          Down/Moving.
          <br /> 2. Tabel perbandingan rincian kegiatan dan S-curve biayaantara
          program dan aktual lengkap dengan penjelasandetail.
          <br /> 3. Penampang sumur rencana awal sebelum kegiatanrencana awal
          dan aktualnya sesudah kegiatan pekerjaansumur (penampang akhir sumur).
          <br /> 4. Data hasil tes/produksi/injektivitas rata-rata.
          <br /> 5. Peta koordinat sumur. <br /> 6. Dokumentasi foto sumur.
        </Text>
        <NewFileUpload title="Format PDF" acceptFormat=".pdf" onChange={(file) => setData({
          filename: file.filename,
          file_id: file.file_id
        })}/>
      </CardFormK3>
    </div>
  );
};

export default DocLapPekerjaan;
