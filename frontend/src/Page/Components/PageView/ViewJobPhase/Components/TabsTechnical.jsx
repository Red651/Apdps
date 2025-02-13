import { GetDatas } from "../../../../API/APISKK";
import { useEffect, useState } from "react";
import axios from "axios";
import Plot from "react-plotly.js";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  TabPanel,
  Flex,
  Heading,
  Text,
  Button,
} from "@chakra-ui/react";
import { DownloadIcon } from "@chakra-ui/icons";

const TabsOperational = ({ planningData }) => {
  const technical = planningData?.technical;
  const data = technical?.key_data;
  const wellCasingBar = technical?.well_casing?.plot?.path;
  const fileTraject = technical?.well_trajectory?.file;
  const plotTraject = technical?.well_trajectory?.path;

  // const [wellTechnical, setData] = useState([]);
  const [bar, setBar] = useState(null);
  const [wellCasingData, setWellCasingData] = useState([]);
  const [wellTraject, setwellTraject] = useState(null);
  const [wellFileTraject, setFileTraject] = useState(null);
  const [wellSummary, setWellSummary] = useState([]);
  const [wellStratigraphy, setWellStratigraphy] = useState([]);
  const [wellTest, setWellTest] = useState([]);

  useEffect(() => {
    // const fetchWellData = async () => {
    //   if (!data) return;
    //   try {
    //     setData(data);
    //   } catch (error) {
    //     console.error("Error fetching data:", error);
    //   }
    // };

    const fetchDataWellcasing = async () => {
      if (!wellCasingBar) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_URL}${wellCasingBar}`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            responseType: "blob",
          }
        );

        if (response.data) {
          const imageUrl = URL.createObjectURL(response.data);
          setBar(imageUrl);
        }
      } catch (error) {
        console.error("Error fetching well casing image:", error);
      }
    };

    const fetchWellCasingData = async () => {
      const casingTable = technical?.well_casing?.table;
      if (!casingTable) return;
      try {
        setWellCasingData(casingTable);
      } catch (error) {
        console.error("Error fetching well casing data:", error);
      }
    };

    const fetchWellTraject = async () => {
      if (!plotTraject) return;
      try {
        const casingData = await GetDatas(plotTraject);
        if (casingData) {
          setwellTraject(casingData);
        }
      } catch (error) {
        console.error("Error fetching well traject data:", error);
      }
    };

    const fetchWellTrajectFile = async () => {
      if (!fileTraject) return;
      try {
        const data = await GetDatas(fileTraject);
        if (data) {
          setFileTraject(data);
        }
      } catch (error) {
        console.error("Error fetching File Trajectory data:", error);
      }
    };

    const fetchWellSummary = async () => {
      const summaryData = technical?.well_summary;
      if (!summaryData) return;
      try {
        setWellSummary(summaryData[0]);
      } catch (error) {
        console.error("Error fetching well summary data:", error);
      }
    };

    const fetchWellStratigraphy = async () => {
      const stratigraphyData = technical?.well_stratigraphy;
      if (!stratigraphyData) return;
      try {
        setWellStratigraphy(stratigraphyData[0]);
      } catch (error) {
        console.error("Error fetching well stratigraphy data:", error);
      }
    };

    const fetchWellTest = async () => {
      const testData = technical?.well_test;
      if (!testData) return;
      try {
        setWellTest(testData[0]);
      } catch (error) {
        console.error("Error fetching well test data:", error);
      }
    };

    // Jalankan fetch hanya jika data yang diperlukan tersedia
    // fetchWellData();
    fetchWellSummary();
    fetchWellTraject();
    fetchWellTrajectFile();
    fetchDataWellcasing();
    fetchWellCasingData();
    fetchWellStratigraphy();
    fetchWellTest();
  }, [wellCasingBar, plotTraject, data, fileTraject, technical]);

  const getTableHeadersSummary = () => {
    if (wellSummary.length > 0) {
      return Object.keys(wellSummary[0]);
    }
    return [];
  };

  const getTableHeadersStratigraphy = () => {
    if (wellStratigraphy.length > 0) {
      return Object.keys(wellStratigraphy[0]); // Ambil kunci dari objek pertama
    }
    return [];
  };

  const getTableHeadersTest = () => {
    if (wellTest.length > 0) {
      return Object.keys(wellTest[0]); // Ambil kunci dari objek pertama
    }
    return [];
  };

  if (!data || Object.keys(data).length === 0) {
    return <p>Loading or no data available...</p>;
  }

  return (
    <TabPanel mt={8}>
      <Flex direction={"column"}>
        {data?.["Well Information"] ? (
          <Flex direction="row" justify="space-between" wrap="wrap" mb={4}>
            <Box
              boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.10)"}
              borderRadius={"10px"}
              p={"15px"}
              flex="1"
              mr={2}
            >
              <TableContainer>
                <Table variant="simple" colorScheme="gray">
                  <Thead>
                    <Tr bg="gray.50">
                      <Th>Key Well Information</Th>
                      <Th>Value</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(data?.["Well Information"] || data).map(
                      ([key, value], index) => (
                        <Tr key={index}>
                          <Td bg="gray.50">{key}</Td>
                          <Td>{value || "N/A"}</Td>
                        </Tr>
                      )
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>

            <Box
              boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.10)"}
              borderRadius={"10px"}
              p={"15px"}
              flex="1"
              ml={2}
            >
              <TableContainer>
                <Table variant="simple" colorScheme="gray">
                  <Thead>
                    <Tr bg="gray.50">
                      <Th>Key Production Plan</Th>
                      <Th>Value</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(data?.["Production Plan"] || data).map(
                      ([key, value], index) => (
                        <Tr key={index}>
                          <Td bg="gray.50">{key}</Td>
                          <Td>{value || "N/A"}</Td>
                        </Tr>
                      )
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </Flex>
        ) : (
          <Flex direction="row" justify="space-between" wrap="wrap" mb={4}>
            <Box
              boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.10)"}
              borderRadius={"10px"}
              p={"15px"}
              flex="1"
              mr={2}
            >
              <TableContainer>
                <Table variant="simple" colorScheme="gray">
                  <Thead>
                    <Tr bg="gray.50">
                      <Th>Key</Th>
                      <Th>Value</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(data?.["Well Information"] || data)
                      .slice(
                        0,
                        Math.ceil(
                          Object.entries(data?.["Well Information"] || data)
                            .length / 2
                        )
                      )
                      .map(([key, value], index) => (
                        <Tr key={index}>
                          <Td bg="gray.50">{key}</Td>
                          <Td>{value || "N/A"}</Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>

            <Box
              boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.10)"}
              borderRadius={"10px"}
              p={"15px"}
              flex="1"
              ml={2}
            >
              <TableContainer>
                <Table variant="simple" colorScheme="gray">
                  <Thead>
                    <Tr bg="gray.50">
                      <Th>Key</Th>
                      <Th>Value</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(data?.["Production Plan"] || data)
                      .slice(
                        Math.ceil(
                          Object.entries(data?.["Production Plan"] || data)
                            .length / 2
                        )
                      )
                      .map(([key, value], index) => (
                        <Tr key={index}>
                          <Td bg="gray.50">{key}</Td>
                          <Td>{value || "N/A"}</Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          </Flex>
        )}

        <Flex>
          <Box
            boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.10)"}
            borderRadius={"10px"}
            p={"15px"}
            mt={15}
            w={"100%"}
          >
            <Box m={3}>
              <Heading size="md">Well Summary</Heading>
              <Text fontSize="md" color="gray.600">
                Well Section Summary
              </Text>
            </Box>
            <TableContainer>
              <Table variant="striped">
                <Thead>
                  <Tr>
                    <Th>No</Th>
                    {getTableHeadersSummary().map((header, index) => (
                      <Th key={index}>{header}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {wellSummary.map((item, index) => (
                    <Tr key={index}>
                      <Td>{index + 1}</Td>
                      {Object.values(item).map((value, idx) => (
                        <Td key={idx}>
                          {typeof value === "object"
                            ? value.value || JSON.stringify(value)
                            : value}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Flex>

        <Flex>
          <Box
            boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.10)"}
            borderRadius={"10px"}
            p={"15px"}
            mt={15}
            w={"100%"}
          >
            <Box m={3}>
              <Heading size="md">Well Casing</Heading>
              <Text fontSize="md" color="gray.600">
                Well Casing
              </Text>
            </Box>
            <Flex direction="wrap" align="center">
              {bar ? (
                <img src={bar} style={{ flex: 1 }} alt="Well Casing Plot" />
              ) : (
                <p>Loading image...</p>
              )}

              <TableContainer flex={8} mt={4} w={"100%"}>
                <Table variant="striped">
                  <Thead>
                    <Tr>
                      <Th>No</Th>
                      <Th>Well</Th>
                      <Th>Top</Th>
                      <Th>Bottom</Th>
                      <Th>Diameter</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {/* Looping melalui wellCasingData yang diambil dari API */}
                    {wellCasingData.map((well, index) => (
                      <Tr key={index}>
                        <Td>{index + 1}</Td>
                        <Td>{well.Well}</Td>
                        <Td>{well.Top}</Td>
                        <Td>{well.Bottom}</Td>
                        <Td>{well.Diameter}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Flex>
          </Box>
        </Flex>

        <Flex>
          <Box
            boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.10)"}
            borderRadius={"10px"}
            p={"15px"}
            mt={15}
            w={"100%"}
          >
            <Box m={3}>
              <Heading size="md">Well Trajectory</Heading>
              <Text fontSize="md" color="gray.600">
                Well Trajectory
              </Text>
            </Box>
            <Flex mt={10} justifyContent={"center"}>
              <Box>
                <Plot {...wellTraject} />
              </Box>
            </Flex>
            <Box mt={5} mb={5}>
              <Flex align={"center"} gap={4}>
                <Text fontSize="xl" color="gray.600">
                  {fileTraject?.["filename"]}
                </Text>
                <a
                  href={fileTraject?.["filename"]}
                  download={fileTraject?.["filename"]}
                >
                  <Button colorScheme="blue">
                    <DownloadIcon marginRight={2} /> Download
                  </Button>
                </a>
              </Flex>
            </Box>
          </Box>
        </Flex>

        <Flex wrap={"wrap"} gap={4}>
          <Box
            flex={1.2}
            boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.10)"}
            borderRadius={"10px"}
            p={"15px"}
            mt={15}
          >
            <TableContainer>
              <Box m={3}>
                <Heading size="md">Well Stratigraphy</Heading>
                <Text fontSize="md" color="gray.600">
                  Well Stratigraphy
                </Text>
              </Box>
              <Table variant="striped">
                <Thead>
                  <Tr>
                    <Th>No</Th>
                    {getTableHeadersStratigraphy().map((header, index) => (
                      <Th key={index}>{header}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {wellStratigraphy.map((item, index) => (
                    <Tr key={index}>
                      <Td>{index + 1}</Td>
                      {Object.values(item).map((value, idx) => (
                        <Td key={idx}>
                          {typeof value === "object"
                            ? value.value || JSON.stringify(value)
                            : value}
                        </Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>

          {!data?.["Production Plan"] ? (
            <Box
              flex={1}
              boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.10)"}
              borderRadius={"10px"}
              p={"15px"}
              mt={15}
            >
              <TableContainer>
                <Box m={3}>
                  <Heading size="md">Well Test</Heading>
                  <Text fontSize="md" color="gray.600">
                    Well Test
                  </Text>
                </Box>
                <Table variant="striped">
                  <Thead>
                    <Tr>
                      <Th>No</Th>
                      {getTableHeadersTest().map((header, index) => (
                        <Th key={index}>{header}</Th>
                      ))}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {wellTest.map((item, index) => (
                      <Tr key={index}>
                        <Td>{index + 1}</Td>
                        {Object.values(item).map((value, idx) => (
                          <Td key={idx}>
                            {typeof value === "object"
                              ? value.value || JSON.stringify(value)
                              : value}
                          </Td>
                        ))}
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Box>
          ) : null}
        </Flex>
      </Flex>
    </TabPanel>
  );
};

export default TabsOperational;
