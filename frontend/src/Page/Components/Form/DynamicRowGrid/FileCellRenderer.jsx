import React, { useState, useRef } from "react";
import { Button, Text, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Icon, Flex } from "@chakra-ui/react";
import { IconUpload, IconFileUpload } from "@tabler/icons-react";
import axios from "axios";

const FileCellRenderer = ({ value, onUpload }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);

  const handleFileChange = async (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
  };

  const handleFileUpload = async () => {
    if (!file) return;

    try {
      // Contoh upload file menggunakan axios
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Misalkan API mengembalikan ID file
      onUpload({
        id: response.data.fileId,
        name: file.name,
      });
      onClose();
    } catch (error) {
      console.error("File upload failed", error);
      // Tambahkan toast error jika diperlukan
    }
  };

  return (
    <>
      <Flex alignItems="center">
        <Text mr={2}>{value?.name || "No file"}</Text>
        <Button
          size="xs"
          colorScheme="blue"
          onClick={onOpen}
          leftIcon={<Icon as={IconFileUpload} />}
        >
          Upload
        </Button>
      </Flex>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Upload File</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <Button
              onClick={() => fileInputRef.current.click()}
              leftIcon={<Icon as={IconUpload} />}
            >
              Select File
            </Button>
            {file && <Text mt={2}>Selected: {file.name}</Text>}
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={handleFileUpload}
              isDisabled={!file}
            >
              Upload
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FileCellRenderer;
