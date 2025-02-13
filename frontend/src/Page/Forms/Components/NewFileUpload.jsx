import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { useRef } from "react";
import { PostUploadFile } from "../../API/PostKkks";
import { UploadFile } from "../Operation/FormHandling/Utils/UploadFileAPI";
import { FetchReusable, PostReusable } from "../../API/FetchReusable";
import { IconDownload } from "@tabler/icons-react";
import { BiTrash } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import ModalAndContent from "./ModalAndContent";

const NewFileUpload = ({
  acceptFormat = ".pdf",
  onChange = () => {},
  TypeSubmit = "create",

  initialData = null,
  title = "Upload File",
  key,
}) => {
  //  

   
  const toast = useToast();
  const [loading, setLoading] = React.useState(false);
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const {
    isOpen: OpenDelete,
    onOpen: onOpenDelete,
    onClose: onCloseDelete,
  } = useDisclosure();

  const [blobFile, setBlobFile] = React.useState(null);

  const {
    isOpen: OpenReplace,
    onOpen: onOpenReplace,
    onClose: onCloseReplace,
  } = useDisclosure();

  const [fileData, setFileData] = React.useState({
    file_id: null,
    filename: null,
    file_location: null,
  });

  const [visible, setVisible] = React.useState(false);
  //  
  //  
  const parsingData = () => {
    if (TypeSubmit === "update" && initialData?.file_id) {
      setFileData({
        file_id: initialData?.file_id,
        filename: initialData?.filename,
        file_location: initialData?.file_location,
      });
    }
  };

  React.useEffect(() => {
    parsingData();
  }, [TypeSubmit]);

  //  

  React.useEffect(() => {
    //  
    onChange(fileData);
  }, [fileData]);

  const handleReplaceFile = async () => {
    if (blobFile) {
      if (fileData?.file_id) {
        handleDeleteFile();
      }
      setLoading(true);
      try {
        const response = await UploadFile(blobFile);
        if (response.status === 200) {
          setFileData({
            file_id: response.data.file_id,
            filename: response.data.filename,
            file_location: response.data.file_location,
          });
        }
        onCloseReplace();
      } catch (error) {
        toast({
          title: error.error,
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectedFile = async (e) => {
    const selectedFile = e.target.files[0];
    setBlobFile(selectedFile);

    if (fileData?.file_id) {
      onOpenReplace();
      return;
    }
    if (selectedFile) {
      setLoading(true);
      try {
        const response = await UploadFile(selectedFile);
        if (response.status === 200) {
          setFileData({
            file_id: response.data.file_id,
            filename: response.data.filename,
            file_location: response.data.file_location,
          });
        }
      } catch (error) {
        toast({
          title: error.title,
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const buttonConfirmDelete = () => {
    return (
      <Flex gap={2}>
        <Button
          colorScheme="gray"
          // leftIcon={<BiTrash />}
          onClick={onCloseDelete}
        >
          Cancel
        </Button>
        <Button
          colorScheme="red"
          leftIcon={<FaTrash />}
          onClick={handleDeleteFile}
          isLoading={deleteLoading}
        >
          Delete
        </Button>
      </Flex>
    );
  };

  const handleDeleteFile = async () => {
    try {
      const response = await FetchReusable(
        `/utils/delete/file/${fileData?.file_id}`,
        "delete",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.success === true) {
        setFileData({
          file_id: null,
          filename: null,
          file_location: null,
        });
      }
      onCloseDelete();
    } catch (error) {
      if (error.status === 500) {
        toast({
          title: "Error",
          description: "Internal Server Error",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };

  const buttonReplace = () => {
    return (
      <Flex gap={2}>
        <Button colorScheme="gray" onClick={onCloseReplace}>
          Cancel
        </Button>
        <Button
          colorScheme="teal"
          // leftIcon={<FaTrash />}
          onClick={handleReplaceFile}
          isLoading={loading}
        >
          Replace
        </Button>
      </Flex>
    );
  };

  const handleDonwload = async () => {
    try {
      const response = await FetchReusable(
        `/utils/download/file/${fileData?.file_id}`,
        "get",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileData?.filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      if (error.status === 500) {
        toast({
          title: "Error",
          description: "Internal Server Error",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      if (error.status === 401) {
        toast({
          title: "Error",
          description: "Unauthorized",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }
  };
  //
  const ref = useRef();
  return (
    <>
      <Flex w={"full"} justifyContent={"space-between"} gap={4}>
        <Box display={"flex"} justifyItems={"center"} alignItems={"center"}>
          <Text>{title}</Text>
        </Box>
        <Button
          isLoading={loading}
          colorScheme="blue"
          variant={"outline"}
          onClick={() => ref.current.click()}
        >
          Choose File
        </Button>
      </Flex>
      <Flex gap={4} bgColor={"green.200"} justifyContent={"space-between"}>
        <Input
          placeholder="Input File"
          type="file"
          ref={ref}
          hidden
          onChange={handleSelectedFile}
          accept={acceptFormat}
        />

        <Box display={"flex"} justifyItems={"center"} alignItems={"center"}>
          {fileData?.filename && (
            <Text fontFamily={"Mulish"} fontSize={"xl"}>
              {fileData?.filename}
            </Text>
          )}
        </Box>
        <Flex gap={2}>
          <Flex gap={2}>
            {fileData?.file_id && (
              <>
                <Button
                  colorScheme="blue"
                  leftIcon={<IconDownload />}
                  onClick={handleDonwload}
                >
                  Download{" "}
                </Button>

                <Button
                  colorScheme="red"
                  leftIcon={<FaTrash />}
                  // onClick={handleDeleteFile}
                  onClick={onOpenDelete}
                >
                  Delete
                </Button>
              </>
            )}
          </Flex>
        </Flex>
      </Flex>

      <ModalAndContent
        isOpen={OpenDelete}
        onClose={onCloseDelete}
        title="Delete File"
        actionButton={buttonConfirmDelete()}
      >
        <Text>Are you sure want to delete this file ?</Text>
      </ModalAndContent>

      <ModalAndContent
        isOpen={OpenReplace}
        onClose={onCloseReplace}
        actionButton={buttonReplace()}
        title="Replace File"
      >
        <Text>Are you sure Replace This File?</Text>
      </ModalAndContent>
    </>
  );
};

export default NewFileUpload;
