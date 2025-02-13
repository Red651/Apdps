import { useEffect, useState } from "react";
import {
  GetViewOperation,
  GetWRMProgress,
  GetDatas,
} from "../../../../API/APISKK";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Card,
  CardHeader,
  CardBody,
  Heading,
  Text,
  Button,
  Flex,
} from "@chakra-ui/react";
import InlineSVG from "react-inlinesvg";
import { useParams } from "react-router-dom";
import Plot from "react-plotly.js";
import { DownloadIcon } from "@chakra-ui/icons";
import { IconCircleFilled } from "@tabler/icons-react";

const TabsOperational = () => {
  const [wrmProgress, setWrmProgress] = useState({});
  const [jobOps, setJobOps] = useState();
  const [wbs, setWbs] = useState("");
  const [curve, setCurve] = useState([]);
  const { job_id } = useParams();
  const [jobHazard, setJobHazard] = useState([]);
  const [jobDoc, setJobDoc] = useState([]);

  const jobDatas = jobOps?.operational;
  const jobOperationDays = jobOps?.operational?.job_operation_days?.table || {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wrmResponse, jobOpsResponse, jobDocsResponse] =
          await Promise.all([
            GetWRMProgress(job_id),
            GetViewOperation(job_id),
            GetViewOperation(job_id),
          ]);

        setJobDoc(jobDocsResponse?.data || []);
        setWrmProgress(wrmResponse?.data || {});
        setJobOps(jobOpsResponse?.data || {});

        if (jobOpsResponse?.data?.operational?.job_hazards) {
          setJobHazard(jobOpsResponse.data.operational.job_hazards[0] || []);
        }

        if (jobOpsResponse?.data?.operational?.job_documents) {
          setJobDoc(jobOpsResponse.data.operational.job_documents);
        }

        const wbsData =
          jobOpsResponse?.data?.operational?.work_breakdown_structure?.plot
            ?.path;
        const curveJobs =
          jobOpsResponse?.data?.operational?.job_operation_days?.plot?.path;
        // const jobDocs = jobOps?.operational?.job_documents || [];

        if (wbsData) {
          const wbsResponse = await GetDatas(wbsData);
          setWbs(wbsResponse);
        }
        if (curveJobs) {
          const curveResponse = await GetDatas(curveJobs);
          setCurve(curveResponse);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [job_id]);

  return (
    <Flex direction={"column"} gap={4}>
      <Flex direction={"column"}>
        <Heading textAlign={"left"} as="h3" size={"md"} mb={6}>
          Well Readiness Monitoring
        </Heading>
        <Box
          textAlign={"center"}
          display="flex"
          flexFlow={"row wrap"}
          justifyContent={"center"}
          gap={5}
        >
          {wrmProgress &&
            Object.entries(wrmProgress).map(([key, value], index) => (
              <Card
                key={index}
                flex={1}
                minW={"18%"}
                boxShadow="md"
                borderRadius="lg"
              >
                <CardHeader
                  fontSize={"xl"}
                  fontWeight={"bold"}
                  textAlign="center"
                >
                  {key}
                </CardHeader>

                <CardBody
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  color="green"
                  fontSize="4xl"
                  minH="100px"
                >
                  <IconCircleFilled size={50} />
                </CardBody>

                <CardBody textAlign="center" color="green" fontSize="xl">
                  {value}
                </CardBody>
              </Card>
            ))}
        </Box>
      </Flex>

      <Flex direction={"column"} gap={4}>
        <Box
          overflowY="scroll"
          marginTop={6}
          padding={(1, 4)}
          boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.10)"}
          borderRadius="2xl"
          maxWidth={"100%"}
        >
          <Heading textAlign={"left"} as="h3" size={"md"}>
            Work Breakdown Structure
          </Heading>
          <Text
            textAlign={"left"}
            margin={0}
            fontSize={"14px"}
            color={"gray.500"}
            borderBottom={"1px"}
            borderColor={"gray.400"}
            borderRadius="2xl"
          >
            Job Schedule
          </Text>
          <InlineSVG src={wbs} />
        </Box>

        <Flex>
          <Box
            flex={1}
            boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.10)"}
            borderRadius="2xl"
            maxWidth={"100%"}
            padding={(1, 4)}
            mt={6}
          >
            <Box m={3}>
              <Heading size="md">Job Operation Days</Heading>
              <Text fontSize="md" color="gray.600">
                Time depth Curve
              </Text>
            </Box>
            <Flex justifyContent={"center"} alignItems={"center"} flex={1}>
              <Plot {...curve} />
            </Flex>
            <TableContainer mt={10}>
              <Table variant="striped">
                <Thead>
                  <Tr>
                    {Object.keys(jobOperationDays.plan?.[0] || {}).map(
                      (key) => (
                        <Th key={key}>{key}</Th>
                      )
                    )}
                  </Tr>
                </Thead>
                <Tbody>
                  {jobOperationDays.plan?.map((plan, index) => (
                    <Tr key={index}>
                      {Object.values(plan).map((value, idx) => (
                        <Td key={idx}>{value || "-"}</Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </Flex>
      </Flex>

      <Flex direction={"column"}>
        <Box
          boxShadow={"0px 1px 5px rgba(0, 0, 0, 0.10)"}
          borderRadius="2xl"
          padding={(1, 4)}
        >
          <Box m={3}>
            <Heading size="md">Job Operation Days</Heading>
            <Text fontSize="md" color="gray.600">
              Time depth Curve
            </Text>
          </Box>
          <TableContainer mt={6}>
            <Table variant="striped">
              <Thead>
                {jobHazard.length > 0 &&
                  Object.keys(jobHazard[0]).map((key) => (
                    <Th key={key}>{key}</Th>
                  ))}
              </Thead>
              <Tbody>
                {jobHazard.map((hazard, index) => (
                  <Tr key={index}>
                    {Object.entries(hazard).map(([key, value]) => (
                      <Td key={key}>
                        {typeof value === "object" && value !== null
                          ? value.value || value.name
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
        <Box mt={6}>
          <TableContainer>
            <Table variant="striped">
              <Thead>
                {jobDoc.length > 0 &&
                  Object.keys(jobDoc[0]).map((key) => <Th key={key}>{key}</Th>)}
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
        </Box>
      </Flex>
    </Flex>
  );
};

export default TabsOperational;
