import { Box, Heading, TabPanel } from "@chakra-ui/react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Text,
  Button,
  Flex,
} from "@chakra-ui/react";
import { IconCheck, IconArrowDown } from "@tabler/icons-react";
import { GetDatas } from "../../../../API/APISKK";
import { useEffect, useState } from "react";
import InlineSVG from "react-inlinesvg";
import Plot from "react-plotly.js";
import { DownloadIcon } from "@chakra-ui/icons";

const TabsOperational = ({ planningData }) => {
  const [wbs, setWbs] = useState("");
  const [curve, setCurve] = useState([]);
  const [jobOperationTable, setJobOperationTable] = useState([]);
  const [hazardJob, setHazardJob] = useState([]);
  const [jobDoc, setJobDoc] = useState([]);
  const [wellOps, setWellOps] = useState([]);

  const wbsData =
    planningData?.operational?.work_breakdown_structure?.plot?.path;
  const plotJOD = planningData?.operational?.job_operation_days.plot.path;
  const tableJobOps = planningData?.operational?.job_operation_days.table;

  const well = planningData?.operational;
  const wellOperational = planningData?.operational?.key_data;
  const hazard = planningData?.operational?.job_hazards;
  const jobDocuments = planningData?.operational?.job_documents;

  useEffect(() => {
    const fetchDataWBS = async () => {
      if (wbsData) {
        const response = await GetDatas(wbsData);
        setWbs(response);
      }
    };

    const fetchDataCurve = async () => {
      if (plotJOD) {
        const response = await GetDatas(plotJOD);
        setCurve(response);
      }
    };

    if (wellOperational) {
      setWellOps(wellOperational);
    } else {
      console.error("wellOperational is empty or undefined:", wellOperational);
    }

    if (Array.isArray(tableJobOps) && tableJobOps.length > 0) {
      setJobOperationTable(tableJobOps);
    } else {
      console.error("tableJobOps is not a valid array:", tableJobOps);
    }

    if (Array.isArray(hazard) && hazard.length > 0) {
      setHazardJob(hazard);
    } else {
      console.error("hazard is not a valid array:", hazard);
    }

    if (Array.isArray(jobDocuments) && tableJobOps.length > 0) {
      setJobDoc(jobDocuments);
    } else {
      console.error("jobDocuments is not a valid array:", jobDocuments);
    }

    fetchDataWBS();
    fetchDataCurve();
  }, [wbsData, plotJOD, tableJobOps, hazardJob, jobDoc, wellOps]);

  return (
    <>
      <TabPanel mt={8}>
        <Flex direction={"column"}>
          <TableContainer
            padding={(1, 4)}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.10)"
            borderRadius="2xl"
          >
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th backgroundColor={"gray.50"}>Key</Th>
                  <Th backgroundColor={"gray.50"}>Value</Th>
                </Tr>
              </Thead>
              <Tbody>
                {Object.entries(wellOps).map(([key, value], index) => (
                  <Tr key={index}>
                    <Td backgroundColor={"gray.50"}>{key}</Td>
                    <Td>{value || "N/A"}</Td>{" "}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <Box
            overflowY="scroll"
            marginTop={6}
            padding={(1, 4)}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.10)"
            borderRadius="2xl"
          >
            <Heading textAlign={"left"} as="h3" size={"md"}>
              Work Breakdown Stucture
            </Heading>
            <Text
              textAlign={"left"}
              margin={0}
              fontSize={"14px"}
              color={"gray.500"}
              borderBottom={"1px"}
              borderColor={"gray.400"}
            >
              Job Schedule
            </Text>
            <InlineSVG src={wbs} />
          </Box>
          <TableContainer
            marginTop={12}
            padding={(1, 4)}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.10)"
            borderRadius="2xl"
          >
            <Heading textAlign={"left"} as="h3" size={"md"}>
              Job Operation Days
            </Heading>
            <Text textAlign={"left"} fontSize={"14px"} color={"gray.500"}>
              Time depth Curve
            </Text>

            <Flex justifyContent={"center"}>
              <Box>
                <Plot {...curve} />
              </Box>
            </Flex>
            <Table variant="striped" mt={4}>
              <Thead>
                <Tr>
                  <Th>No</Th>
                  <Th>Operasi</Th>
                  <Th>Hari</Th>
                  <Th>Mulai</Th>
                  <Th>Selesai</Th>
                  <Th>Cost</Th>
                </Tr>
              </Thead>
              <Tbody>
                {jobOperationTable.map((row, index) => (
                  <Tr key={index}>
                    <Td>{index + 1}</Td>
                    <Td>{row.Event}</Td>
                    <Td>{row.Days}</Td>
                    <Td>{row.Start}</Td>
                    <Td>{row.End}</Td>
                    <Td>{row.Cost}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <TableContainer
            marginTop={6}
            padding={(1, 4)}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.10)"
            borderRadius="2xl"
          >
            <Heading textAlign={"left"} as="h3" size={"md"} marginBottom={2}>
              Job Potential Hazard
            </Heading>
            <Text textAlign={"left"} fontSize={"14px"} color={"gray.500"}>
              HSE Aspects of Job
            </Text>
            <Table variant="striped">
              <Thead>
                <Th>No</Th>
                <Th>Hazard Type</Th>
                <Th>Hazard Description</Th>
                <Th>Hazard Severity</Th>
                <Th>Mitigation</Th>
                <Th>Remarks</Th>
              </Thead>
              <Tbody>
                {hazardJob && hazardJob.length > 0 ? (
                  hazardJob[0].map((hazard, index) => (
                    <Tr key={index}>
                      <Td>{index + 1}</Td>
                      <Td>{hazard["Hazard Type"]?.value || "N/A"}</Td>
                      <Td>{hazard.Description || "N/A"}</Td>
                      <Td>{hazard.Severity?.value || "N/A"}</Td>
                      <Td>{hazard.Mitigation || "N/A"}</Td>
                      <Td>{hazard.Remark || "N/A"}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={6}>No hazard data available</Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
          <TableContainer
            marginTop={6}
            padding={(1, 4)}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.10)"
            borderRadius="2xl"
          >
            <Heading textAlign={"left"} as="h3" size={"md"} marginBottom={2}>
              Job Documents
            </Heading>
            <Text textAlign={"left"} fontSize={"14px"} color={"gray.500"}>
              Uploaded job documents
            </Text>
            <Table variant="striped">
              <Thead>
                <Th>No</Th>
                <Th>File Name</Th>
                <Th>Document Type</Th>
                <Th>Remarks</Th>
                <Th>Download</Th>
              </Thead>
              <Tbody>
                {jobDoc && jobDoc.length > 0 ? (
                  jobDoc[0].map((doc, index) => (
                    <Tr key={index}>
                      <Td>{index + 1}</Td>
                      <Td>{doc.Filename || "N/A"}</Td>
                      <Td>{doc["Document Type"]?.value || "N/A"}</Td>
                      <Td>{doc.Remark || "N/A"}</Td>
                      <Td>
                        <a href={doc.Download} download={doc.Filename}>
                          <Button colorScheme="blue">
                            <DownloadIcon marginRight={2} /> Download
                          </Button>
                        </a>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={6}>No hazard data available</Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </TabPanel>
    </>
  );
};

export default TabsOperational;
