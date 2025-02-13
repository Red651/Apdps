import {
  GetViewOperation,
  GetDatas,
  GetWRMProgress,
  GetjobIssue,
} from "../../../API/APISKK";
// import TabsOperationalOps from "./Components/TabsOperationalOps";
// import TabsOperationalTech from "./Components/TabsOperationalTech";
// import TabsOperationalReport from "./Components/TabsOperationalReport";
import WrMonitoring from "./Components/WrMonitoring";
import JobIssue from "./Components/JobIssue";
import DataTable from "./Components/DataTable";
import WorkBreakdownStructure from "./Components/WorkBreakdownStructure";
import JobOperationDays from "./Components/JobOperationDays";
import JobHazards from "./Components/JobHazards";
import JobDocuments from "./Components/JobDocuments";
import WellData from "./Components/WellData";
import WellCasing from "./Components/WellCasing";
import WellTrajectory from "./Components/WellTrajectory";
import WellPpfg from "./Components/WellPpfg";
import DataTableDownload from "./Components/DataTableDownload";
import TableOfContents from "../../Card/TableOfContents";
import WellSchematic from "./Components/WellSchematic";
import SeismicSection from "./Components/SeismicSection";
import AvailableData from "./Components/AvailableData";
import WellLogs from "./Components/WellLogs";
import ProjectManagementTeam from "./Components/ProjectManagementTeam";
import CardFormK3 from "../../../Forms/Components/CardFormK3";
import TabsOperationalReport from "./Components/TabsOperationalReport";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, useToast, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import GeoMap from "./Components/GeoMap";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Spinner,
  Text,
  Heading,
  Alert,
  AlertIcon,
  TabIndicator,
} from "@chakra-ui/react";
import BreadcrumbCard from "../../Card/Breadcrumb";
import { useInView } from 'react-intersection-observer';
import {IconMap} from '@tabler/icons-react';

