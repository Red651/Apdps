import React, { useState, useEffect, useCallback } from "react";
import GeoMap from "./Components/GeoMap";
import HeaderCard from "./Components/Card/HeaderCard";
import BarChartComponent from "./Components/Card/3DBarchart";
import PerhitunganCard from "./Components/Card/CardPerhitunganBox";
import Footer from "./Components/Card/Footer";
import PaginatedTable from "../Components/Card/PaginationTable";
import {
  getUserInfo,
  getLogoKKKS,
  getDashboardProgressSummary,
  getGeoJSONKKKS,
  getCountDashboardSummary,
  getKKKSJobs,
} from "../API/APIKKKS";
import {
  Flex,
  Image,
  Box,
  Text,
  Grid,
  GridItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Spinner,
  Button,
  Icon,
} from "@chakra-ui/react";
import {
  IconRubberStamp,
  IconInfoCircle,
  IconCheck,
  IconEye,
  IconClipboard,
  IconChecks,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import ModalRealisasi from "./Components/Card/ModalRealisasi";

const HomeDashKKKS = () => {
  const kkks_id = JSON.parse(localStorage.getItem("user")).kkks_id;
  const [userInfo, setUserInfo] = useState({});
  const [logoKKKS, setLogoKKKS] = useState(null);
  const [progressSummary, setProgressSummary] = useState(null);
  const [geoJSONKKKS, setGeoJSONKKKS] = useState(null);
  const [loading, setLoading] = useState(true);
  const [geoLoading, setGeoLoading] = useState(true);
  const [countDashboardSummary, setCountDashboardSummary] = useState({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [perPageOptions] = useState([5, 10, 25, 50]);
  const [totalData, setTotalData] = useState(0);
  const [tableData, setTableData] = useState({});
  const [jobType, setJobType] = useState("exploration");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const fetchInitialData = useCallback(async () => {
    setLoading(true);
    setGeoLoading(true);
    try {
      const [
        responseUserInfo,
        responseLogoKKKS,
        responseProgressSummary,
        responseGeoJSONKKKS,
      ] = await Promise.all([
        getUserInfo(),
        getLogoKKKS(kkks_id),
        getDashboardProgressSummary(),
        getGeoJSONKKKS(kkks_id),
      ]);

      setUserInfo(responseUserInfo);
      setProgressSummary(responseProgressSummary?.data);
      setGeoJSONKKKS(responseGeoJSONKKKS?.data);
      setLogoKKKS(URL.createObjectURL(responseLogoKKKS));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setGeoLoading(false);
    }
  }, [kkks_id]);

  const fetchJobTypeData = useCallback(async () => {
    try {
      const [responseCountDashboardSummary, responseKKKSJobs] = await Promise.all([
        getCountDashboardSummary(kkks_id, jobType),
        getKKKSJobs(kkks_id, jobType, page, perPage),
      ]);

      setCountDashboardSummary(prevState => ({
        ...prevState,
        [jobType]: responseCountDashboardSummary?.data
      }));
      setTableData(prevState => ({
        ...prevState,
        [jobType]: responseKKKSJobs?.data
      }));
      setTotalData(responseKKKSJobs?.data.total || 0);
    } catch (error) {
      console.error(error);
    }
  }, [kkks_id, jobType, page, perPage]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    fetchJobTypeData();
  }, [fetchJobTypeData]);

  const handleTabChange = (index) => {
    const jobTypes = ["exploration", "development", "workover", "wellservice"];
    setJobType(jobTypes[index]);
    setPage(1);
  };

  const handleNextPage = () => {
    if (page < Math.ceil(totalData / perPage)) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handlePerPageChange = (event) => {
    setPerPage(Number(event.target.value));
    setPage(1);
  };

  const handleInfoClick = (activity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const namaKKKS = userInfo.kkks ? userInfo.kkks.name : "Tidak ada nama KKKS";
  const areaKKKS = userInfo.kkks ? userInfo.kkks.area.name : "Tidak ada Area KKKS";

  const geoKKKS = geoJSONKKKS?.geojson || {
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
    geoJSONKKKS?.center &&
    geoJSONKKKS.center.x != null &&
    geoJSONKKKS.center.y != null
      ? [geoJSONKKKS.center.y, geoJSONKKKS.center.x]
      : [0, 0];

  const plotData = progressSummary?.plot ? progressSummary?.plot?.data : null;
  const plotLayout = progressSummary?.plot ? progressSummary?.plot.layout : null;
  const tableDatas = progressSummary?.table ? progressSummary?.table : null;

  const onEachFeature = (feature, layer) => {
    if (feature.properties && feature.properties.name) {
      layer.bindPopup(feature.properties.name);
    }
  };

  const date = new Date();
  const dateFormate = date.toDateString();

  const renderTabPanel = (type) => (
    <TabPanel>
      <Flex gap={6} direction="column">
        <Flex gap={6}>
          <PerhitunganCard
            number={countDashboardSummary[type]?.[type.toUpperCase()]?.rencana || 0}
            icon={IconClipboard}
            bgIcon="blue.100"
            iconColor="blue.500"
            label="rencana"
            subLabel="Pekerjaan rencana"
          />
          <PerhitunganCard
            number={countDashboardSummary[type]?.[type.toUpperCase()]?.change || 0}
            icon={IconCheck}
            bgIcon="green.100"
            iconColor="green.500"
            label="change"
            subLabel="Pekerjaan change"
          />
          <PerhitunganCard
            number={countDashboardSummary[type]?.[type.toUpperCase()]?.realisasi || 0}
            icon={IconChecks}
            bgIcon="red.100"
            iconColor="red.500"
            label="realisasi"
            subLabel="Pekerjaan realisasi"
          />
        </Flex>
        <PaginatedTable
          jobs={tableData[type] || []}
          page={page}
          perPage={perPage}
          perPageOptions={perPageOptions}
          loading={loading}
          totalData={totalData}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          onPerPageChange={handlePerPageChange}
          title={`Pekerjaan ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          icon={IconClipboard}
          ShowActionButton={true}
          excludeColumns="id"
          actionHeaderWidth={150}
          actionButtons={(jobs) => (
            <Flex>
              <Button
                rounded="full"
                leftIcon={<Icon as={IconEye} />}
                colorScheme="blue"
                size="sm"
                to={`${getButtonLink(jobs.STATUS)}/${jobs.id}`}
                as={Link}
                isDisabled={!getButtonLink(jobs.STATUS)}
              >
                View
              </Button>
            </Flex>
          )}
        />
      </Flex>
    </TabPanel>
  );

  const getButtonLink = (status) => {
    switch (status) {
      case "PLAN APPROVED":
        return "planning/view";
      case "OPERATION OPERATING":
      case "OPERATION FINISHED":
        return "operation/view";
      case "P3 PROPOSED":
        return "ppp/view";
      case "P3 APPROVED":
        return "ppp/view";
      case "P3 RETURNED":
        return "ppp/view";
      default:
        return null;
    }
  };

  return (
    <Flex direction="column" fontFamily="Mulish" py={6}>
      <Flex direction="column" gap={4}>
        <Flex direction="row" align="center" gap={4}>
          {/* <Image src={logoKKKS} alt="Logo KKKS" boxSize="90px" /> */}
          <Flex direction="column" gap={1}>
            <Text fontSize="2xl" fontWeight="bold">
              {namaKKKS}
            </Text>
            <Text>
              Wilayah Kerja: <span style={{ fontWeight: "bold" }}>{areaKKKS}</span>
            </Text>
          </Flex>
        </Flex>

        {geoLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" height="400px">
            <Spinner size="xl" />
          </Box>
        ) : (
          <GeoMap
            height={400}
            width="100%"
            geo={geoKKKS}
            center={centerGeoKKKS}
            zoom={9}
            onEachFeature={onEachFeature}
          />
        )}
      </Flex>

      <HeaderCard
        mt={6}
        title="Realisasi Kegiatan Pengeboran & KUPS"
        subtitle={dateFormate}
        icon={IconRubberStamp}
      >
        <Grid templateColumns="repeat(4, 1fr)" mt={4} gap={4}>
          <GridItem colSpan={2}>
            {tableDatas && (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>INFO</Th>
                    <Th>Jenis Kegiatan</Th>
                    {Object.keys(tableDatas[Object.keys(tableDatas)[0]]).map((key) => (
                      <Th key={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Th>
                    ))}
                  </Tr>
                </Thead>
                <Tbody>
                  {Object.entries(tableDatas).map(([key, value]) => (
                    <Tr key={key}>
                      <Td>
                        <IconButton
                          icon={<IconInfoCircle />}
                          onClick={() => handleInfoClick(key)}
                          variant="outline"
                          aria-label="More info"
                        />
                      </Td>
                      <Td>{key.charAt(0).toUpperCase() + key.slice(1)}</Td>
                      {Object.values(value).map((val, index) => (
                        <Td key={index}>{val}</Td>
                      ))}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </GridItem>
          <GridItem colSpan={2}>
            <BarChartComponent
              datas={plotData}
              layouts={plotLayout}
              style={{ width: "100%", height: "100" }}
              useResizeHandler={true}
            />
          </GridItem>
        </Grid>
      </HeaderCard>

      <Tabs variant="soft-rounded" mt={4} onChange={handleTabChange}>
        <TabList>
          <Tab>Exploration</Tab>
          <Tab>Development</Tab>
          <Tab>Work Over</Tab>
          <Tab>Well Service</Tab>
        </TabList>

        <TabPanels>
          {renderTabPanel("exploration")}
          {renderTabPanel("development")}
          {renderTabPanel("workover")}
          {renderTabPanel("wellservice")}
        </TabPanels>
      </Tabs>

      <Footer />

      <ModalRealisasi
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job_type={selectedActivity}
        title="Realisasi Kegiatan"
        date={dateFormate}
      />
    </Flex>
  );
};

export default HomeDashKKKS;