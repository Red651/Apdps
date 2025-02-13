import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Flex,
  Heading,
  Text,
  Icon,
} from "@chakra-ui/react";
import { IconBriefcase } from "@tabler/icons-react";
import { DownloadIcon } from "@chakra-ui/icons";
import { pathExecute } from "../../../../API/APIKKKS";

const WellLogTable = ({ datas, title, subTitle }) => {
  const data = datas?.data;
  const file = datas?.file;

  const [logData, setLogData] = useState([]);

  useEffect(() => {
    if (data && Array.isArray(data)) {
      setLogData(data);
    } else {
      setLogData([]);
    }
  }, [data]);

  const getTableHeaders = () => {
    return logData.length > 0 ? Object.keys(logData[0]) : [];
  };

  const renderValue = (value) => {
    return value !== null && value !== undefined ? value.toString() : "-";
  };

  const handleDownload = async (downloadPath, filename) => {
    try {
      const response = await pathExecute(downloadPath, "get");

      if (response) {
        const blob = new Blob([response], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  return (
    <Flex direction="column" padding="10px" border="1px solid lightgrey" borderRadius="10px" maxW={"71vw"} p={8} gap={6}>
      <Box>
        <Flex justifyContent="space-between" alignItems="center">
          <Flex>
            <Icon as={IconBriefcase} boxSize={12} color={"gray.600"} mr={3} />
            <Box>
              <Heading size="md">{title}</Heading>
              <Text fontSize="md" color="gray.600">
                {subTitle}
              </Text>
            </Box>
          </Flex>

          {file && file.file_download_path && (
            <Button
              colorScheme="blue"
              leftIcon={<DownloadIcon />}
              onClick={() =>
                handleDownload(file.file_download_path, file.filename)
              }
            >
              Download
            </Button>
          )}
        </Flex>
      </Box>
      <TableContainer maxWidth="100%" overflowX="auto">
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>No</Th>
              {getTableHeaders().map((header, index) => (
                <Th key={index}>{header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {logData.map((item, index) => (
              <Tr key={index}>
                <Td>{index + 1}</Td>
                {Object.values(item).map((value, idx) => (
                  <Td key={idx}>{renderValue(value)}</Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
};

export default WellLogTable;
