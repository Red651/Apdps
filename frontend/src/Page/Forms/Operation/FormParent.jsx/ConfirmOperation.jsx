import React, { useState, useEffect } from "react";
import { Button, Flex, useToast } from "@chakra-ui/react";
import FormControlCard from "../../../Forms/Components/FormControl";
import FormInputFile from "../../../Forms/Components/FormInputFile";
import {
  patchStatusOperationToOperate,
  PostUploadFile,
} from "../../../API/PostKkks";
import CardFormK3 from "../../Components/CardFormK3";
import { useNavigate, useParams } from "react-router-dom";
import { validationOperate } from "../FormHandling/Utils/ValidationOperate";
import { useJobContext } from "../../../../Context/JobContext";

const OperateForm = ({ dataOperate, onClose }) => {
  const toast = useToast();
  const { job_id } = useParams();
  const { state, dispatch } = useJobContext();
  const wrmData = state?.wrmValues;
  const [isValid, setIsValid] = useState(false);
  const [message, setMessage] = useState("");

  React.useEffect(() => {
    const validation = () => {
      const result = validationOperate(wrmData);
      setIsValid(result?.permission);
      setMessage(result?.msg);
      // 
      return result;
    };
    validation();
  }, [wrmData]);
  // for (let data in dummyData) {
  //   index++;
  //   
  // }

  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState({});
  const [file, setFile] = useState(null);
  const [datas, setDatas] = useState({
    file_id: null,
    filename: null,
    nomor_surat: null,
    tanggal_mulai: null,
  });

  useEffect(() => {
    setDatas({
      file_id: null,
      filename: null,
      nomor_surat: null,
      tanggal_mulai: null,
    });
  }, []);

  const handleFileChange = async () => {
    const form = new FormData();
    form.append("file", file);
    try {
      const uploadFile = await PostUploadFile(form);
      return {
        success: true,
        file_id: uploadFile.data.data.file_info.id,
        fileName: uploadFile.data.data.file_info.filename,
        message: "File uploaded successfully",
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Failed to upload file",
      };
    }
  };
  // 

  const validateForm = () => {
    const errorMessage = {};
    if (datas.nomor_surat === "" || datas.nomor_surat === null) {
      errorMessage.nomor_surat = "Input Nomor Surat Is Required";
    }
    if (datas.tanggal_mulai === "" || datas.tanggal_mulai === null) {
      errorMessage.tanggal_mulai = "Input Tanggal Mulai Is Required";
    }

    setErrorMsg(errorMessage);

    return Object.keys(errorMessage).length === 0;
  };

  const handleOperate = async () => {
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Input Is Required",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      const fileUploadResult = await handleFileChange();
      if (fileUploadResult.success === false) {
        toast({
          title: "Error",
          description: fileUploadResult.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        throw new Error("File upload failed");
      }

      const newForm = {
        file_id: fileUploadResult.file_id,
        nomor_surat: datas.nomor_surat,
        filename: fileUploadResult.fileName,
        tanggal_mulai: datas.tanggal_mulai,
      };

      const patchResult = await patchStatusOperationToOperate(job_id, newForm);
      if (!patchResult) {
        toast({
          title: "Error",
          description: "Failed to update operation status",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        throw new Error("Failed to update operation status");
      }

      // onClose(); // Call the onClose function to reset or close the form if needed
      toast({
        title: "Success",
        description: "Operation completed successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setTimeout(() => {
        window.location.reload();
        navigate(-1);
      }, 1000);
    } catch (error) {
      console.error("Error in handleOperate:", error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  

 
  return (
    <CardFormK3 title="Surat Pengajuan Tajak" colorSubtitle={isValid ? "red" : "green"} subtitle={message}>
      <Flex flexDirection="column" gap={4}>
        <h2>Operasi Konfirmasi</h2>
        <FormControlCard
          labelForm="Nomor Surat Tajak"
          placeholder="Masukkan No Surat Tajak"
          isInvalid={!!errorMsg.nomor_surat}
          handleChange={(e) =>
            setDatas({ ...datas, nomor_surat: e.target.value })
          }
          value={datas.nomor_surat}
        />
        <FormInputFile onFileSelect={setFile} />
        <FormControlCard
          labelForm="Tanggal Operasi"
          type="date"
          placeholder="Date"
          isInvalid={!!errorMsg.tanggal_mulai}
          handleChange={(e) =>
            setDatas({ ...datas, tanggal_mulai: e.target.value })
          }
          value={datas.tanggal_mulai}
        />
        <Flex gap={2} justifyContent={"flex-end"}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            colorScheme="blue"
            onClick={handleOperate}
            isDisabled={isValid}
          >
            Operate
          </Button>
        </Flex>
      </Flex>
    </CardFormK3>
  );
};

export default OperateForm;
