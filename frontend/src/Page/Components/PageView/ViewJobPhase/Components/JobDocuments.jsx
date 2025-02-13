import React, { useCallback } from "react";
import {
  TableContainer,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  useToast,
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";
import { pathExecute } from "../../../../API/APIKKKS";

const JobDocuments = ({ data, title, subtitle }) => {
  const jobDoc = data || {};
  const toast = useToast();

  const handleDownload = useCallback(
    async (filePath, fileName) => {
      if (!filePath) return;

      try {
        const response = await pathExecute(filePath, "get", {
          responseType: "blob",
        });

        if (response) {
          const fileBlob = new Blob([response.data]);
          const fileURL = window.URL.createObjectURL(fileBlob);

          const downloadLink = document.createElement("a");
          downloadLink.href = fileURL;
          downloadLink.download = fileName || "unduhan_file";
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
    },
    []
  );

  return (
    <CardFormK3 title={title} padding="36px 28px" subtitle={subtitle}>
      <TableContainer>
        <Table variant="striped">
          <Thead>
            <Th>No</Th>
            <Th>File Name</Th>
            <Th>Document Type</Th>
            <Th>Remarks</Th>
            <Th>Download</Th>
          </Thead>
          <Tbody>
            {Object.entries(jobDoc).map(([key, doc], index) => (
              <Tr key={index}>
                <Td>{index + 1}</Td>
                <Td>{doc.Filename || doc.filename || "N/A"}</Td>
                <Td>{doc?.["Document Type"] || doc.document_type || "N/A"}</Td>
                <Td>{doc.Remark || doc.remark || "N/A"}</Td>
                <Td>
                  <Button
                    colorScheme="blue"
                    ml={2}
                    onClick={() => handleDownload(doc.download_path, doc.filename)}
                  >
                    Download
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </CardFormK3>
  );
};

export default JobDocuments;

