import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Flex,
  GridItem,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  IconButton,
  Icon
} from "@chakra-ui/react";
import {
  IconDownload,
} from "@tabler/icons-react";
import CardFormK3 from "../../../../../Forms/Components/CardFormK3";
import { pathExecute } from "../../../../../API/APIKKKS";

const WellLogsData = ({ wellData }) => {
  const data = wellData;
  const toast = useToast();

  const showToast = (title, description, status) => {
    toast({ title, description, status, duration: 3000, isClosable: true });
  };

  const handleDownload = async (filePath, originalFileName) => {
    const responseData = await pathExecute(`/utils/download/file/${filePath}`, "get");
    if (responseData) {
      console.log("🚀 ~ handleDownload ~ responseData:", responseData)
      const fileBlob = new Blob([responseData], {
        type: "application/octet-stream",
      });
      const fileURL = window.URL.createObjectURL(fileBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = fileURL;
      downloadLink.download = originalFileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(fileURL);
    } else {
      showToast(
        "Download Error",
        "Failed to download the file. Please try again.",
        "error"
      );
    }
  };

  return (
    <>
      <GridItem>
        <CardFormK3
          title="Well Logs"
          padding="36px 28px"
          subtitle="Log Details"
        >
          <Box rounded="lg" overflowX="auto" borderWidth="1px" p={0}>
            <TableContainer>
              <Table variant="simple" colorScheme="gray">
                <Thead>
                  <Tr>
                    <Th>Item Id</Th>
                    <Th>Top Depth</Th>
                    <Th>Base Depth</Th>
                    <Th>Logs</Th>
                    <Th>Download</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {data.map((row, index) => (
                    <Tr key={index}>
                      <Td>{row.physical_item_id}</Td>
                      <Td>{row.top_depth}</Td>
                      <Td>{row.base_depth}</Td>
                      <Td>{row.logs}</Td>
                      <Td>
                        <Flex gap={2}>
                          <IconButton
                            icon={<Icon as={IconDownload} size={16} />}
                            colorScheme="green"
                            variant="solid"
                            aria-label="Download"
                            borderRadius={"full"}
                            size={"sm"}
                            onClick={() => handleDownload(row.physical_item_id, row.filename)}
                          />
                        </Flex>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </CardFormK3>
      </GridItem>
    </>
  );
};
export default WellLogsData;

