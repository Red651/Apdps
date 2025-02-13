import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getWellCasing,
  GetViewOperation,
  GetViewTrajectory,
} from "../../../../API/APIKKKS";
import Plot from "react-plotly.js";
import {
  Flex,
  Box,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Text,
} from "@chakra-ui/react";

const TabsOperationalTech = () => {
  const { job_id } = useParams();
  const [technicalData, setTechnicalData] = useState([]);
  const keyData = technicalData?.key_data || {};
  const wellCasing = technicalData?.well_casing;
  const pathWellCasingPlan = wellCasing?.plot?.plan.path;
  const pathWellCasingActual = wellCasing?.plot?.actual.path;
  const [casingPlotPlan, setCasingPlotPlan] = useState("");
  const [casingPlotActual, setCasingPlotActual] = useState("");
  const wellTrajectData = technicalData?.well_trajectory?.path;
  const [wellTrajectPath, setWellTrajectPath] = useState(null);
  const wellStratigraphy = technicalData?.well_stratigraphy;

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const response = await GetViewOperation(job_id);
        setTechnicalData(response.data.technical);

        const responseWellCasing = await getWellCasing(pathWellCasingPlan);
        const imageUrl = URL.createObjectURL(responseWellCasing);
        setCasingPlotPlan(imageUrl);

        const responseWellCasingActual = await getWellCasing(
          pathWellCasingActual
        );
        const imageUrlActual = URL.createObjectURL(responseWellCasingActual);
        setCasingPlotActual(imageUrlActual);

        const responseWellTraject = await GetViewTrajectory(wellTrajectData);
        setWellTrajectPath(responseWellTraject);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDatas();
  }, [job_id, pathWellCasingPlan, wellTrajectData, pathWellCasingActual]);

  const getTableHeadersStratigraphy = () => {
    if (wellStratigraphy.length > 0) {
      return Object.keys(wellStratigraphy[0][0]); // Ambil kunci dari objek pertama
    }
    return [];
  };

  if (!keyData || Object.keys(keyData).length === 0) {
    return <p>Loading or no data available...</p>;
  }

  return (
    <Flex direction={"column"}>
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
                  <Th>Key Plan</Th>
                  <Th>Value</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Object.entries(keyData).map(([key, value], index) => (
                  <Tr key={`plan-${index}-${key}`}>
                    <Td bg="gray.50">{key}</Td>
                    <Td>{value.plan || "N/A"}</Td>
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
                  <Th>Key Actual</Th>
                  <Th>Value</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Object.entries(keyData).map(([key, value], index) => (
                  <Tr key={`actual-${index}-${key}`}>
                    <Td bg="gray.50">{key}</Td>
                    <Td>{value.actual || "N/A"}</Td>
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
            <Heading size="md">Well Casing Plan</Heading>
            <Text fontSize="md" color="gray.600">
              Well Casing
            </Text>
          </Box>
          <Flex direction="wrap" align="center">
            {casingPlotPlan ? (
              <img
                src={casingPlotPlan}
                style={{ flex: 1 }}
                alt="Well Casing Plot"
              />
            ) : (
              <p>Loading image...</p>
            )}

            <Flex flex={8} direction={"column"} gap={10}>
              <TableContainer mt={4} w={"100%"}>
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
                    {Object.entries(wellCasing.table.plan).map(
                      ([key, value], index) => (
                        <Tr key={index}>
                          <Td key={key}>{index + 1}</Td>
                          <Td key={key}>{value.Well}</Td>
                          <Td key={key}>{value.Top}</Td>
                          <Td key={key}>{value.Bottom}</Td>
                          <Td key={key}>{value.Diameter}</Td>
                        </Tr>
                      )
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Flex>
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
            <Heading size="md">Well Casing Actual</Heading>
            <Text fontSize="md" color="gray.600">
              Well Casing
            </Text>
          </Box>
          <Flex direction="wrap" align="center">
            {casingPlotActual ? (
              <img
                src={casingPlotActual}
                style={{ flex: 1 }}
                alt="Well Casing Plot"
              />
            ) : (
              <p>Loading image...</p>
            )}

            <Flex flex={8} direction={"column"} gap={10}>
              <TableContainer mt={4} w={"100%"}>
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
                    {Object.entries(wellCasing.table.actual).map(
                      ([key, value], index) => (
                        <Tr key={index}>
                          <Td key={key}>{index + 1}</Td>
                          <Td key={key}>{value.Well}</Td>
                          <Td key={key}>{value.Top}</Td>
                          <Td key={key}>{value.Bottom}</Td>
                          <Td key={key}>{value.Diameter}</Td>
                        </Tr>
                      )
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
            </Flex>
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
              <Plot {...wellTrajectPath} />
            </Box>
          </Flex>
          <Box mt={5} mb={5}>
            <Flex align={"center"} gap={4}>
              {/* <Text fontSize="xl" color="gray.600">{fileTraject?.["filename"]}</Text>
                            <a href={fileTraject?.["filename"]} download={fileTraject?.["filename"]}>
                                <Button colorScheme="blue">
                                <DownloadIcon marginRight={2} /> Download
                                </Button>
                            </a> */}
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
                {wellStratigraphy.map((innerArray, index) =>
                  innerArray.map((item, subIndex) => (
                    <Tr key={`${index}-${subIndex}`}>
                      {/* <Td>{index + 1}.{subIndex + 1}</Td> */}
                      <Td>{index + 1}</Td>
                      {Object.values(item).map((value, idx) => (
                        <Td key={idx}>
                          {typeof value === "object"
                            ? value.value || JSON.stringify(value)
                            : value}
                        </Td>
                      ))}
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </Flex>
    </Flex>
  );
};
export default TabsOperationalTech;
