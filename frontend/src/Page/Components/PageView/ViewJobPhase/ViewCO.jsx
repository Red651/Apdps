import React from "react";
import {
  GetViewOperation,
  GetDatas,
  PatchApprove,
  PatchReturn,
} from "../../../API/APISKK";
import TabsOperationalOps from "./Components/TabsOperationalOps";
import TabsOperationalTech from "./Components/TabsOperationalTech";
import TabsOperationalReport from "./Components/TabsOperationalReport";
import TabsPPP from "./Components/TabsPPP";
import { IconCheck, IconArrowDown } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Box,
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
} from "@chakra-ui/react";
import GeoMap from "./Components/GeoMap";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Spinner,
  Button,
} from "@chakra-ui/react";

const ViewExploration = () => {
  const [operationalData, setOperationalData] = useState();
  const [geo, setGeo] = useState(null);
  const [loading, setLoading] = useState(true);
  const { job_id } = useParams();
  const geoData = operationalData?.map_geojson_path;
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const returnModal = useDisclosure();
  const approveModal = useDisclosure();

  const roles = JSON.parse(localStorage.getItem("user")).role;

  useEffect(() => {
    const fetchDatas = async () => {
      setLoading(true);
      try {
        const fetchData = await GetViewOperation(job_id);
        setOperationalData(fetchData.data);

        const fetchDataGeo = await GetDatas(geoData);
        setGeo(fetchDataGeo.data);
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

  const handleApprove = async () => {
    try {
      setLoading(true);
      const response = await PatchApprove(job_id);
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
        navigate("/skk/exploration/pppexploration");
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
      console.error("Error approving job", error);
    } finally {
      setLoading(false);
      approveModal.onClose();
    }
  };

  const handleReturn = async () => {
    try {
      setLoading(true);
      const response = await PatchReturn(job_id);
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
        navigate("/skk/exploration/pppexploration");
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

  const isValidatePage = location.pathname.includes("/validate");

  return (
    <Flex w="84vw" fontFamily={"Mulish"} direction="column">
      {loading ? (
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
  );
};

export default ViewExploration;
