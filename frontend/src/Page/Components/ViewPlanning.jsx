import { GetViewPlanning, GetDatas } from "../API/APISKK";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Heading, Text, AlertIcon, Alert } from "@chakra-ui/react";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabIndicator,
  Flex,
  Spinner,
} from "@chakra-ui/react";
import TabsOperational from "./Components/TabsOperational";
import TabsTechnical from "./Components/TabsTechnical";

import GeoMap from "./Components/GeoMap";

const ViewPlanning = () => {
  const [planningData, setPlanningData] = useState();
  const [geo, setGeo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { job_id } = useParams();
  const kkks_id = localStorage.getItem("kkks_id");

  const wbsData = planningData?.operational.work_breakdown_structure.plot.path;
  const geoData = planningData?.map_geojson_path;

  useEffect(() => {
    const fetchDatas = async () => {
      setLoading(true);

      try {
        const responseViewPlanning = await GetViewPlanning(job_id);
        setPlanningData(responseViewPlanning.data);

        const responseGetDatas = await GetDatas(geoData);
        setGeo(responseGetDatas?.data);
      } catch (error) {
        console.error("Error get Data View Planning", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDatas();
  }, [job_id, wbsData, geoData]);

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(feature.properties.name);
    }
  };

  const wellName = planningData?.technical?.key_data?.["Nama Well"];
  const data = planningData?.operational?.key_data;
  const jobType = data?.["Tipe Pekerjaan"];
  const planningStatus = data?.["Planning Status"];

  const getStatus = (status) => {
    switch (status) {
      case "APPROVED":
        return "success";
      case "PROPOSED":
        return "info";
      case "RETURNED":
        return "error";
      default:
        return "warning"; // Default status jika tidak ada match
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
      : [0, 0];

  if (!geo) {
    return <div>Loading...</div>;
  }

  return (
    <Flex
      padding="4"
      flexDirection={"column"}
      gap={5}
      w={"84vw"}
      fontFamily={"Mulish"}
    >
      <Flex alignItems={"center"} justifyContent={"space-between"}>
        <Box mt={3} mb={3}>
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
            {planningStatus}
          </Alert>
        </Box>
      </Flex>
      <Box flex={1} width={"100%"}>
        <Box width="100%" overflowY={"auto"}>
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
              geo={geos}
              center={centerGeos}
              zoom={9}
              onEachFeature={onEachFeature}
            />
          )}
          <Tabs position="relative" variant="unstyled" mt={6}>
            <TabList>
              <Tab fontSize={20} color={"black"}>
                Operational
              </Tab>
              <Tab fontSize={20} color={"black"}>
                Technical
              </Tab>
            </TabList>
            <TabIndicator mt="6px" height="2px" bg="black" borderRadius="1px" />
            <TabPanels>
              <TabsOperational planningData={planningData} />
              <TabsTechnical planningData={planningData} />
            </TabPanels>
          </Tabs>
        </Box>
      </Box>
    </Flex>
  );
};

export default ViewPlanning;
