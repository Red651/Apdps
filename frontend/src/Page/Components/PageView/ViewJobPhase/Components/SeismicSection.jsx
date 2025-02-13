import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Image,
  Spinner,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  TableContainer,
  Skeleton,
} from "@chakra-ui/react";
import { IconDownload, IconPhoto } from "@tabler/icons-react";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";
import { pathExecute, fetchImage } from "../../../../API/APIKKKS";

const WellDataViewer = ({ datas, title, subTitle, loadData }) => {
  const [imageUrls, setImageUrls] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  if (!datas) return <Text>No Well Data Available</Text>;

  useEffect(() => {
    const fetchVisualizationImages = async () => {
      try {
        setIsLoading(true);
        const imageUrlMap = {};

        if (Array.isArray(datas)) {
          for (let item of datas) {
            let paths = [];
            if (item.path) {
              paths = [item.path];
            } else if (item.visualization) {
              paths = Object.values(item.visualization).filter(
                (path) => path && typeof path === "string"
              );
            }

            const fetchedUrls = await Promise.all(
              paths.map(async (path) => {
                try {
                  return await fetchImage(path);
                } catch (error) {
                  console.error(`Failed to fetch image for path ${path}:`, error);
                  return null;
                }
              })
            );

            imageUrlMap[item.file?.file_name || "Unknown"] = fetchedUrls.filter(
              (url) => url !== null
            );
          }
        } else {
          // Single object logic
          let paths = [];
          if (datas.path) {
            paths = [datas.path];
          } else if (datas.visualization) {
            paths = Object.values(datas.visualization).filter(
              (path) => path && typeof path === "string"
            );
          }

          const fetchedUrls = await Promise.all(
            paths.map(async (path) => {
              try {
                return await fetchImage(path);
              } catch (error) {
                console.error(`Failed to fetch image for path ${path}:`, error);
                return null;
              }
            })
          );

          imageUrlMap[datas.file?.file_name || "Unknown"] = fetchedUrls.filter(
            (url) => url !== null
          );
        }

        setImageUrls(imageUrlMap);
      } catch (error) {
        console.error("Failed to fetch visualization images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (loadData) fetchVisualizationImages();
  }, [datas, loadData]);

  const handleDownload = async (downloadPath, file_name) => {
    try {
      const response = await pathExecute(downloadPath, "get");
      if (response) {
        const blob = new Blob([response], { type: "application/octet-stream" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file_name;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const renderMetadata = (metadata) => {
    if (!metadata) return null;
    const metadataKeys = Object.keys(metadata);
    return (
      <Box mt={4} borderWidth="1px" borderRadius="lg" p={4}>
        <TableContainer overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th backgroundColor="gray.50" width="30%">
                  Field
                </Th>
                <Th backgroundColor="gray.50">Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              {metadataKeys.map((key) => (
                <Tr key={key}>
                  <Td backgroundColor="gray.50">{key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}</Td>
                  <Td>{metadata[key]}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    );
  };
  
  const renderVisualizationImages = (images) => {
    if (isLoading) {
      return <Skeleton height="300px" w="100%" />;
    }

    if (!images || images.length === 0) {
      return (
        <Flex justify="center" align="center" height="300px" bg="gray.100" borderRadius="md">
          <Text color="gray.500">No visualization available</Text>
        </Flex>
      );
    }

    // If multiple images, use Tabs
    if (images.length > 1) {
      return (
        <Tabs variant="enclosed">
          <TabList>
            {images.map((_, index) => (
              <Tab key={index}>
                <IconPhoto /> Visualization {index + 1}
              </Tab>
            ))}
          </TabList>
          <TabPanels>
            {images.map((url, index) => (
              <TabPanel key={index} p={0}>
                <Flex justify="center">
                  <Image
                    src={url}
                    alt={`Visualization ${index + 1}`}
                    maxWidth="100%"
                    objectFit="contain"
                  />
                </Flex>
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      );
    }

    // Single image
    return (
      <Flex justify="center">
        <Image
          src={images[0]}
          alt="Well Data Visualization"
          maxWidth="100%"
          objectFit="contain"
        />
      </Flex>
    );
  };

  return (
    <CardFormK3 title={title} padding="36px 28px" subtitle={subTitle}>
      <Tabs variant="enclosed">
        <TabList>
          {Array.isArray(datas)
            ? datas.map((log, index) => (
                <Tab key={index}>File {index + 1} - {log.file.file_name}</Tab>
              ))
            : <Tab>File - {datas?.file?.file_name || "Unknown"}</Tab>}
        </TabList>
        <TabPanels>
          {Array.isArray(datas)
            ? datas.map((log, index) => (
                <TabPanel key={index}>
                  <Flex direction="column" gap={4}>
                    <Button
                      w={"200px"}
                      mt={4}
                      colorScheme="blue"
                      leftIcon={<IconDownload />}
                      onClick={() =>
                        handleDownload(
                          log.file.file_download_path,
                          log.file.file_name
                        )
                      }
                    >
                      Download File
                    </Button>
                    {renderMetadata(log.metadata)}
                    <Box>
                      <Text fontSize="lg" fontWeight="bold" my={4}>
                        Visualization
                      </Text>
                      {renderVisualizationImages(imageUrls[log.file.file_name] || [])}
                    </Box>
                  </Flex>
                </TabPanel>
              ))
            : (
              <TabPanel>
                <Flex direction="column" gap={4}>
                  <Button
                    colorScheme="blue"
                    w={"200px"}
                    mt={4}
                    leftIcon={<IconDownload />}
                    onClick={() =>
                      handleDownload(
                        datas.file.file_download_path,
                        datas.file.file_name
                      )
                    }
                  >
                    Download File
                  </Button>
                  {renderMetadata(datas.metadata)}
                  <Box>
                    <Text fontSize="lg" fontWeight="bold" my={2}>
                      Visualization
                    </Text>
                    {renderVisualizationImages(imageUrls[datas.file.file_name] || [])}
                  </Box>
                </Flex>
              </TabPanel>
            )}
        </TabPanels>
      </Tabs>
    </CardFormK3>
  );
};

export default WellDataViewer;