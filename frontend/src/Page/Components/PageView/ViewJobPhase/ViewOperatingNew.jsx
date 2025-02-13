import {
  GetViewOperation,
  GetDatas,
  GetWRMProgress,
  GetjobIssue,
} from "../../../API/APISKK";
import TabsOperationalOps from "./Components/TabsOperationalOps";
import TabsOperationalTech from "./Components/TabsOperationalTech";
import TabsOperationalReport from "./Components/TabsOperationalReport";
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

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box } from "@chakra-ui/react";
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

const ViewExploration = () => {
  const [operationalData, setOperationalData] = useState();
  const [wrmData, setWrmData] = useState();
  const [jobIssue, setJobIssue] = useState();
  const [geo, setGeo] = useState(null);
  const { job_id } = useParams();
  const [loading, setLoading] = useState(true);
  const geoData = operationalData?.map_geojson_path;

  const operationalDataRaw = operationalData?.operational;
  const technicalData = operationalData?.technical;

  const wellName = operationalData?.technical?.key_data?.["Nama Well"].actual;
  const jobType = operationalData?.operational?.key_data?.["Tipe Pekerjaan"];
  const status = operationalData?.operational?.key_data?.["Operation Status"];

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
      //   setLoading(true);
      try {
        const fetchData = await GetViewOperation(job_id);
        setOperationalData(fetchData.data);

        const fetchDataGeo = await GetDatas(geoData);
        setGeo(fetchDataGeo.data);

        // const fetchDataJobIssue = await GetjobIssue(job_id);
        // setJobIssue(fetchDataJobIssue.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDatas();
  }, [job_id, geoData]);

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(feature.properties.name);
    }
  };

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
    geo?.center && geo.center.x != null && geo.center.y != null
      ? [geo.center.y, geo.center.x]
      : [0, 0];

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

  //   if (!geo) {
  //     return <div>Loading...</div>;
  //   }
  return (
    <Flex w="84vw" fontFamily={"Mulish"} direction="column" p={4}>
      <Flex alignItems={"center"} justifyContent={"space-between"}>
        <Box mt={3} mb={8}>
          <Heading as="h3" size="lg">
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
            {status}
          </Alert>
        </Box>
      </Flex>

      <Box>
        <Tabs position="relative" variant="unstyled" mt={6}>
          <TabList fontSize={10}>
            <Tab fontWeight={"bold"}>Well Readiness Monitoring</Tab>
            <Tab fontWeight={"bold"}>Job Issues</Tab>
            <Tab fontWeight={"bold"}>Operasional</Tab>
            <Tab fontWeight={"bold"}>Work Breakdown Structure</Tab>
            <Tab fontWeight={"bold"}>Map</Tab>
            <Tab fontWeight={"bold"}>Job Operation Days</Tab>
            <Tab fontWeight={"bold"}>Job Hazards</Tab>
            <Tab fontWeight={"bold"}>Job Documents</Tab>
            <Tab fontWeight={"bold"}>Technical</Tab>
            <Tab fontWeight={"bold"}>Well Summary</Tab>
            <Tab fontWeight={"bold"}>Well Casing</Tab>
            <Tab fontWeight={"bold"}>Well Trajectory</Tab>
            <Tab fontWeight={"bold"}>Well Stratigraphy</Tab>
          </TabList>
          <TabIndicator mt="6px" height="2px" bg="black" borderRadius="1px" />
          <TabPanels mt={12}>
            <TabPanel>
              <WrMonitoring data={wrmData} />
            </TabPanel>
            <TabPanel>
              <JobIssue data={jobIssue} />
            </TabPanel>
            <TabPanel>
              <DataTable data={operationalDataRaw.key_data} />
            </TabPanel>
            <TabPanel>
              <WorkBreakdownStructure
                data={operationalDataRaw.work_breakdown_structure}
              />
            </TabPanel>
            <TabPanel>
              {loading ? ( // Conditional rendering for loading state
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  height="400px"
                >
                  <Spinner size="xl" />
                </Box>
              ) : (
                <GeoMap
                  height={400}
                  width={"100%"}
                  geo={geoOperation}
                  center={geoCenter}
                  zoom={9}
                  onEachFeature={onEachFeature}
                />
              )}
            </TabPanel>
            <TabPanel>
              <JobOperationDays
                data={operationalDataRaw.job_operation_days}
                actualPlan="True"
              />
            </TabPanel>
            <TabPanel>
              <JobHazards data={operationalDataRaw.job_hazards} />
            </TabPanel>
            <TabPanel>
              <JobDocuments data={operationalDataRaw.job_documents} />
            </TabPanel>
            <TabPanel>
              <DataTable data={technicalData.key_data} />
            </TabPanel>
            <TabPanel>
              <WellData
                data={technicalData.well_summary}
                title="Well Summary"
                subTitle="Well Summary"
              />
            </TabPanel>
            <TabPanel>
              <WellCasing data={technicalData.well_casing} actualPlan="True" />
            </TabPanel>
            <TabPanel>
              <WellTrajectory data={technicalData.well_trajectory} />
            </TabPanel>
            <TabPanel>
              <WellData
                data={technicalData.well_stratigraphy}
                title="Well Stratigraphy"
                subTitle="Well Stratigraphy"
              />
            </TabPanel>
            {/* <TabPanel>
              <TabsOperationalTech />
            </TabPanel>
            <TabPanel>
              <TabsOperationalReport />
            </TabPanel> */}
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  );
};

export default ViewExploration;
