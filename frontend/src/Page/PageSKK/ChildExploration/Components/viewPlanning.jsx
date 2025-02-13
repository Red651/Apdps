import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Flex,
  Box,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  Grid,
  GridItem,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Skeleton,
  Image
} from "@chakra-ui/react";
import Plot from "react-plotly.js";
import { GetViewPlanning, GetImageWellCasing } from "../../../API/APISKK";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import CustomMap from "./MapComponents";

const DetailModal = ({ isOpen, onClose, selectedId }) => {
  const [planningData, setPlanningData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [wellCasing, setWellCasing] = useState(null); // State untuk gambar well casing

  useEffect(() => {
    const fetchData = async () => {
      if (selectedId) {
        const data = await GetViewPlanning(selectedId);
        setTimeout(() => {
          setPlanningData(data);
          setLoading(false);
        }, 2000);
      }
    };

    fetchData();
  }, [selectedId]);

  // Fetch gambar well casing saat path tersedia
  useEffect(() => {
    const fetchWellCasingImage = async () => {
      if (planningData?.data.technical?.well_casing?.path) {
        const blob = await GetImageWellCasing(planningData.data.technical.well_casing.path);
        if (blob) {
          const imageUrl = URL.createObjectURL(blob);
          setWellCasing(imageUrl);
        }
      }
    };

    fetchWellCasingImage();

    // Cleanup URL object to avoid memory leaks
    return () => {
      if (wellCasing) {
        URL.revokeObjectURL(wellCasing);
      }
    };
  }, [planningData?.data.technical?.well_casing?.path]);

  const keysOperational = [
    "Jenis Kontrak",
    "KKKS",
    "Lapangan",
    "Nama Rig",
    "Nomor AFE",
    "Planning Status",
    "RIG HP",
    "Tahun WP&B",
    "Tanggal Diajukan",
    "Tanggal Mulai",
    "Tanggal Selesai",
    "Tipe Pekerjaan",
    "Tipe Rig",
    "Total Budget",
    "Wilayah Kerja",
  ];

  const keysTechnical = [
    "Alias Well",
    "Azimuth",
    "Elevasi Derrick Floor",
    "Elevasi Ground",
    "Elevasi Kelly Bushing",
    "Elevasi Rotary Table",
    "Final MD",
    "Hidrokarbon Target",
    "Kick Off Point",
    "Latitude Bottom Hole",
    "Latitude Permukaan",
    "Longitude Bottom Hole",
    "Longitude Permukaan",
    "Maximum Inclination",
    "Maximum TVD",
    "Mean Sea Level",
    "Nama Seismic Line",
    "Nama Well",
    "Tanggal Komplesi",
    "Tanggal Selesai Drilling",
    "Tanggal Tajak",
    "Tipe Lingkungan",
    "Tipe Profil Well",
    "Tipe Well",
    "UWI",
  ];

  const jobOperationColumns = [
    { headerName: "Event", field: "Event", cellStyle: { textAlign: "left" } },
    { headerName: "Days", field: "Days", cellStyle: { textAlign: "left" } },
    {
      headerName: "Start Depth",
      field: "StartDepth",
      cellStyle: { textAlign: "left" },
    },
    {
      headerName: "End Depth",
      field: "EndDepth",
      cellStyle: { textAlign: "left" },
    },
    { headerName: "Cost", field: "Cost", cellStyle: { textAlign: "left" } },
  ];

  const workBreakDownStructureColumns = [
    { headerName: "Task", field: "Task", cellStyle: { textAlign: "left" } },
    { headerName: "Start", field: "Start", cellStyle: { textAlign: "left" } },
    { headerName: "Finish", field: "Finish", cellStyle: { textAlign: "left" } },
    { headerName: "Type", field: "Type", cellStyle: { textAlign: "left" } },
  ];

  function transformData(data) {
    if (!data) return [];
    return Object.keys(data.Event).map((key) => ({
      Event: data.Event[key],
      Days: data.Days[key],
      StartDepth: data["Start Depth"][key],
      EndDepth: data["End Depth"][key],
      Cost: data.Cost[key],
    }));
  }

  const jobOperationData = transformData(
    planningData?.data.operational?.job_operation_days?.table
  );

  const workBreakDownStructureData =
    planningData?.data.operational?.work_breakdown_structure?.table;

  
  
  
  const coordinates = [
    {
      lat: planningData?.data?.technical["Latitude Permukaan"],
      lng: planningData?.data?.technical["Longitude Permukaan"],
      // label: 'Jakarta'
    },
  ];
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="6xl"
      fontFamily={"Mulish"}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex justifyContent={"space-between"} alignItems="center" fontFamily={"Mulish"}>
            <Box>
              <Text fontSize="2xl" fontWeight="bold">
                {planningData?.data.technical?.["Nama Well"] || "No Data"}
              </Text>
              <Text color="gray.500" textTransform="uppercase">
                {planningData?.data.operational?.["Tipe Pekerjaan"] || "No Data"}
              </Text>
            </Box>
            <Badge
              px={4}
              py={2}
              borderRadius={"lg"}
              colorScheme={
                planningData?.data.operational["Planning Status"] === "APPROVED"
                  ? "green"
                  : planningData?.data.operational["Planning Status"] === "PROPOSED"
                  ? "blue"
                  : "red"
              }
              
              fontSize="lg"
            >
              {planningData?.data.operational["Planning Status"]}
            </Badge>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto" maxHeight="70vh" fontFamily={"Mulish"}>
          {loading ? (
            <Skeleton height="400px" width="100%" borderRadius="md" />
          ) : (
            <Flex direction="column" gap={4} fontFamily={"Mulish"}>
              <Box bg="gray.200" height="300px" borderRadius="md">
                <CustomMap coordinates={coordinates} /> {/* Include Custom Map */}
              </Box>

              <Tabs variant="enclosed">
                <TabList>
                  <Tab>Operational</Tab>
                  <Tab>Technical</Tab>
                </TabList>
                  <TabPanels>
                    {/* ANCHOR OPERATIONAL */}
                  <TabPanel>
                    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                      <GridItem colSpan={1} bg="gray.50" p={4} borderRadius="md">
                        <Table variant="simple" size="sm" position={"sticky"} top={"5px"}>
                          <Thead>
                            <Tr>
                              <Th>KEY</Th>
                              <Th>VALUE</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {keysOperational.map((key, index) => (
                              <Tr key={index}>
                                <Td py={5}>{key}</Td>
                                <Td py={5}>
                                  {planningData?.data?.operational[key] || "No Data"}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </GridItem>
                      <GridItem colSpan={2}>
                        <Tabs variant="soft-rounded" colorScheme="teal">
                          <TabList>
                            <Tab>Job Operation Days</Tab>
                            <Tab>Work Breakdown Structure</Tab>
                          </TabList>
                            <TabPanels>
                               {/* ANCHOR JOB OPERATION DAYS */}
                            <TabPanel>
                              {planningData?.data?.operational?.job_operation_days?.plot?.data ? (
                                <Box width="100%" overflow="hidden">
                                  <Plot
                                    data={
                                      planningData.data.operational
                                        .job_operation_days.plot.data
                                    }
                                    layout={{
                                      ...planningData.data.operational
                                        .job_operation_days.plot.layout,
                                      autosize: true,
                                      responsive: true,
                                    }}
                                    useResizeHandler={true}
                                    style={{ width: "100%", height: "100%" }}
                                  />
                                </Box>
                              ) : (
                                <Text>No Job Operation Days Data Available</Text>
                              )}
                              <Box className="ag-theme-alpine custom-pagination" border="1px solid #e2e8f0" borderRadius="lg" p={4}>
                                <AgGridReact
                                  columnDefs={jobOperationColumns}
                                  rowData={jobOperationData}
                                  domLayout="autoHeight"
                                  pagination={true}
                                  paginationPageSize={10}
                                />
                              </Box>
                            </TabPanel>

                            {/* ANCHOR WORK BREAKDOWN STRUCTURE */}
                            <TabPanel>
                              {planningData.data.operational?.work_breakdown_structure?.plot?.data ? (
                                <Box width="100%" overflow="hidden">
                                  <Plot
                                    data={
                                      planningData.data.operational
                                        .work_breakdown_structure.plot.data
                                    }
                                    layout={{
                                      ...planningData.data.operational
                                        .work_breakdown_structure.plot.layout,
                                      autosize: true,
                                      responsive: true,
                                    }}
                                  />
                                </Box>
                              ) : (
                                <Text>No Work Breakdown Structure Data Available</Text>
                              )}
                              <Box className="ag-theme-alpine custom-pagination" border="1px solid #e2e8f0" borderRadius="lg" p={4} height={"500px"} width={"100%"}>
                                <AgGridReact
                                  columnDefs={workBreakDownStructureColumns.map((col) => ({
                                    ...col,
                                    sortable: true,
                                    filter: true,
                                    cellStyle: { textAlign: "left" },
                                  }))}
                                  rowData={workBreakDownStructureData}
                                  domLayout="normal"
                                  suppressHorizontalScroll={true}
                                  pagination={true}
                                  paginationPageSize={20}
                                />
                              </Box>
                            </TabPanel>
                          </TabPanels>
                        </Tabs>
                      </GridItem>
                    </Grid>
                  </TabPanel>

                  {/* ANCHOR TECHNICAL */}
                  <TabPanel>
                    <Grid templateColumns="repeat(3, 1fr)" gap={6}>
                      <GridItem colSpan={1} bg="gray.50" p={4} borderRadius="md">
                        <Table variant="simple" size="sm" position={"sticky"} top={"5px"}>
                          <Thead>
                            <Tr>
                              <Th>KEY</Th>
                              <Th>VALUE</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {keysTechnical.map((key, index) => (
                              <Tr key={index}>
                                <Td py={5}>{key}</Td>
                                <Td py={5}>
                                  {planningData.data.technical[key] || "No Data"}
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </GridItem>

                      <GridItem colSpan={2}>
                        <Tabs variant="soft-rounded" colorScheme="teal">
                          <TabList>
                            <Tab>Well Casing</Tab>
                            <Tab>Well Trajectory</Tab>
                          </TabList>
                            <TabPanels>
                              {/* ANCHOR WELL CASHING */}
                            <TabPanel>
                              {wellCasing ? (
                                <Box>
                                  <Image src={wellCasing} alt="Well Casing" />
                                </Box>
                              ) : (
                                <Text>No Well Casing Image Available</Text>
                              )}
                            </TabPanel>
                              {/* ANCHOR WELL TRAJECTORY */}
                            <TabPanel>
                              {planningData.data.technical?.well_trajectory?.plot ? (
                                <Box>
                                  <Plot
                                    data={
                                      planningData.data.technical?.well_trajectory.plot.data
                                    }
                                    layout={
                                      planningData.data.technical?.well_trajectory.plot.layout
                                    }
                                  />
                                </Box>
                              ) : (
                                <Text>No Work Breakdown Structure Data Available</Text>
                              )}
                            </TabPanel>
                          </TabPanels>
                        </Tabs>
                      </GridItem>
                    </Grid>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Flex>
          )}
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

export default DetailModal;
