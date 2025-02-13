import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Box, Button, Text, List, ListItem } from "@chakra-ui/react";

const DragAndDropFile = ({ onDrop }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const onDropHandler = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0]; // Mengambil hanya file pertama
      setSelectedFile(file); // Menyimpan file ke state lokal
      if (onDrop) {
        onDrop(file); // Mengirim file ke parent component
      }
    },
    [onDrop]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onDropHandler,
    multiple: false, // Membatasi hanya 1 file
  });

  return (
    <Box
      {...getRootProps()}
      border="2px dashed"
      borderColor={isDragActive ? "teal.500" : "gray.300"}
      borderRadius="md"
      p={6}
      cursor="pointer"
      textAlign="center"
      _hover={{ borderColor: "teal.300" }}
      bg={isDragActive ? "gray.50" : "white"}
      height="200px"
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
    >
      <input {...getInputProps()} style={{ display: "none" }} />
      {selectedFile ? (
        <>
          <Text>File selected: {selectedFile.name}</Text>
          <Button
            mt={4}
            colorScheme="red"
            onClick={() => setSelectedFile(null)}
          >
            Remove File
          </Button>
        </>
      ) : (
        <>
          {isDragActive ? (
            <Text>Drop the file here ...</Text>
          ) : (
            <Text>Drag 'n' drop a file here, or click to select a file</Text>
          )}
          <Button mt={4} colorScheme="blue" borderRadius={"full"} variant={"outline"}>
            Choose File
          </Button>
        </>
      )}
    </Box>
  );
};

export default DragAndDropFile;
