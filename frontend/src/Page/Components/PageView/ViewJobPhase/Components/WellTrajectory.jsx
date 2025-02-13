import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import Plot from "react-plotly.js";
import { useEffect, useState } from "react";
import { pathExecute } from "../../../../API/APIKKKS";
import { GetDatas } from "../../../../API/APISKK";
import { IconDownload } from "@tabler/icons-react";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";

const WellTrajectory = ({ data, title, subTitle }) => {
  const pathTrajectory = data?.path;
  const fileData = data?.file;
  const [wellTraject, setWellTraject] = useState(null);

  useEffect(() => {
    const fetchWellTraject = async () => {
      if (!pathTrajectory) return;
      try {
        const casingData = await GetDatas(pathTrajectory);
        if (casingData) {
          setWellTraject(casingData);
        }
      } catch (error) {
        console.error("Error fetching well traject data:", error);
      }
    };
    fetchWellTraject();
  }, [pathTrajectory]);

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
    <CardFormK3
      title={title}
      padding="36px 28px"
      w={"71vw"}
      subtitle={subTitle}
    >
      <Box borderRadius={"10px"} background={"white"} w={"100%"}>
        {fileData && (
          <Flex m={3} direction="column" gap={2}>
            <Text>
              <strong>Filename:</strong>{" "}
              {fileData?.filename || "No filename available"}
            </Text>
            <Flex gap={2} justifyContent={"end"}>
              <Button
                colorScheme="blue"
                leftIcon={<IconDownload />}
                onClick={() =>
                  handleDownload(fileData.file_download_path, fileData.filename)
                }
                width="fit-content"
              >
                Download File
              </Button>
            </Flex>
          </Flex>
        )}
        <Flex mt={10} justifyContent={"center"}>
          <Box>
            <Plot {...wellTraject} />
          </Box>
        </Flex>
      </Box>
    </CardFormK3>
  );
};

export default WellTrajectory;
