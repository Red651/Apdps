import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Flex,
  Icon,
  Text,
  Spinner,
  Image,
  Tooltip,
  IconButton,
} from "@chakra-ui/react";
import {
  IconCalendarClock,
  IconSettings2,
  IconFlagCheck,
  IconEye,
  IconChecklist,
} from "@tabler/icons-react";
import "leaflet/dist/leaflet.css";
import {
  getSelfInfo,
  getGeoMap,
  getJobTypeSummary,
  getKKKSJobs,
  getLogoKKKS,
} from "./../../../API/APISKK";
import PerhitunganCard from "./CardPerhitunganBox";
import { RiArrowRightUpLine } from "react-icons/ri";
import ReusableMap from "./ReusableMap";
import PaginatedTable from "../../../Components/Card/PaginationTable";
import { Link } from "react-router-dom";

const ModalDetailK3S = ({ isOpen, onClose, kkks_id }) => {
  const [selfData, setSelfData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingGeoMap, setLoadingGeoMap] = useState(true);
  const [geoMap, setGeoMap] = useState(null);
  const [jobTypeSummary, setJobTypeSummary] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [jobType, setJobType] = useState("exploration");
  const [logoKKKS, setLogoKKKS] = useState(null);

  useEffect(() => {
    if (kkks_id) {
      const fetchData = async () => {
        setLoading(true);
        setTimeout(async () => {
          try {
            const fetchedJobTypeSummary = await getJobTypeSummary(
              kkks_id,
              jobType
            );
            setJobTypeSummary(fetchedJobTypeSummary.data);

            const fetchedSelfData = await getSelfInfo(kkks_id);
            setSelfData(fetchedSelfData);

            const fetchedLogoKKKS = await getLogoKKKS(kkks_id);
            const imageUrl = URL.createObjectURL(fetchedLogoKKKS);
            setLogoKKKS(imageUrl);
          } catch (error) {
          } finally {
            setLoading(false);
          }
        }, 100);
      };

      fetchData();
    }
  }, [kkks_id, jobType]);

  useEffect(() => {
    if (kkks_id) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const fetchedJobs = await getKKKSJobs(kkks_id, jobType);
          setJobs(fetchedJobs.data);
        } catch (error) {
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [kkks_id, jobType]);

  useEffect(() => {
    if (kkks_id) {
      const fetchData = async () => {
        setLoadingGeoMap(true);
        try {
          const fetchedGeoMap = await getGeoMap(kkks_id);
          setGeoMap(fetchedGeoMap.data);
        } catch (error) {
        } finally {
          setLoadingGeoMap(false);
        }
      };
      fetchData();
    }
  }, [kkks_id]);

  const geoKKKS = geoMap?.geojson || {
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

  const centerGeoKKKS =
    geoMap?.center && geoMap.center.x != null && geoMap.center.y != null
      ? [geoMap.center.y, geoMap.center.x]
      : [0, 0];

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(feature.properties.name);
    }
  };

  const handleTabChange = (index) => {
    const jobTypes = ["exploration", "development", "workover", "wellservice"];
    setJobType(jobTypes[index]);
  };

  function getActionButtons(job, job_phase) {
    job_phase = job_phase.toLowerCase();
    if (!job) return null;
  
    switch (job.STATUS) {
      case "PLAN APPROVED":
        return (
          <Tooltip label="View">
            <Button
              leftIcon={<Icon as={IconEye} />}
              colorScheme="blue"
              size="sm"
              as={Link}
              to={`${job_phase}/planning/view/${job.id}`}
              rounded="full"
              aria-label="View"
            >
              View
            </Button>
          </Tooltip>
        );
      case "OPERATION FINISHED":
      case "OPERATION OPERATING":
        return (
          <Tooltip label="Validate">
            <Button
              leftIcon={<Icon as={IconEye} />}
              colorScheme="blue"
              size="sm"
              as={Link}
              to={`${job_phase}/operating/view/${job.id}`}
              rounded="full"
              aria-label="Validate"
            >
              View
            </Button>
          </Tooltip>
        );
      case "P3 RETURNED":
      case "P3 PROPOSED":
      case "P3 APPROVED":
        return (
          <Tooltip label="View">
            <Button
              leftIcon={<Icon as={IconEye} />}
              colorScheme="blue"
              size="sm"
              as={Link}
              to={`${job_phase}/ppp/view/${job.id}`}
              rounded="full"
              aria-label="View"
            >
              View
            </Button>
          </Tooltip>
        );
      default:
        return (
          <Tooltip label="View">
            <Button
              leftIcon={<Icon as={IconEye} />}
              colorScheme="blue"
              size="sm"
              as={Link}
              // to={`/skk/workover/planning/view/${job.job_id}`}
              rounded="full"
              aria-label="View"
              isDisabled
            >
              View
            </Button>
          </Tooltip>
        );
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      scrollBehavior="inside"
      fontFamily={"Mulish"}
    >
      <ModalOverlay />
      <ModalContent maxHeight="80vh" fontFamily={"Mulish"}>
        <ModalHeader>
          <Flex>
            <Image
              src={logoKKKS}
              alt="Logo KKKS"
              boxSize="70px"
              rounded={"lg"}
              shadow={"lg"}
            />
            <Flex direction={"column"} mx={4} justifyContent="center">
              <Text>{selfData?.name || "Loading..."}</Text>
              <Text fontSize={"md"}>
                <span style={{ fontWeight: 400 }}>Wilayah Kerja:</span>{" "}
                {selfData?.area?.name || "Loading..."}
              </Text>
            </Flex>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" px={4}>
          <Flex direction={"column"} gap={6}>
            {loadingGeoMap ? (
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                height="400px"
              >
                <Spinner size="xl" />
              </Box>
            ) : (
              <ReusableMap
                height={250}
                width={"100%"}
                geo={geoKKKS}
                center={centerGeoKKKS}
                zoom={7}
                onEachFeature={onEachFeature}
              />
            )}
            <Tabs onChange={handleTabChange} isLazy>
              <TabList>
                <Tab>Exploration</Tab>
                <Tab>Development</Tab>
                <Tab>Workover</Tab>
                <Tab>Well Service</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <Flex direction={"column"} gap={6}>
                    <Flex gap={6}>
                      <PerhitunganCard
                        number={jobTypeSummary?.EXPLORATION.rencana || 0}
                        icon={IconCalendarClock}
                        label="Rencana"
                        subLabel="WP&B Year 2024"
                      />
                      <PerhitunganCard
                        number={jobTypeSummary?.EXPLORATION.realisasi || 0}
                        icon={IconSettings2}
                        bgIcon="green.100"
                        iconColor="green.500"
                        label="Realisasi"
                      />
                      <PerhitunganCard
                        number={jobTypeSummary?.EXPLORATION.change || 0}
                        label="change"
                        bgIcon="red.100"
                        iconColor="red.500"
                        icon={IconFlagCheck}
                        subLabel="Year to Date"
                        percentage={
                          <Flex>
                            <Icon
                              boxSize={5}
                              color="green.500"
                              as={RiArrowRightUpLine}
                            />
                            <Text
                              fontSize="sm"
                              color="green.500"
                              fontFamily={"Mulish"}
                            >
                              {0}%
                            </Text>
                          </Flex>
                        }
                      />
                    </Flex>
                    <PaginatedTable
                      jobs={jobs || []}
                      title={"Pekerjaan Exploration"}
                      loading={loading}
                      excludeColumns={["id", "KKKS"]}
                      ShowActionButton={true}
                      actionButtons={(job) => (
                        <Flex gap={2}>
                          {getActionButtons(job, "ExPloRation")}
                        </Flex>
                      )}
                    />
                  </Flex>
                </TabPanel>

                <TabPanel>
                  <Flex gap={6}>
                    <PerhitunganCard
                      number={jobTypeSummary?.DEVELOPMENT.rencana || 0}
                      icon={IconCalendarClock}
                      label="Rencana"
                      subLabel="WP&B Year 2024"
                    />
                    <PerhitunganCard
                      number={jobTypeSummary?.DEVELOPMENT.realisasi || 0}
                      icon={IconSettings2}
                      bgIcon="green.100"
                      iconColor="green.500"
                      label="Realisasi"
                    />
                    <PerhitunganCard
                      number={jobTypeSummary?.DEVELOPMENT.change || 0}
                      label="Selesai"
                      bgIcon="red.100"
                      iconColor="red.500"
                      icon={IconFlagCheck}
                      subLabel="Year to Date"
                      percentage={
                        <Flex>
                          <Icon
                            boxSize={5}
                            color="green.500"
                            as={RiArrowRightUpLine}
                          />
                          <Text
                            fontSize="sm"
                            color="green.500"
                            fontFamily={"Mulish"}
                          >
                            {0}%
                          </Text>
                        </Flex>
                      }
                    />
                  </Flex>
                  <PaginatedTable
                    jobs={jobs || []}
                    title={"Pekerjaan Development"}
                    loading={loading}
                    excludeColumns={["id", "KKKS"]}
                    ShowActionButton={true}
                    actionButtons={(job) => (
                      <Flex gap={2}>
                        {getActionButtons(job, "development")}
                      </Flex>
                    )}
                  />
                </TabPanel>

                <TabPanel>
                  <Flex gap={6}>
                    <PerhitunganCard
                      number={jobTypeSummary?.WORKOVER.rencana || 0}
                      icon={IconCalendarClock}
                      label="Rencana"
                      subLabel="WP&B Year 2024"
                    />
                    <PerhitunganCard
                      number={jobTypeSummary?.WORKOVER.realisasi || 0}
                      icon={IconSettings2}
                      bgIcon="green.100"
                      iconColor="green.500"
                      label="Realisasi"
                    />
                    <PerhitunganCard
                      number={jobTypeSummary?.WORKOVER.change || 0}
                      label="Selesai"
                      bgIcon="red.100"
                      iconColor="red.500"
                      icon={IconFlagCheck}
                      subLabel="Year to Date"
                      percentage={
                        <Flex>
                          <Icon
                            boxSize={5}
                            color="green.500"
                            as={RiArrowRightUpLine}
                          />
                          <Text
                            fontSize="sm"
                            color="green.500"
                            fontFamily={"Mulish"}
                          >
                            {0}%
                          </Text>
                        </Flex>
                      }
                    />
                  </Flex>
                  <PaginatedTable
                    jobs={jobs || []}
                    title={"Pekerjaan Workover"}
                    loading={loading}
                    excludeColumns={["id", "KKKS"]}
                    ShowActionButton={true}
                    actionButtons={(job) => (
                      <Flex gap={2}>
                        {getActionButtons(job, "workover")}
                      </Flex>
                    )}
                  />
                </TabPanel>

                <TabPanel>
                  <Flex gap={6}>
                    <PerhitunganCard
                      number={jobTypeSummary?.WELLSERVICE.rencana || 0}
                      icon={IconCalendarClock}
                      label="Rencana"
                      subLabel="WP&B Year 2024"
                    />
                    <PerhitunganCard
                      number={jobTypeSummary?.WELLSERVICE.realisasi || 0}
                      icon={IconSettings2}
                      bgIcon="green.100"
                      iconColor="green.500"
                      label="Realisasi"
                    />
                    <PerhitunganCard
                      number={jobTypeSummary?.WELLSERVICE.change || 0}
                      label="Selesai"
                      bgIcon="red.100"
                      iconColor="red.500"
                      icon={IconFlagCheck}
                      subLabel="Year to Date"
                      percentage={
                        <Flex>
                          <Icon
                            boxSize={5}
                            color="green.500"
                            as={RiArrowRightUpLine}
                          />
                          <Text
                            fontSize="sm"
                            color="green.500"
                            fontFamily={"Mulish"}
                          >
                            {0}%
                          </Text>
                        </Flex>
                      }
                    />
                  </Flex>
                  <PaginatedTable
                    jobs={jobs || []}
                    title={"Pekerjaan Well Service"}
                    loading={loading}
                    excludeColumns={["id", "KKKS"]}
                    ShowActionButton={true}
                    actionButtons={(job) => (
                      <Flex gap={2}>
                        {getActionButtons(job, "wellservice")}
                      </Flex>
                    )}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalDetailK3S;
