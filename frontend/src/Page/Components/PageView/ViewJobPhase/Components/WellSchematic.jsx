import {
  Box,
  Button,
  Flex,
  Heading,
  Text,
  Stack,
  Spinner,
  Image,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { DownloadIcon } from "@chakra-ui/icons";
import { pathExecute, fetchImage } from "../../../../API/APIKKKS"; // Pastikan API ini sudah sesuai untuk mendapatkan gambar
import CardFormK3 from "../../../../Forms/Components/CardFormK3";

const WellSchematic = ({ data, title, subTitle }) => {
  const pathSchematicPlan = data?.path?.plan;
  const pathSchematicActual = data?.path?.actual;
  const fileDownloadPathPlan = data?.file?.plan?.file_download_path;
  const fileDownloadPathActual = data?.file?.actual?.file_download_path;
  const fileNamePlan = data?.file?.plan?.file_name;
  const fileNameActual = data?.file?.actual?.file_name;

  const [imageUrlPlan, setImageUrlPlan] = useState(null);
  const [imageUrlActual, setImageUrlActual] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getImages = async () => {
      try {
        const urlPlan = await fetchImage(pathSchematicPlan);
        const urlActual = await fetchImage(pathSchematicActual);

        if (urlPlan) setImageUrlPlan(urlPlan);
        if (urlActual) setImageUrlActual(urlActual);
      } catch (error) {
        console.error("Failed to fetch images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    getImages();
    return () => {
      if (imageUrlPlan) URL.revokeObjectURL(imageUrlPlan);
      if (imageUrlActual) URL.revokeObjectURL(imageUrlActual);
    };
  }, [pathSchematicPlan, pathSchematicActual]);

  const handleDownload = async (downloadPath, filename) => {
    try {
      const response = await fetch(downloadPath);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const renderDownloadButtonsPlan = () => {
    return (
      <Stack spacing={2}>
        {fileDownloadPathPlan && (
          <Button
            colorScheme="blue"
            leftIcon={<DownloadIcon />}
            onClick={() =>
              handleDownload(
                fileDownloadPathPlan,
                fileNamePlan || "Plan_Schematic.jpg",
              )
            }
            width="fit-content"
          >
            Download Plan Schematic
          </Button>
        )}
      </Stack>
    );
  };

  const renderDownloadButtonsActual = () => {
    return (
      <Stack spacing={2}>
        {fileDownloadPathActual && (
          <Button
            colorScheme="blue"
            leftIcon={<DownloadIcon />}
            onClick={() =>
              handleDownload(
                fileDownloadPathActual,
                fileNameActual || "Actual_Schematic.jpg",
              )
            }
            width="fit-content"
          >
            Download Actual Schematic
          </Button>
        )}
      </Stack>
    );
  };

  // const renderDownloadButtons = () => {
  //   return (
  //     <Stack spacing={2}>
  //       {fileDownloadPathPlan && (
  //         <Button
  //           colorScheme="blue"
  //           leftIcon={<DownloadIcon />}
  //           onClick={() =>
  //             handleDownload(
  //               fileDownloadPathPlan,
  //               fileNamePlan || "Plan_Schematic.jpg"
  //             )
  //           }
  //           width="fit-content"
  //         >
  //           Download Plan Schematic
  //         </Button>
  //       )}
  //       {fileDownloadPathActual && (
  //         <Button
  //           colorScheme="blue"
  //           leftIcon={<DownloadIcon />}
  //           onClick={() =>
  //             handleDownload(
  //               fileDownloadPathActual,
  //               fileNameActual || "Actual_Schematic.jpg"
  //             )
  //           }
  //           width="fit-content"
  //         >
  //           Download Actual Schematic
  //         </Button>
  //       )}
  //     </Stack>
  //   );
  // };

  return (
    <CardFormK3 title={title} padding="36px 28px" subtitle={subTitle}>
      <Flex direction="column" gap={4}>
        <Flex direction="column" gap={5} justifyContent="center">
          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Plan Schematic
            </Text>
            {isLoading ? (
              <Flex justify="center" align="center" height="300px">
                <Spinner />
              </Flex>
            ) : imageUrlPlan ? (
              <Image
                src={imageUrlPlan}
                alt="Plan Schematic"
                maxWidth="100%"
                objectFit="contain"
              />
            ) : (
              <Flex
                justify="center"
                align="center"
                height="300px"
                bg="gray.100"
                borderRadius="md"
              >
                <Text color="gray.500">No Plan visualization available</Text>
              </Flex>
            )}
            <Text mt={2} color="gray.500">
              {fileNamePlan}
            </Text>
          </Box>
          <Box mb={7}>{renderDownloadButtonsPlan()}</Box>

          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={2}>
              Actual Schematic
            </Text>
            {isLoading ? (
              <Flex justify="center" align="center" height="300px">
                <Spinner />
              </Flex>
            ) : imageUrlActual ? (
              <Image
                src={imageUrlActual}
                alt="Actual Schematic"
                maxWidth="100%"
                objectFit="contain"
              />
            ) : (
              <Flex
                justify="center"
                align="center"
                height="300px"
                bg="gray.100"
                borderRadius="md"
              >
                <Text color="gray.500">No Actual visualization available</Text>
              </Flex>
            )}
            <Text mt={2} color="gray.500">
              {fileNameActual}
            </Text>
          </Box>
        </Flex>

        <Box mb={5}>{renderDownloadButtonsActual()}</Box>
      </Flex>
    </CardFormK3>
  );
};

export default WellSchematic;
