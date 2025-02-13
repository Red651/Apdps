import { Box } from "@chakra-ui/react";
import React from "react";
import DragAndDropFile from "./DragAndDropFile";

const FileHandlingUpload = ({ handleChange }) => {
    const [uploadedFile, setUploadedFile] = React.useState(null);
    // 
    const handleFileUpload = (file) => {
      if (file) {
        handleChange(file);
      }
      setUploadedFile(file);
    };

    return (
      <Box p={6}>
        <DragAndDropFile onDrop={handleFileUpload} />
      </Box>
    );
  };


  export default FileHandlingUpload