import {
  GetViewOperation,
  GetWRMProgress,
  GetjobIssue,
  GetDatas,
} from "../API/APISKK";
import TabsOperationalOps from "./Components/TabsOperationalOps";
import TabsOperationalTech from "./Components/TabsOperationalTech";
import TabsOperationalReport from "./Components/TabsOperationalReport";
import TabsPPP from "./Components/TabsPPP";

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
} from "@chakra-ui/react";

const ViewExploration = () => {
  const [operationalData, setOperationalData] = useState();
  const [jobIssue, setJobIssue] = useState();
  const [geo, setGeo] = useState(null);
  const { job_id } = useParams();
  const [loading, setLoading] = useState(true);
  const geoData = operationalData?.map_geojson_path;

  const jobIssues = jobIssue;
  useEffect(() => {
    const fetchDatas = async () => {
      setLoading(true);
      try {
        const fetchData = await GetViewOperation(job_id);
        setOperationalData(fetchData.data);

        const fetchDataGeo = await GetDatas(geoData);
        setGeo(fetchDataGeo.data);

        const fetchDataJobIssue = await GetjobIssue(job_id);
        setJobIssue(fetchDataJobIssue.data);
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
  return (
    <Flex w="84vw" fontFamily={"Mulish"} direction="column">
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

      <Box>
        <Tabs>
          <TabList>
            <Tab fontSize={20} color={"black"}>
              Persetujuan Penyelesaian Pekerjaan
            </Tab>
            <Tab fontSize={20} color={"black"}>
              Operational
            </Tab>
            <Tab fontSize={20} color={"black"}>
              Technical
            </Tab>
            <Tab fontSize={20} color={"black"}>
              Daily Operations Report
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <TabsPPP />
            </TabPanel>
            <TabPanel>
              <TabsOperationalOps />
            </TabPanel>
            <TabPanel>
              <TabsOperationalTech />
            </TabPanel>
            <TabPanel>
              <TabsOperationalReport />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  );
};

export default ViewExploration;
