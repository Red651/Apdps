import React, { forwardRef } from "react";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import FormControlCard from "../../Forms/Components/FormControl";
import FormInputFile from "../../Forms/Components/FormInputFile";
import {
  patchStatusOperationToOperate,
  PostUploadFile,
} from "../../API/PostKkks";

const ModalOperateMessage = ({ job_id, isOpen, onClose, dataOperate }) => {
  const toast = useToast();
  const [errorMsg, setErrorMsg] = React.useState({});
  // const [isLoading,setIsLoading] = React.useState(false);
  const [loading,setLoading] = React.useState(false);

  const [file, setFile] = React.useState(null);
  const [datas, setDatas] = React.useState({
    file_id: null,
    filename: null,
    nomor_surat: null,
    tanggal_mulai: null,
  });
  React.useEffect(() => {
    setDatas({
      file_id: null,
      filename: null,
      nomor_surat: null,
      tanggal_mulai: null,
    });
  }, [isOpen]);
  const handleFileChange = async () => {
    const form = new FormData();
    form.append("file", file);
    try {
      const uploadFile = await PostUploadFile(form)
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
    setLoading(true);
    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Input Is Required",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }
    try {
      // Handle file upload
      const fileUploadResult = await handleFileChange();
      if (fileUploadResult.success === false) {
        toast({
          title: "Error",
          description: fileUploadResult.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setLoading(false);

        throw new Error("File upload failed");
      }

      // Prepare new form data
      const newForm = {
        file_id: fileUploadResult.file_id,
        nomor_surat: datas.nomor_surat,
        filename: fileUploadResult.fileName,
        tanggal_mulai: datas.tanggal_mulai,
      };
      if (newForm.file_id === null) {
      }
      const patchResult = await patchStatusOperationToOperate(job_id, newForm);
      if (!patchResult) {
        setLoading(false);
        toast({
          title: "Error",
          description: "Failed to update operation status",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        throw new Error("Failed to update operation status");
      }

      // Close modal on success
      onClose();
      toast({
        title: "Success",
        description: "Operation completed successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      setLoading(false);
      setTimeout(() => {
        window.location.reload();
      }, 1000);

      return { success: true, message: "Operation completed successfully" };
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      return {
        success: false,
        message: error.message || "An unexpected error occurred",
      };
    }
  };

  const cancelRef = React.useRef();
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Operasi Konfirmasi
          </AlertDialogHeader>

          <AlertDialogBody>
            <Flex flexDirection={"column"} gap={4}>
              Apakah Anda Akan Beroperasi?
              <FormControlCard
                labelForm="Nomor Surat Pajak"
                placeholder="Masukkan No Surat Pajak"
                isInvalid={!!errorMsg.nomor_surat}
                handleChange={(e) =>
                  setDatas({ ...datas, nomor_surat: e.target.value })
                }
                value={datas.nomor_surat}
              />
              <FormInputFile onFileSelect={setFile}  acceptedFormats=".pdf"/>
              <FormControlCard
                labelForm="Tanggal Operasi"
                type={"date"}
                placeholder="Date"
                isInvalid={!!errorMsg.tanggal_mulai}
                handleChange={(e) =>
                  setDatas({ ...datas, tanggal_mulai: e.target.value })
                }
                value={datas.tanggal_mulai}
              />
            </Flex>
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" isLoading={loading} onClick={handleOperate} ml={3}>
              Operate
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default ModalOperateMessage;