const ViewExploration = () => {
  const [operationalData, setOperationalData] = useState();
   
  const [wrmData, setWrmData] = useState();
  const [jobIssue, setJobIssue] = useState();
  const [geo, setGeo] = useState(null);
  const { job_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [loading2, setLoading2] = useState(true);
  const geoData = operationalData?.location;
  const wellName = operationalData?.header.well_name;
  const jobType = operationalData?.header.job_type;
  const status = operationalData?.header.operation_status;
  const toast = useToast();

  // operationalData?.
  

  useEffect(() => {
    const fetchWrmDatas = async () => {
      setLoading(true);
      try {
        const fetchData = await GetWRMProgress(job_id);
        setWrmData(fetchData.data);

        const fetchDataJobIssue = await GetjobIssue(job_id);
        setJobIssue(fetchDataJobIssue.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWrmDatas();
  }, [job_id]);

  useEffect(() => {
    const fetchDatas = async () => {
      setLoading2(true);
      try {
        const fetchData = await GetViewOperation(job_id);
        setOperationalData(fetchData.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Terjadi Kesalahan Pada Sistem",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setLoading2(false);
      }
    };
    fetchDatas();
  }, [job_id,]);

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const fetchData = await GetViewOperation(job_id);
        setOperationalData(fetchData.data);

        const fetchDataGeo = await GetDatas(geoData);
        setGeo(fetchDataGeo?.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDatas();
  }, [job_id, geoData]);

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(feature.properties.name);
    }
  };

  // geo?.

  const geoOperation = geo?.geojson || {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Point",
          coordinates: [113.0, -6.0],
        },
      },
    ],
  };

  const geoCenter =
    geo?.center && geo?.center.x != null && geo?.center.y != null
      ? [geo?.center.y, geo?.center.x]
      : null;

  const getStatus = (status) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "OPERATING":
        return "info";
      case "FINISHED":
        return "info";
      case "RETURNED":
        return "error";
      default:
        return "warning"; // Default status jika tidak ada match
    }
  };

  const isDataAvailable = (id) => {
    switch (id) {
      case "ppp":
        return operationalData?.job_summary;
      case "wrm":
        return wrmData;
      case "job-issues":
        return jobIssue;
      case "project":
        return operationalData?.job_summary?.project;
      case "technical":
        return operationalData?.job_summary?.technical;
      case "available-data":
        return (
          operationalData?.job_summary?.project_available_data ||
          operationalData?.job_summary?.well_available_data
        );
      case "map":
        return geo || geoCenter || geoOperation;
      case "job-operation-days":
        return operationalData?.job_operation_days;
      case "work-breakdown-structure":
        return operationalData?.work_breakdown_structure;
      case "project-management-team":
        return operationalData?.project_management_team;
      case "job-hazard":
        return operationalData?.job_hse;
      case "job-hse-aspects":
        return (
          operationalData?.job_hse?.hse_aspects?.actual ||
          operationalData?.job_hse?.hse_aspects?.plan
        );
      case "job-equipment":
        return operationalData?.job_equipment;
      case "job-documents":
        return operationalData?.job_documents;
      case "well-casing":
        return (
          operationalData?.well_casings?.plot?.actual ||
          operationalData?.well_casings?.plot?.plan ||
          operationalData?.well_casings?.table?.actual ||
          operationalData?.well_casings?.table?.plan
        );
      case "well-schematic":
        return operationalData?.well_schematic;
      case "well-trajectory":
        return operationalData?.well_trajectory;
      case "well-ppfg":
        return operationalData?.well_ppfg;
      case "well-log-plan":
        return operationalData?.well_log;
      case "well-drilling-parameters":
        return operationalData?.well_drilling_parameter_actual;
      case "seismic-section":
        return operationalData?.seismic_section;
      case "well-materials":
        return operationalData?.well_materials;
      case "well-stratigraphy":
        return operationalData?.well_stratigraphy;
      case "well-test":
        return operationalData?.well_tests;
      case "well-cores":
        return operationalData?.well_cores;
      case "daily-operations-report":
        return true;
      default:
        return false;
    }
  };

  const headings = [
    { id: "project", title: "Summary Project" },
    { id: "technical", title: "Technical" },
    { id: "job-issues", title: "Job Issues" },
    { id: "available-data", title: "Available Data" },
    { id: "wrm", title: "Well Readiness Monitoring" },
    { id: "map", title: "Map" },
    { id: "job-operation-days", title: "Job Operation Days" },
    { id: "work-breakdown-structure", title: "Work Breakdown Structure" },
    { id: "project-management-team", title: "Project Management Team" },
    { id: "job-hazard", title: "Job Hazard" },
    { id: "job-hse-aspects", title: "Job HSE Aspects" },
    { id: "job-equipment", title: "Job Equipment" },
    { id: "job-documents", title: "Job Documents" },
    { id: "well-casing", title: "Well Casing" },
    { id: "well-schematic", title: "Well Schematic" },
    { id: "well-trajectory", title: "Well Trajectory" }, //polo
    { id: "well-ppfg", title: "Well PPFG" },
    { id: "well-log-plan", title: "Well Log" },
    { id: "well-drilling-parameters", title: "Well Drilling Parameters" },
    { id: "seismic-section", title: "Seismic Section" },
    { id: "well-materials", title: "Well Materials" },
    { id: "well-stratigraphy", title: "Well Stratigraphy" },
    { id: "well-test", title: "Well Test" },
    { id: "well-cores", title: "Well Cores" },
    { id: "daily-operations-report", title: "Daily Operations Report" },
  ];

  const { ref: refWbs, inView: inViewWbs } = useInView({ triggerOnce: true, threshold: 0.1, rootMargin: '-100px 0px' });
  const { ref: refWellLog, inView: inViewWellLog } = useInView({ triggerOnce: true, threshold: 0.1, rootMargin: '-100px 0px' });
  const { ref: refSeismic, inView: inViewSeismic } = useInView({ triggerOnce: true, threshold: 0.1, rootMargin: '-100px 0px' });
  const { ref: refDor, inView: inViewDor } = useInView({ triggerOnce: true, threshold: 0.1, rootMargin: '-100px 0px' });

  const filteredHeadings = headings.filter((heading) =>
    isDataAvailable(heading.id)
);

  if (loading2) {
    return (
      <Flex w="full" gap={6} flexDir={"column"}>
        <Box w={"15%"}>
          <SkeletonText mt="6" noOfLines={2} spacing="4" skeletonHeight="6" />
        </Box>
        <Flex gap={6}>
          <Box padding="6" boxShadow="lg" bg="white" flex={6} w={"100%"}>
            <SkeletonCircle size="14" />
            <SkeletonText mt="6" noOfLines={6} spacing="4" skeletonHeight="6" />
          </Box>
          <Box padding="6" flex={1} w={"100%"}>
            <SkeletonText mt="4" noOfLines={6} spacing="4" skeletonHeight="4" />
          </Box>
        </Flex>
        <Flex gap={6}>
          <Box padding="6" boxShadow="lg" bg="white" flex={6} w={"100%"}>
            <SkeletonCircle size="14" />
            <SkeletonText mt="6" noOfLines={6} spacing="4" skeletonHeight="6" />
          </Box>
          <Box padding="6" flex={1} w={"100%"}></Box>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex flexDirection={"column"} gap={4} fontFamily={"Mulish"}>
      <Flex alignItems={"center"} justifyContent={"space-between"}>
        <Box mt={3}>
          <Heading as="h3" size="lg" fontFamily={"Mulish"}>
            {wellName}
          </Heading>
          <Text fontSize="lg" color={"gray.400"}>
            {jobType}
          </Text>
        </Box>
        <Box>
          <Alert
            status={getStatus(status)}
            variant={status == "FINISHED" ? "solid" : "subtle"}
            p={5}
            borderRadius="10px"
          >
            <AlertIcon />
            {status || "ERRORS!"}
          </Alert>
        </Box>
      </Flex>
      <BreadcrumbCard wellName={wellName ?? "-"} />
      <Flex flexDirection={"row-reverse"} w={"full"} gap={6}>
        <Box flex={1} position={"sticky"}>
          <TableOfContents headings={filteredHeadings} />
        </Box>
        <Box flex={4}>
          <Flex flexDirection={"column"} gap={6}>
            {operationalData?.job_summary?.project && (
              <Box id="project">
                <CardFormK3
                  title={"Summary Project"}
                  subtitle={"Project"}
                  padding="36px 28px"
                >
                  <DataTable
                    data={operationalData?.job_summary?.project?.metadata}
                  />
                  <DataTable
                    data={
                      operationalData?.job_summary?.project?.comparative_data
                    }
                  />
                </CardFormK3>
              </Box>
            )}

            {operationalData?.job_summary?.technical && (
              <Box id="technical">
                <CardFormK3
                  title={"Summary Technical"}
                  subtitle={"Technical"}
                  padding="36px 28px"
                >
                  <DataTable
                    data={operationalData?.job_summary?.technical?.metadata}
                  />
                  <DataTable
                    data={
                      operationalData?.job_summary?.technical?.comparative_data
                    }
                  />
                </CardFormK3>
              </Box>
            )}

            {jobIssue && (
              <Box id="job-issues">
                <JobIssue
                  data={jobIssue}
                  title={"Job Issues"}
                  subTitle={"Job Issues"}
                />
              </Box>
            )}

            {(operationalData?.job_summary?.project_available_data ||
              operationalData?.job_summary?.well_available_data) && (
              <Box id="available-data" mt={2}>
                <Flex w={"100%"} gap={6}>
                  {operationalData?.job_summary?.project_available_data && (
                    <AvailableData
                      title="Project Available Data"
                      subtitle={"Project Available Data"}
                      data={
                        operationalData?.job_summary?.project_available_data
                      }
                    />
                  )}
                  {operationalData?.job_summary?.well_available_data && (
                    <AvailableData
                      title={"Well Available Data"}
                      subtitle={"Well Available Data"}
                      data={operationalData?.job_summary?.well_available_data}
                    />
                  )}
                </Flex>
              </Box>
            )}

            {wrmData && (
              <Box id="wrm">
                <WrMonitoring data={wrmData} />
              </Box>
            )}

            <Box id="map">
              {loading ? (
                <CardFormK3 title={"Map"} padding="36px 28px" icon={IconMap} subtitle={"Map"}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    height="400px"
                  >
                    <Spinner size="xl" />
                  </Box>
                </CardFormK3>
              ) : (
                <CardFormK3 title={"Map"} padding="36px 28px" icon={IconMap}  subtitle={"Map"}>
                  <GeoMap
                    height={500}
                    width={"100%"}
                    geo={geoOperation}
                    center={geoCenter}
                    zoom={9}
                    onEachFeature={onEachFeature}
                  />
                </CardFormK3>
              )}
            </Box>

            {operationalData?.job_operation_days && (
              <Box id="job-operation-days">
                <JobOperationDays
                  data={operationalData?.job_operation_days}
                  actualPlan="True"
                />
              </Box>
            )}

            {operationalData?.work_breakdown_structure && (
              <Box id="work-breakdown-structure" ref={refWbs}>
                <WorkBreakdownStructure
                  data={operationalData?.work_breakdown_structure}
                  loadData={inViewWbs}
                />
              </Box>
            )}

            {(operationalData?.project_management_team?.plan ||
              operationalData?.project_management_team?.actual) && (
              <Box id="project-management-team">
                <Flex direction={"row"} gap={3} maxW={"71vw"}>
                  {operationalData?.project_management_team?.plan && (
                    <ProjectManagementTeam
                      data={operationalData?.project_management_team}
                      title="Project Management Team"
                      subTitle="Project Management Team"
                      type="plan"
                    />
                  )}
                  {operationalData?.project_management_team?.actual && (
                    <ProjectManagementTeam
                      data={operationalData?.project_management_team}
                      title="Project Management Team"
                      subTitle="Project Management Team"
                      type="actual"
                    />
                  )}
                </Flex>
              </Box>
            )}

            {(operationalData?.job_hse?.hazard?.plan ||
              operationalData?.job_hse?.hazard?.actual) && (
              <Box id="job-hazard">
                <Flex direction={"column"} gap={3}>
                  {operationalData?.job_hse?.hazard?.plan && (
                    <WellData
                      data={operationalData?.job_hse?.hazard?.plan}
                      title="Job Hazard Plan"
                      subTitle="HSE Aspects of Job"
                    />
                  )}
                  {operationalData?.job_hse?.hazard.actual && (
                    <WellData
                      data={operationalData?.job_hse?.hazard?.actual}
                      title="Job Hazard actual"
                      subTitle="HSE Aspects of Job"
                    />
                  )}
                </Flex>
              </Box>
            )}

            {(operationalData?.job_hse?.hse_aspects?.plan ||
              operationalData?.job_hse?.hse_aspects?.actual) && (
              <Box display={"flex"} gap={3} id="job-hse-aspects">
                {operationalData?.job_hse?.hse_aspects?.plan && (
                  <CardFormK3
                    title="Job HSE Aspects Plan"
                    subtitle="Job HSE Aspects"
                    padding="36px 28px"
                    flex="1"
                  >
                    <DataTable
                      data={operationalData?.job_hse?.hse_aspects?.plan}
                    />
                  </CardFormK3>
                )}
                {operationalData?.job_hse?.hse_aspects?.actual && (
                  <CardFormK3
                    title="Job HSE Aspects Actual"
                    subtitle="Job HSE Aspects"
                    padding="36px 28px"
                    flex="1"
                  >
                    <DataTable
                      data={operationalData?.job_hse?.hse_aspects?.actual}
                    />
                  </CardFormK3>
                )}
              </Box>
            )}

            {(operationalData?.job_equipment?.plan ||
              operationalData?.job_equipment?.actual) && (
              <Box id="job-equipment">
                <Flex direction={"row"} gap={3}>
                  {operationalData?.job_equipment?.plan && (
                    <ProjectManagementTeam
                      data={operationalData?.job_equipment}
                      title="Job Equipment"
                      subTitle="Job Equipment"
                      type="plan"
                    />
                  )}
                  {operationalData?.job_equipment?.actual && (
                    <ProjectManagementTeam
                      data={operationalData?.job_equipment}
                      title="Job Equipment"
                      subTitle="Job Equipment"
                      type="actual"
                    />
                  )}
                </Flex>
              </Box>
            )}

            {operationalData?.job_documents && (
              <Box id="job-documents">
                <JobDocuments
                  data={operationalData?.job_documents}
                  title="Job Documents"
                  subtitle="Uploaded job documents"
                />
              </Box>
            )}

            {(operationalData?.well_casings?.plot?.actual ||
              operationalData?.well_casings?.plot?.plan ||
              operationalData?.well_casings?.table?.actual ||
              operationalData?.well_casings?.table?.plan) && (
              <Box id="well-casing">
                <WellCasing
                  data={operationalData?.well_casings}
                  actualPlan="True"
                />
              </Box>
            )}

            {operationalData?.well_schematic && (
              <Box id="well-schematic">
                <WellSchematic
                  title={"Well Schematic"}
                  subTitle={"Schematic"}
                  data={operationalData?.well_schematic}
                />
              </Box>
            )}

            {operationalData?.well_trajectory && (
              <Box id="well-trajectory">
                <WellTrajectory title="Well Trajectory" data={operationalData?.well_trajectory} />
              </Box>
            )}

            {operationalData?.well_ppfg && (
              <Box id="well-ppfg">
                <WellPpfg
                  datas={operationalData?.well_ppfg}
                  title="Well PPFG"
                  subTitle="Well PPFG"
                />
              </Box>
            )}

            {operationalData?.well_log && (
              <Box id="well-log-plan" ref={refWellLog}>
              <SeismicSection
                title={"Well Logs"}
                subTitle={"Well Logs"}
                datas={operationalData?.well_log}
                loadData={inViewWellLog}
              />
              </Box>
            )}

            {operationalData?.well_drilling_parameter_actual && (
              <Box id="well-drilling-parameters">
                <WellPpfg
                  datas={operationalData?.well_drilling_parameter_actual}
                  title="Well Drilling Parameter"
                  subTitle="Well Drilling Parameter Actual"
                />
              </Box>
            )}

            {operationalData?.seismic_section && (
              <Box id="seismic-section" ref={refSeismic}>
                <SeismicSection
                  title={"Seismic Section"}
                  subTitle={"Seismic"}
                  datas={operationalData?.seismic_section}
                  loadData={inViewSeismic}
                />
              </Box>
            )}

            {operationalData?.well_materials && (
              <Box id="well-materials">
                <DataTableDownload
                  datas={operationalData?.well_materials}
                  title="Well Materials"
                  subTitle="Well Materials"
                />
              </Box>
            )}

            {operationalData?.well_stratigraphy && (
              <Box id="well-stratigraphy">
                <WellData
                  data={operationalData?.well_stratigraphy}
                  title="Well Stratigraphy"
                  subTitle="Well Stratigraphy"
                />
              </Box>
            )}

            {operationalData?.well_tests && (
              <Box id="well-test">
                <WellData
                  data={operationalData?.well_tests}
                  title="Well Test"
                  subTitle="Well Test"
                />
              </Box>
            )}

            {operationalData?.well_completion && (
              <Box id="well-completion">
                <WellData
                  data={operationalData?.well_completion}
                  title="Well Completion"
                  subTitle="Well Completion"
                />
              </Box>
            )}

            {operationalData?.well_cores && (
              <Box id="well-cores">
                <WellData
                  data={operationalData?.well_cores}
                  title="Well Cores"
                  subTitle="Well Cores"
                />
              </Box>
            )}

            {operationalData?.well_pressure && (
              <Box id="well-pressure">
                <WellData
                  data={operationalData?.well_pressure}
                  title="Well Pressure"
                  subTitle="Well Pressure"
                />
              </Box>
            )}

            <Box id="daily-operations-report" ref={refDor}>
              <CardFormK3 title="Daily Operations Report" subtitle="Daily Operations Report">
              <TabsOperationalReport loadData={inViewDor} />
            </CardFormK3>
            </Box>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

export default ViewExploration;
