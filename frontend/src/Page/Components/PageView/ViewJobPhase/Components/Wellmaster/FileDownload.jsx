import React, {
    useCallback,
} from "react";
import {
    Button,
    Flex,
    useToast,
    Text,
} from "@chakra-ui/react";
import CardFormK3 from "../../../../../Forms/Components/CardFormK3";
import { pathExecute } from "../../../../../API/APIKKKS";
  
const FileDownload = ({title,subtitle,wellData}) => {
    const toast = useToast();
    const handleDownload = useCallback(async () => {
      if (!wellData) return;
    
      try {
        const response = await pathExecute(wellData.download_path, "get", {
          responseType: "blob", // Pastikan menerima data dalam format file
        });
    
        if (response) {
          const fileBlob = new Blob([response.data]); // Gunakan `response.data` untuk file blob
          const fileURL = window.URL.createObjectURL(fileBlob);
    
          const downloadLink = document.createElement("a");
          downloadLink.href = fileURL;
          downloadLink.download = wellData.filename || "unduhan_file";
          document.body.appendChild(downloadLink);
          downloadLink.click();
          downloadLink.remove();
          window.URL.revokeObjectURL(fileURL);
        } else {
          throw new Error("Gagal mengunduh file. Respons tidak valid.");
        }
      } catch (error) {
        console.error("Download error:", error);
        toast({
          title: "Error",
          description: "Gagal mengunduh file, silakan coba lagi.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    }, [wellData, toast]);
    
    
  
    return (
      <>
        <CardFormK3 title={title} subtitle={subtitle}>
          <Flex direction="column" gap={4}>  
            {wellData?.file_id && (
              <Flex alignItems="center" justifyContent="space-between">
                <Text bg="green.100" p={2} borderRadius="md" w="100%">
                  File: {wellData.filename || wellData.file_id}
                </Text>
                <Flex>
                  <Button colorScheme="blue" ml={2} onClick={handleDownload}>
                    Download
                  </Button>
                </Flex>
              </Flex>
            )}
          </Flex>
        </CardFormK3>
      </>
    );
  };
  
  export default FileDownload;
  