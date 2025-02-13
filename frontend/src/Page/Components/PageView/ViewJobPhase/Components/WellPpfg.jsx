import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  Text,
  Grid,
  GridItem,
  Image,
  Spinner,
  Stack,
} from "@chakra-ui/react";
import { IconDownload } from "@tabler/icons-react";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";
import { pathExecute, fetchImage } from "../../../../API/APIKKKS";

const WellDataViewer = ({ datas, title, subTitle }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  if (!datas) return <Text>No Well Data Available</Text>;

  useEffect(() => {
    const getImage = async () => {
      try {
        // Handle different path structures
        const visualizationPath = Array.isArray(datas)
          ? datas[0]?.path // Untuk well_logs
          : datas.path; // Untuk single file atau well_ppfg

        if (visualizationPath) {
          const url = await fetchImage(visualizationPath);
          if (url) {
            setImageUrl(url);
          }
        }
      } catch (error) {
        console.error("Failed to fetch image:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getImage();
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [datas]);

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

  const renderDownloadButtons = () => {
    if (!Array.isArray(datas) && datas.file && !datas.file.actual) {
      return (
        <Button
          colorScheme="blue"
          leftIcon={<IconDownload />}
          onClick={() =>
            handleDownload(datas.file.file_download_path, datas.file.filename)
          }
          width="fit-content"
        >
          Download File
        </Button>
      );
    }

    if (Array.isArray(datas)) {
      return (
        <Stack spacing={2}>
          {datas.map((log, index) => (
            <Button
              key={log.file.file_id}
              colorScheme="blue"
              leftIcon={<IconDownload />}
              onClick={() =>
                handleDownload(log.file.file_download_path, log.file.filename)
              }
              width="fit-content"
            >
              Download File {index + 1} - {log.file.filename}
            </Button>
          ))}
        </Stack>
      );
    }

    if (datas.file?.actual && datas.file?.plan) {
      return (
        <Flex gap={2}>
          <Button
            colorScheme="blue"
            leftIcon={<IconDownload />}
            onClick={() =>
              handleDownload(
                datas.file.actual.file_download_path,
                datas.file.actual.filename
              )
            }
            width="fit-content"
          >
            Download Actual File
          </Button>
          <Button
            colorScheme="blue"
            leftIcon={<IconDownload />}
            onClick={() =>
              handleDownload(
                datas.file.plan.file_download_path,
                datas.file.plan.filename
              )
            }
            width="fit-content"
          >
            Download Plan File
          </Button>
        </Flex>
      );
    }

    return null;
  };

  const getFilename = () => {
    if (Array.isArray(datas)) {
      return "Multiple Files";
    }
    if (!Array.isArray(datas) && datas?.file && !datas?.file.actual) {
      return datas?.file.filename || datas?.file.file_name;
    }
    if (datas.file?.actual && datas.file?.plan) {
      return "Plan and Actual Files";
    }
    return "No filename available";
  };

  return (
    <CardFormK3 title={title} padding="36px 28px" subtitle={subTitle}>
      <Flex direction="column" gap={4}>
        <Flex
          justifyContent="space-between"
          alignItems="flex-start"
          flexWrap="wrap"
          gap={4}
        >
          <Text>
            <strong>Filename:</strong> {getFilename()}
          </Text>
          {renderDownloadButtons()}
        </Flex>
        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Visualization
          </Text>
          {isLoading ? (
            <Flex justify="center" align="center" height="300px">
              <Spinner />
            </Flex>
          ) : imageUrl ? (
            <Flex justify="center">
              <Image
                src={imageUrl}
                alt="Well Data Visualization"
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
      </Flex>
    </CardFormK3>
  );
};

export default WellDataViewer;
