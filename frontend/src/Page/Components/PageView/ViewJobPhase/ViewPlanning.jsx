import {
  GetViewPlanning,
  GetDatas,
  ApprovePlanning,
  ReturnPlanning,
} from "../../../API/APISKK";
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Heading,
  AlertIcon,
  Alert,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Text,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tab,
  TabIndicator,
  Flex,
  Spinner,
  Button,
} from "@chakra-ui/react";
// import TabsOperational from "./Components/TabsOperational";
// import TabsTechnical from "./Components/TabsTechnical";
import DataTable from "./Components/DataTable";
import WorkBreakdownStructure from "./Components/WorkBreakdownStructure";
import JobOperationDays from "./Components/JobOperationDays";
import JobHazards from "./Components/JobHazards";
import JobDocuments from "./Components/JobDocuments";
import WellData from "./Components/WellData";
import WellCasing from "./Components/WellCasing";
import WellTrajectory from "./Components/WellTrajectory";
import { IconCheck, IconArrowDown } from "@tabler/icons-react";
import GeoMap from "./Components/GeoMap";
import DataTableDownload from "./Components/DataTableDownload";
import WellPpfg from "./Components/WellPpfg";
import WellCores from "./Components/WellCores";
import WellLogs from "./Components/WellLogs";
import TableOfContents from "../../Card/TableOfContents";
import CardFormK3 from "../../../Forms/Components/CardFormK3";
import AvailableData from "./Components/AvailableData";
import BreadCrumbCard from "../../../Components/Card/Breadcrumb";
import { Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import WellPressure from "./Components/WellPressure";
import { useInView } from "react-intersection-observer";

const ViewPlanning = () => {
  const [planningData, setPlanningData] = useState();
  const [geo, setGeo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { job_id } = useParams();
  const toast = useToast();

  const DataTables = planningData?.job_summary?.project;
  const DataTablesTecnical = planningData?.job_summary?.technical;
  const ProjectAvailabel = planningData?.job_summary?.project_available_data;
  const WelltAvailabel = planningData?.job_summary?.well_available_data;
  const jobOperationDayss = planningData?.job_operation_days;
  const ProjectMT = planningData?.project_management_team;
  const jobHazards = planningData?.job_hse?.potential_hazard;
  const jobDocuments = planningData?.job_documents;
  const wellCores = planningData?.well_cores;
  const wellCasing = planningData?.well_casings;
  const wellTrajectory = planningData?.well_trajectory;
  const wellStratigraphy = planningData?.well_stratigraphy;
  const wellTest = planningData?.well_tests;
  const wellPressure = planningData?.well_pressure;
  const wellCompletion = planningData?.well_completion;
  const geoData = planningData?.location;
  const jobEquipment = planningData?.job_equipment;
  const hseAspects = planningData?.job_hse?.hse_aspects;
  const wellDrillingParameterPlan = planningData?.well_drilling_parameter_plan;
  // const wellLogPlan = planningData?.well_log;
  const wellLogPlan = planningData?.well_log;
  const wellMaterials = planningData?.well_materials;
  const wellPpfg = planningData?.well_ppfg;
  const wellSchematic = planningData?.well_schematic;
  const WbsNew = planningData?.work_breakdown_structure;

  // Modal controls
  const returnModal = useDisclosure();
  const approveModal = useDisclosure();
  const location = useLocation();
  const navigate = useNavigate();

  const roles = JSON.parse(localStorage.getItem("user")).role;

  const { ref: refWbs, inView: inViewWbs } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "-100px 0px",
  });

  const { ref: refWellLog, inView: inViewWellLog } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "-100px 0px",
  });

  const { ref: refseismic, inView: inViewseismic } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "-100px 0px",
  });

  const { ref: refDor, inView: inViewDor } = useInView({
    triggerOnce: true,
    threshold: 0.1,
    rootMargin: "-100px 0px",
  });

  useEffect(() => {
    const fetchDatas = async () => {
      setLoading(true);
      try {
        const responseViewPlanning = await GetViewPlanning(job_id);
        setPlanningData(responseViewPlanning.data);

        // responseViewPlanning.message
        setLoading(false);
      } catch (error) {
        setLoading(true);

        // console.error("Error get Data View Planning", error.response);
        toast({
          position: "top-right",
          title: `Error!`,
          description: "Kesalahan Pada Server",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        toast({
          position: "top-left",
          title: `Error!`,
          description: "Kesalahan Pada Server",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        toast({
          position: "bottom-left",
          title: `Error!`,
          description: "Kesalahan Pada Server",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        toast({
          position: "bottom-right",
          title: `Error!`,
          description: "Kesalahan Pada Server",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        toast({
          position: "top",
          title: `Error!`,
          description: "Kesalahan Pada Server",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        toast({
          position: "bottom",
          title: `Error!`,
          description: "Kesalahan Pada Server",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };

    fetchDatas();
  }, [job_id]);

  useEffect(() => {
    const fetchDatas = async () => {
      try {
        const responseGetDatas = await GetDatas(geoData);
        setGeo(responseGetDatas.data);
      } catch (error) {
        console.error("Error get Data View Planning", error.response);
      }
    };

    fetchDatas();
  }, [geoData]);

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(feature.properties.name);
    }
  };

  const wellName = planningData?.header.well_name;
  const jobType = planningData?.header.job_type;
  const planningStatus = planningData?.header.planning_status;

  const getStatus = (status) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PROPOSED":
        return "info";
      case "RETURNED":
        return "error";
      default:
        return "warning";
    }
  };

  const geos = geo?.geojson || {
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

  const centerGeos =
    geo?.center && geo.center.x != null && geo.center.y != null
      ? [geo.center.y, geo.center.x]
      : null;

  const handleApprove = async () => {
    try {
      setLoading(true);
      const response = await ApprovePlanning(job_id);
      if (response) {
        toast({
          title: `Data ${job_id ? "Updated" : "Created"} Successfully.`,
          description: `Approve data has been successfully ${
            job_id ? "updated" : "created"
          }.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate(`/skk/${jobType.toLowerCase()}/planning`);
      } else {
        toast({
          title: "Error",
          description: `An error occurred while ${
            job_id ? "updating" : "creating"
          } Planning.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error approving job", error);
    } finally {
      setLoading(false);
      approveModal.onClose();
    }
  };

  const handleReturn = async () => {
    try {
      setLoading(true);
      const response = await ReturnPlanning(job_id);
      if (response) {
        toast({
          title: `Data ${job_id ? "Updated" : "Created"} Successfully.`,
          description: `Return data has been successfully ${
            job_id ? "updated" : "created"
          }.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate(`/skk/${jobType.toLowerCase()}/planning`);
      } else {
        toast({
          title: "Error",
          description: `An error occurred while ${
            job_id ? "updating" : "creating"
          } PPP.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error returning job", error);
    } finally {
      setLoading(false);
      returnModal.onClose();
    }
  };

  const isValidatePage = location.pathname.includes("/validate");

  const headings = [
    { id: "project", title: "Project" },
    { id: "technical", title: "Technical" },
    { id: "available-data", title: "Available Data" },
    { id: "map", title: "Map" },
    { id: "job-operation-days", title: "Job Operation Days" },
    { id: "work-breakdown-structure", title: "Work Breakdown Structure" },
    { id: "project_management_team", title: "Project Management Team" },
    { id: "job-potential-hazard", title: "Job Potential Hazard" },
    { id: "job-hse-aspects", title: "Job HSE Aspects" },
    { id: "job-equipment", title: "Job Equipment" },
    { id: "job-documents", title: "Job Documents" },
    { id: "well-casing", title: "Well Casing" },
    { id: "well_schematic", title: "Well Schematic" },
    { id: "well-trajectory", title: "Well Trajectory" },
    { id: "well-ppfg", title: "Well PPFG" },
    { id: "well-log-plan", title: "Well Log Plan" },
    { id: "well-drilling-parameters", title: "Well Drilling Parameters" },
    { id: "well-materials", title: "Well Materials" },
    { id: "well-pressure", title: "Well Pressure" },
    { id: "well-completion", title: "Well Completion" },
    { id: "well-test", title: "Well Test" },
    { id: "well-stratigraphy", title: "Well Stratigraphy" },
    { id: "well-cores", title: "Well Cores" },
  ];

  const filteredHeadings = headings.filter((heading) => {
    switch (heading.id) {
      case "project":
        return DataTables != null;
      case "technical":
        return DataTablesTecnical != null;
      case "available-data":
        return ProjectAvailabel != null && WelltAvailabel != null;
      case "map":
        return geoData != null;
      case "job-operation-days":
        return jobOperationDayss != null;
      case "work-breakdown-structure":
        return WbsNew != null;
      case "project_management_team":
        return ProjectMT != null;
      case "job-potential-hazard":
        return jobHazards != null;
      case "job-hse-aspects":
        return hseAspects != null;
      case "job-equipment":
        return jobEquipment != null;
      case "job-documents":
        return jobDocuments != null;
      case "well-casing":
        return wellCasing != null;
      case "well_schematic":
        return wellSchematic != null;
      case "well-trajectory":
        return wellTrajectory != null;
      case "well-ppfg":
        return wellPpfg != null;
      case "well-log-plan":
        return wellLogPlan != null;
      case "well-drilling-parameters":
        return wellDrillingParameterPlan != null;
      case "well-materials":
        return wellMaterials != null;
      case "well-stratigraphy":
        return wellStratigraphy != null;
      case "well-test":
        return wellTest != null;
      case "well-cores":
        return wellCores != null;
      case "well-pressure":
        return wellPressure != null;
      case "well-completion":
        return wellCompletion != null;
      default:
        return true; // Menyertakan elemen jika tidak ada kondisi khusus
    }
  });

  if (loading) {
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
        <Box>
          <Heading as="h3" size="lg">
            {wellName}
          </Heading>
          <Text fontSize="lg" color={"gray.400"}>
            {jobType}
          </Text>
        </Box>
        <Box>
          <Alert status={getStatus(planningStatus)} p={5} borderRadius={"10px"}>
            <AlertIcon />
            {planningStatus || "ERRORS!!"}
          </Alert>
        </Box>
      </Flex>
      <BreadCrumbCard wellName={wellName ?? "-"} disabledSegments={["view"]} />

      <Flex flexDirection={"row-reverse"} w={"full"} gap={6}>
        <Box flex={1} position={"sticky"}>
          <TableOfContents headings={filteredHeadings} />
        </Box>
        <Box flex={4}>
          <Flex flexDirection={"column"} gap={6}>
            {DataTables && (
              <Box id="project">
                <CardFormK3
                  w={"100%"}
                  title="Project"
                  subtitle="Project"
                  padding="36px 28px"
                >
                  <DataTable data={DataTables} />
                </CardFormK3>
              </Box>
            )}

            {DataTablesTecnical && (
              <Box id="technical">
                <CardFormK3
                  w={"100%"}
                  title="Technical"
                  subtitle="Technical"
                  padding="36px 28px"
                >
                  {!DataTablesTecnical?.["Production Plan"] && (
                    <DataTable data={DataTablesTecnical} />
                  )}
                  {DataTablesTecnical?.["Production Plan"] && (
                    <Flex gap={3}>
                      <DataTable
                        data={DataTablesTecnical?.["Production Plan"]}
                      />
                      <DataTable
                        data={DataTablesTecnical?.["Well Information"]}
                      />
                    </Flex>
                  )}
                </CardFormK3>
              </Box>
            )}

            <Box id="available-data" mt={2}>
              <Flex w={"100%"} gap={6}>
                {ProjectAvailabel && (
                  <AvailableData
                    title="Project Available Data"
                    data={ProjectAvailabel}
                  />
                )}

                {WelltAvailabel && (
                  <AvailableData
                    title="Well Available Data"
                    data={WelltAvailabel}
                  />
                )}
              </Flex>
            </Box>

            <Box id="map">
              {geo && centerGeos ? (
                <CardFormK3 title={"Map"} padding="36px 28px" subtitle={"Map"}>
                  <GeoMap
                    height={500}
                    width="100%"
                    geo={geos}
                    center={centerGeos}
                    zoom={9}
                    onEachFeature={onEachFeature}
                  />
                </CardFormK3>
              ) : (
                <Skeleton height={"500px"} />
              )}
            </Box>

            {jobOperationDayss && (
              <Box id="job-operation-days">
                <JobOperationDays data={jobOperationDayss} />
              </Box>
            )}

            {WbsNew && (
              <Box id="work-breakdown-structure" ref={refWbs}>
                <WorkBreakdownStructure
                  overflowX={"auto"}
                  data={WbsNew}
                  loadData={inViewWbs}
                />
              </Box>
            )}

            {ProjectMT && (
              <Box id="project_management_team">
                <WellData
                  data={ProjectMT}
                  title="Project Management Team"
                  subTitle="Project Management Team"
                />
              </Box>
            )}

            {jobHazards && (
              <Box id="job-potential-hazard">
                <JobHazards
                  data={jobHazards}
                  title="Job Potensial Hazard"
                  subtitle="Job Potensial Hazard"
                />
              </Box>
            )}

            {hseAspects && (
              <Box id="job-hse-aspects">
                <CardFormK3
                  w={"100%"}
                  title="Job HSE Aspects"
                  subTitle="Job HSE Aspects"
                  padding="36px 28px"
                >
                  <DataTable data={hseAspects} />
                </CardFormK3>
              </Box>
            )}

            {jobEquipment && (
              <Box id="job-equipment">
                <WellData
                  data={jobEquipment}
                  title="Job Equipment"
                  subTitle="Job Equipment"
                />
              </Box>
            )}

            {jobDocuments && (
              <Box id="job-documents">
                <JobDocuments
                  data={jobDocuments}
                  title="Job Documents"
                  subtitle="Job Documents"
                />
              </Box>
            )}

            {wellCasing && (
              <Box id="well-casing">
                <WellCasing
                  data={wellCasing}
                  title={"Well Casing"}
                  subTitle={"Well Casing"}
                />
              </Box>
            )}

            {wellSchematic && (
              <Box id="well_schematic">
                <WellPpfg
                  datas={wellSchematic}
                  title="Well Schematic"
                  subTitle="Well Schematic"
                />
              </Box>
            )}

            {wellTrajectory && (
              <Box id="well-trajectory">
                <WellTrajectory
                  title={"Well Trajectory"}
                  subTitle={"Well Trajectory"}
                  data={wellTrajectory}
                />
              </Box>
            )}

            {wellPpfg && (
              <Box id="well-ppfg">
                <WellPpfg
                  datas={wellPpfg}
                  title="Well PPFG"
                  subTitle="Well PPFG"
                />
              </Box>
            )}

            {wellLogPlan && (
              <Box id="well-log-plan">
                <WellLogs
                  datas={wellLogPlan}
                  title="Well Log Plan"
                  subTitle="Well Log"
                />
              </Box>
            )}

            {wellDrillingParameterPlan && (
              <Box id="well-drilling-parameters">
                <DataTableDownload
                  datas={wellDrillingParameterPlan}
                  title="Well Driling Parameters"
                  subTitle="Well Driling Parameters"
                />
              </Box>
            )}

            {wellPressure && (
              <Box id="well-pressure">
                <WellPressure
                  datas={wellPressure}
                  title="Well Pressure "
                  subTitle="Well Pressure "
                />
              </Box>
            )}

            {wellCompletion && (
              <Box id="well-completion">
                <WellPressure
                  datas={wellCompletion}
                  title="Well Completion "
                  subTitle="Well Completion "
                />
              </Box>
            )}

            {wellTest && (
              <Box id="well-test">
                <WellData
                  data={wellTest}
                  title="Well Test"
                  subTitle="Well Test"
                />
              </Box>
            )}

            {wellMaterials && (
              <Box id="well-materials">
                <DataTableDownload
                  datas={wellMaterials}
                  title="Well Materials"
                  subTitle="Well Materials"
                />
              </Box>
            )}

            {wellStratigraphy && (
              <Box id="well-stratigraphy">
                <WellData
                  data={wellStratigraphy}
                  title="Well Stratigraphy"
                  subTitle="Well Stratigraphy"
                />
              </Box>
            )}

            {wellCores && (
              <Box id="well-cores">
                <WellCores
                  data={wellCores}
                  title="Well Cores"
                  subTitle="Well Cores"
                />
              </Box>
            )}
          </Flex>
        </Box>
      </Flex>

      <Flex>
        {roles == "Admin" && isValidatePage && (
          <Flex justifyContent="flex-end" gap={3} paddingRight={3}>
            <Button
              colorScheme="red"
              width={"150px"}
              height={"60px"}
              borderRadius={16}
              onClick={returnModal.onOpen}
            >
              <IconArrowDown marginRight={2} /> RETURN
            </Button>
            <Button
              colorScheme="green"
              width={"150px"}
              height={"60px"}
              borderRadius={16}
              onClick={approveModal.onOpen}
            >
              <IconCheck /> APPROVE
            </Button>
          </Flex>
        )}

        {/* Return Modal */}
        <Modal isOpen={returnModal.isOpen} onClose={returnModal.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Return Confirmation</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text mb={4}>
                Are you sure you want to return this exploration?
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={returnModal.onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleReturn}
                isLoading={loading}
              >
                Return
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>

        {/* Approve Modal */}
        <Modal isOpen={approveModal.isOpen} onClose={approveModal.onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Approve Confirmation</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>Are you sure you want to approve this exploration?</Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={approveModal.onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={handleApprove}
                isLoading={loading}
              >
                Approve
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </Flex>
    </Flex>
  );
};

export default ViewPlanning;
