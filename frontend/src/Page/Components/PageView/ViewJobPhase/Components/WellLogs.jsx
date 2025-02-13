import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Image,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import { IconDownload } from "@tabler/icons-react";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";
import { pathExecute, fetchImage } from "../../../../API/APIKKKS";
import { Skeleton, SkeletonCircle, SkeletonText } from '@chakra-ui/react'


const WellDataViewer = ({ datas, title, subTitle, loadData }) => {
  const [imageUrls, setImageUrls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loadData) {
    const fetchImages = async () => {
        setLoading(true);
        try {
            const urls = await Promise.all(
              datas.map(async (log) => {
                if (log.path) {
                  const url = await fetchImage(log.path);
                  return url;
                }
                return null;
              })
            );
            setImageUrls(urls);
          } catch (error) {
            console.error("Failed to fetch images:", error);
          } finally {
            setLoading(false);
          }
        };
        fetchImages();
      }


    return () => {
      imageUrls.forEach((url) => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [datas, loadData]);

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

  if (!datas || !Array.isArray(datas)) {
    return <Text>No Well Data Available</Text>;
  }

  return (
    <CardFormK3 title={title} padding="36px 28px" subtitle={subTitle}>
      {loading ? (
        <Skeleton height="300px" width="100%"/>
      ) : (
        <Flex direction="column" gap={6}>
        {datas.map((log, index) => (
          <Box key={log.file.file_id} borderWidth="1px" borderRadius="lg" p={4}>
            <Flex justifyContent="space-between" alignItems="flex-start" mb={4}>
              <Text>
                <strong>Filename:</strong> {log.file.filename}
              </Text>
              <Button
                colorScheme="blue"
                leftIcon={<IconDownload />}
                onClick={() =>
                  handleDownload(log.file.file_download_path, log.file.filename)
                }
                width="fit-content"
              >
                Download File {index + 1}
              </Button>
            </Flex>
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Metadata
            </Text>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th backgroundColor={"gray.50"}>Field</Th>
                  <Th backgroundColor={"gray.50"}>Value</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Object.entries(log.metadata).map(([key, value]) => (
                  <Tr key={key}>
                    <Td backgroundColor={"gray.50"}>
                      {key
                        .replace(/_/g, " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Td>
                    <Td>{value.toString()}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Text fontSize="lg" fontWeight="bold" mb={2} mt={4}>
              Visualization
            </Text>
            {loading ? (
              <Flex justify="center" align="center" height="300px">
                <Spinner />
              </Flex>
            ) : imageUrls[index] ? (
              <Flex justify="center">
                <Image
                  src={imageUrls[index]}
                  alt={`Well Log Visualization ${index + 1}`}
                  maxWidth="100%"
                  objectFit="contain"
                />
              </Flex>
            ) : (
              <Flex
                justify="center"
                align="center"
                height="300px"
                bg="gray.100"
                borderRadius="md"
              >
                <Text color="gray.500">No visualization available</Text>
              </Flex>
            )}
          </Box>
        ))}
      </Flex>
      )}
    </CardFormK3>
  );
};

export default WellDataViewer;
