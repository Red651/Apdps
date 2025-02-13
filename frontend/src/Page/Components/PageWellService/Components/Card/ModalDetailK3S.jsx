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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Icon,
  Text,
  layout,
} from "@chakra-ui/react";
import Plot from "react-plotly.js";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { getKKKSInfo } from "./../../../API/APISKK"; // Pastikan path impor ini sesuai
import PerhitunganCard from "./CardPerhitunganBox";
import { RiArrowRightUpLine } from "react-icons/ri";
import {
  IconCalendarClock,
  IconSettings2,
  IconFlagCheck,
} from "@tabler/icons-react";
import TableModalDetailK3S from "./TableModalDetailK3S";
import Footer from "./Footer";
const ModalDetailK3S = ({ isOpen, onClose, kkks_id }) => {
  const [data, setData] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  useEffect(() => {
    if (kkks_id) {
      const fetchData = async () => {
        const fetchedData = await getKKKSInfo(kkks_id);
        setData(fetchedData);
      };
      fetchData();
    }
  }, [kkks_id]);

  const chartData = {
    x: data?.chart_data?.Development || [],
    y: data?.chart_data?.values || [],
    type: "bar",
    marker: { color: "blue" },
  };

  const tableData = data?.table_data || [];

  const explorationChartMonthly = {
    data: [
      {
        name: data?.chart_data?.Exploration.data[0].name,
        x: data?.chart_data?.Exploration.data[0].x,
        y: data?.chart_data?.Exploration.data[0].y,
        type: data?.chart_data?.Exploration.data[0].type,
      },
      {
        name: data?.chart_data?.Exploration.data[1].name,
        x: data?.chart_data?.Exploration.data[1].x,
        y: data?.chart_data?.Exploration.data[1].y,
        type: data?.chart_data?.Exploration.data[1].type,

      }
    ],
    layout: {
      title: data?.chart_data?.Exploration?.layout.title,
      xaxis: data?.chart_data?.Exploration?.layout.xaxis1,
      yaxis: data?.chart_data?.Exploration?.layout.yaxis1,
    },
  };
  
  const explorationChartWeekly = {
    data: [
      {
        name: data?.chart_data?.Exploration.data[2].name,
        x: data?.chart_data?.Exploration.data[2].x,
        y: data?.chart_data?.Exploration.data[2].y,
        type: data?.chart_data?.Exploration.data[2].type,
      },
      {
        name: data?.chart_data?.Exploration.data[3].name,
        x: data?.chart_data?.Exploration.data[3].x,
        y: data?.chart_data?.Exploration.data[3].y,
        type: data?.chart_data?.Exploration.data[3].type,

      }
    ],
    layout: {
      title: data?.chart_data?.Exploration?.layout.title,
      xaxis: data?.chart_data?.Exploration?.layout.xaxis2,
      yaxis: data?.chart_data?.Exploration?.layout.yaxis2,
    },
  };

  const developmentChartMonthly = {
    data: [
      {
        name: data?.chart_data?.Development.data[0].name,
        x: data?.chart_data?.Development.data[0].x,
        y: data?.chart_data?.Development.data[0].y,
        type: data?.chart_data?.Development.data[0].type,
      },
      {
        name: data?.chart_data?.Development.data[1].name,
        x: data?.chart_data?.Development.data[1].x,
        y: data?.chart_data?.Development.data[1].y,
        type: data?.chart_data?.Development.data[1].type,

      }
    ],
    layout: {
      title: data?.chart_data?.Development?.layout.title,
      xaxis: data?.chart_data?.Development?.layout.xaxis1,
      yaxis: data?.chart_data?.Development?.layout.yaxis1,
    },
  };

  const developmentChartWeekly = {
    data: [
      {
        name: data?.chart_data?.Development.data[2].name,
        x: data?.chart_data?.Development.data[2].x,
        y: data?.chart_data?.Development.data[2].y,
        type: data?.chart_data?.Development.data[2].type,
      },
      {
        name: data?.chart_data?.Development.data[3].name,
        x: data?.chart_data?.Development.data[3].x,
        y: data?.chart_data?.Development.data[3].y,
        type: data?.chart_data?.Development.data[3].type,

      }
    ],
    layout: {
      title: data?.chart_data?.Development?.layout.title,
      xaxis: data?.chart_data?.Development?.layout.xaxis2,
      yaxis: data?.chart_data?.Development?.layout.yaxis2,
    },
  };

  const workOverChartMonthly = {
    data: [
      {
        name: data?.chart_data?.Workover.data[0].name,
        x: data?.chart_data?.Workover.data[0].x,
        y: data?.chart_data?.Workover.data[0].y,
        type: data?.chart_data?.Workover.data[0].type,
      },
      {
        name: data?.chart_data?.Workover.data[1].name,
        x: data?.chart_data?.Workover.data[1].x,
        y: data?.chart_data?.Workover.data[1].y,
        type: data?.chart_data?.Workover.data[1].type,

      }
    ],
    layout: {
      title: data?.chart_data?.Workover?.layout.title,
      xaxis: data?.chart_data?.Workover?.layout.xaxis1,
      yaxis: data?.chart_data?.Workover?.layout.yaxis1,
    },
  };

  const workOverChartWeekly = {
    data: [
      {
        name: data?.chart_data?.Workover.data[2].name,
        x: data?.chart_data?.Workover.data[2].x,
        y: data?.chart_data?.Workover.data[2].y,
        type: data?.chart_data?.Workover.data[2].type,
      },
      {
        name: data?.chart_data?.Workover.data[3].name,
        x: data?.chart_data?.Workover.data[3].x,
        y: data?.chart_data?.Workover.data[3].y,
        type: data?.chart_data?.Workover.data[3].type,

      }
    ],
    layout: {
      title: data?.chart_data?.Workover?.layout.title,
      xaxis: data?.chart_data?.Workover?.layout.xaxis2,
      yaxis: data?.chart_data?.Workover?.layout.yaxis2,
    },
  };

  const wellServiceChartMonthly = {
    data: [
      {
        name: data?.chart_data?.['Well Service']?.data[0].name,
        x: data?.chart_data?.['Well Service']?.data[0].x,
        y: data?.chart_data?.['Well Service']?.data[0].y,
        type: data?.chart_data?.['Well Service']?.data[0].type,
      },
      {
        name: data?.chart_data?.['Well Service']?.data[1].name,
        x: data?.chart_data?.['Well Service']?.data[1].x,
        y: data?.chart_data?.['Well Service']?.data[1].y,
        type: data?.chart_data?.['Well Service']?.data[1].type,

      }
    ],
    layout: {
      title: data?.chart_data?.["Well Service"]?.layout.title,
      xaxis: data?.chart_data?.["Well Service"]?.layout.xaxis1,
      yaxis: data?.chart_data?.["Well Service"]?.layout.yaxis1,
    }, // Layout untuk bulanan
  };

  const wellServiceChartWeekly = {
    data: [
      {
        name: data?.chart_data?.['Well Service']?.data[2].name,
        x: data?.chart_data?.['Well Service']?.data[2].x,
        y: data?.chart_data?.['Well Service']?.data[2].y,
        type: data?.chart_data?.['Well Service']?.data[2].type,
      },
      {
        name: data?.chart_data?.['Well Service']?.data[3].name,
        x: data?.chart_data?.['Well Service']?.data[3].x,
        y: data?.chart_data?.['Well Service']?.data[3].y,
        type: data?.chart_data?.['Well Service']?.data[3].type,

      }
    ],
    layout: {
      title: data?.chart_data?.["Well Service"]?.layout.title,
      xaxis: data?.chart_data?.["Well Service"]?.layout.xaxis2,
      yaxis: data?.chart_data?.["Well Service"]?.layout.yaxis2,
    },
  };

  const tableDataExploration = data?.well_job_data?.exploration || [];
  const tableDataDevelopment = data?.well_job_data?.development || [];
  const tableDataWorkover = data?.well_job_data?.workover || [];
  const tableDataWellService = data?.well_job_data?.well_service || [];

  const columns = [
    { header: "No.", accessor: "index" },
    { header: "Nama Sumur", accessor: "nama_sumur" },
    { header: "Wilayah Kerja", accessor: "wilayah_kerja" },
    { header: "Lapangan", accessor: "lapangan" },
    { header: "Tanggal Mulai", accessor: "tanggal_mulai" },
    { header: "Tanggal Selesai", accessor: "tanggal_selesai" },
    { header: "Tanggal Realisasi", accessor: "tanggal_realisasi" },
    { header: "Status", accessor: "status" },
  ];

  const cardData = 
    {
      active_operations : data?.job_data.active_operations,

      approved_plans : data?.job_data.approved_plans,

    finished_jobs: data?.job_data.finished_jobs,
      
    percentage: data?.job_data.percentage,
    }
  

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent maxHeight="80vh">
        <ModalHeader>
          {data?.nama_kkks || "Loading..."} - Wilayah Kerja
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" px={4}>
          <Box mb={4}>
            <MapContainer
              center={[0.0, 100.0]}
              zoom={5}
              style={{ height: "300px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker position={[0.0, 100.0]}>
                <Popup>Wilayah Kerja</Popup>
              </Marker>
            </MapContainer>
          </Box>
          <Flex gap={6}>
            <PerhitunganCard
              number={cardData.approved_plans || 0}
              icon={IconCalendarClock}
              label="Rencana"
              subLabel="WP&B Year 2024"
            />
            <PerhitunganCard
              number={cardData.active_operations || 0}
              icon={IconSettings2}
              bgIcon="green.100"
              iconColor="green.500"
              label="Realisasi"
            />
            <PerhitunganCard
              number={cardData.finished_jobs || 0}
              label="Selesai"
              bgIcon="red.100"
              iconColor="red.500"
              icon={IconFlagCheck}
              subLabel="Year to Date"
              percentage={
                <Flex>
                  <Icon boxSize={5} color="green.500" as={RiArrowRightUpLine} />
                  <Text
                    fontSize="sm"
                    color="green.500"
                    fontFamily={"Mulish"}
                  >
                    {cardData.percentage || 0}%
                  </Text>
                </Flex>
              }
            />
          </Flex>
          <Tabs
            index={tabIndex}
            onChange={(index) => setTabIndex(index)}
            isLazy
          >
            <TabList>
              <Tab>Exploration</Tab>
              <Tab>Development</Tab>
              <Tab>Workover</Tab>
              <Tab>Well Service</Tab>
            </TabList>
            <TabPanels>
              {/* Exploration */}
              <TabPanel>
                <Flex gap={4} direction="row" width="100%">
                  <Plot
                    width="100%"
                    data={explorationChartMonthly.data}
                    layout={explorationChartMonthly.layout}
                  />

                  <Plot
                    width="100%"
                    data={explorationChartWeekly.data}
                    layout={explorationChartWeekly.layout}
                  />
                </Flex>
                <Box overflowX="auto">
                  <TableModalDetailK3S
                    columns={columns}
                    data={tableDataExploration}
                    onView={handleView}
                  />
                </Box>
              </TabPanel>

              {/* Development */}
              <TabPanel>
                <Flex gap={4} direction="row" width="100%">
                  <Plot
                    width="100%"
                    data={developmentChartMonthly.data}
                    layout={developmentChartMonthly.layout}
                  />
                  <Plot
                    width="100%"
                    data={developmentChartWeekly.data}
                    layout={developmentChartWeekly.layout}
                  />
                </Flex>
                <Box overflowX="auto">
                  <TableModalDetailK3S
                    columns={columns}
                    data={tableDataDevelopment}
                    onView={handleView}
                  />
                </Box>
              </TabPanel>

              {/* Workover */}
              <TabPanel>
                <Flex gap={4} direction="row" width="100%">
                  <Plot
                    width="100%"
                    data={workOverChartMonthly.data}
                    layout={workOverChartMonthly.layout}
                  />
                  <Plot
                    width="100%"
                    data={workOverChartWeekly.data}
                    layout={workOverChartWeekly.layout}
                  />
                </Flex>
                <Box overflowX="auto">
                  <TableModalDetailK3S
                    columns={columns}
                    data={tableDataWorkover}
                    onView={handleView}
                  />
                </Box>
              </TabPanel>

              {/* Well Service */}
              <TabPanel>
                <Flex gap={4} direction="row" width="100%">
                  <Plot
                    width="100%"
                    data={wellServiceChartMonthly.data}
                    layout={wellServiceChartMonthly.layout}
                  />
                  <Plot
                    width="100%"
                    data={wellServiceChartWeekly.data}
                    layout={wellServiceChartWeekly.layout}
                  />
                </Flex>
                <Box overflowX="auto">
                  <TableModalDetailK3S
                    columns={columns}
                    data={tableDataWellService}
                    onView={handleView}
                  />
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
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
