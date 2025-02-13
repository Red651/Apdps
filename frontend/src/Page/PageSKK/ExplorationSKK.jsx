import { useEffect, useState } from "react";
import HeaderCard from "./Components/Card/HeaderCard";
import BarChartComponent from "./Components/Card/3DBarchart";
import PieChart3D from "./Components/Card/3DPieChart";
import Footer from "./Components/Card/Footer";
import PerhitunganCard from "./Components/Card/CardPerhitunganBox";
import { RiArrowRightUpLine } from "react-icons/ri";
import {
  Flex,
  Text,
  Icon,
  Box,
  IconButton,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  TabPanels,
  Button,
  Skeleton,
  Tooltip,
} from "@chakra-ui/react";
import {
  getJobDasboard,
  getProgressKKKSfromSKK,
  getProgressKKKSWBS,
  getProgressKKKSIssues,
  getPlotProgressKKKSIssues,
} from "../API/APISKK";
import {
  IconCalendar,
  IconChartBar,
  IconChecks,
  IconTruck,
  IconInfoCircle,
  IconBriefcase,
  IconEye,
  IconExclamationCircle,
} from "@tabler/icons-react";
import PaginatedTable from "../Components/Card/PaginationTable";
import { Link } from "react-router-dom";
import ModalDetailK3S from "./Components/Card/ModalDetailK3S";
import Plot from "react-plotly.js";
import BreadcrumbCard from "../Components/Card/Breadcrumb";

const Exploration = () => {
  const [dataSummarySKK, setSummarySKK] = useState(null);
  const [dataRigTypePieChart, setDataRigTypePieChart] = useState(null);
  const [dataBudgetSummaryChart, setDataBudgetSummaryChart] = useState(null);
  const [dataJobWellStatusChart, setDataJobWellStatusChart] = useState(null);
  const [dataCharts, setDataCharts] = useState(null);
  const [loadingTable, setLoadingTable] = useState(true);
  const [progressKKKSfromSKK, setProgressKKKSfromSKK] = useState(null);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [selectedKkksId, setSelectedKkksId] = useState(null);
  const [tableWRM, setTableWRM] = useState(null);

  const [loadingWRM, setLoadingWRM] = useState(true);
  const [tableIssues, setTableIssues] = useState(null);
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [plotIssues, setPlotIssues] = useState(null);

  const fetchAndCacheData = async (key, fetchFunction, ...args) => {
    const cachedData = localStorage.getItem(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    const data = await fetchFunction(...args);
    localStorage.setItem(key, JSON.stringify(data));
    return data;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchAndCacheData(
          "explorationData",
          getJobDasboard,
          "exploration"
        );
        setSummarySKK(data.summary);
        setDataCharts(data.job_graph.month);
        setDataBudgetSummaryChart(data.cost_graph);
        setDataRigTypePieChart(data.environment_type_graph);
        setDataJobWellStatusChart(data.status_akhir_graph);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchProgressKKKS = async () => {
      setLoadingTable(true);
      try {
        const data = await getProgressKKKSfromSKK("exploration");
        setProgressKKKSfromSKK(data.data);
      } catch (error) {
        console.error("Error fetching KKKS progress data:", error);
      } finally {
        setLoadingTable(false);
      }
    };

    fetchProgressKKKS();
  }, []);

  useEffect(() => {
    const fetchWBSData = async () => {
      setLoadingWRM(true);
      try {
        const data = await getProgressKKKSWBS("exploration");
        setTableWRM(data.data);
      } catch (error) {
        console.error("Error fetching WBS data:", error);
      } finally {
        setLoadingWRM(false);
      }
    };

    fetchWBSData();
  }, []);

  useEffect(() => {
    const fetchIssuesData = async () => {
      setLoadingIssues(true);
      try {
        const data = await getProgressKKKSIssues("exploration");
        setTableIssues(data.data);
      } catch (error) {
        console.error("Error fetching issues data:", error);
      } finally {
        setLoadingIssues(false);
      }
    };

    fetchIssuesData();
  }, []);

  useEffect(() => {
    const fetchPlotIssues = async () => {
      if (!plotIssues) {
        try {
          const data = await fetchAndCacheData(
            "plotIssuesData",
            getPlotProgressKKKSIssues,
            "exploration"
          );
          setPlotIssues(data?.data);
        } catch (error) {
          console.error("Error fetching plot issues data:", error);
        }
      }
    };

    fetchPlotIssues();
  }, [plotIssues]);

  const handleKKKSInfoClick = (item) => {
    setSelectedKkksId(item);
    setIsModalOpen2(true);
  };

  const actionButtons = (job) => (
    <Button
      colorScheme="blue"
      size="sm"
      as={Link}
      to={`/skk/view/planning/${job.job_id}`}
      rounded="full"
    >
      View
    </Button>
  );

  return (
    <Flex gap={6} direction={"column"}>
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        Exploration
      </Text>
      <BreadcrumbCard />
      <Flex gap={6}>
        <PerhitunganCard
          number={
            dataSummarySKK?.rencana || <Skeleton height="20px" width="100px" />
          }
          label="Rencana"
          subLabel="WP&B Year 2024"
        />
        <PerhitunganCard
          number={
            dataSummarySKK?.realisasi || (
              <Skeleton height="20px" width="100px" />
            )
          }
          bgIcon="green.100"
          iconColor="green.500"
          label="Realisasi"
          subLabel="Year to Date"
          // percentage={
          //   <Flex>
          //     <Icon boxSize={5} color="green.500" as={RiArrowRightUpLine} />
          //     <Text fontSize="sm" color="green.500" fontFamily={"Mulish"}>
          //       3.46%
          //     </Text>
          //   </Flex>
          // }
        />
        <PerhitunganCard
          number={
            dataSummarySKK?.selesai || <Skeleton height="20px" width="100px" />
          }
          label="Selesai"
          bgIcon="red.100"
          iconColor="red.500"
          subLabel="Year to Date"
          // percentage={
          //   <Flex>
          //     <Icon boxSize={5} color="green.500" as={RiArrowRightUpLine} />
          //     <Text fontSize="sm" color="green.500" fontFamily={"Mulish"}>
          //       1%
          //     </Text>
          //   </Flex>
          // }
        />
      </Flex>

      <HeaderCard
        icon={IconChartBar}
        title="Realisasi Kegiatan Eksplorasi"
        subtitle="Realisasi pekerjaan tiap bulan"
      >
        <Box width="100%" height="100%">
          {dataCharts ? (
            <BarChartComponent
              datas={dataCharts.data}
              layouts={{
                ...dataCharts.layout,
                autosize: true,
                width: undefined,
                height: 400,
                responsive: true,
              }}
              style={{ width: "100%", height: "100%" }}
              useResizeHandler={true}
            />
          ) : (
            <Skeleton height="400px" width="100%" />
          )}
        </Box>
      </HeaderCard>

      <Flex flexDirection={"row"} width={"100%"} gap={4}>
        <HeaderCard
          icon={IconChartBar}
          title="Plan vs Actual Cost"
          subtitle="Perbandingan Perencanaan dan Realisasi"
        >
          <Box width="100%" height="100%">
            {dataBudgetSummaryChart ? (
              <PieChart3D
                data={dataBudgetSummaryChart.data}
                layout={{
                  ...dataBudgetSummaryChart.layout,
                  autosize: true,
                  width: undefined,
                  height: 400,
                  responsive: true,
                }}
                style={{ width: "100%", height: "100%" }}
                useResizeHandler={true}
              />
            ) : (
              <Skeleton height="400px" width="100%" />
            )}
          </Box>
        </HeaderCard>
        <HeaderCard
          icon={IconChecks}
          title="Status Akhir"
          subtitle="Status akhir sumur"
        >
          <Box width="100%" height="100%">
            {dataJobWellStatusChart ? (
              <PieChart3D
                data={dataJobWellStatusChart.data}
                layout={{
                  ...dataJobWellStatusChart.layout,
                  autosize: true,
                  width: undefined,
                  height: 400,
                  responsive: true,
                }}
                style={{ width: "100%", height: "100%" }}
                useResizeHandler={true}
              />
            ) : (
              <Skeleton height="400px" width="100%" />
            )}
          </Box>
        </HeaderCard>
        <HeaderCard
          icon={IconTruck}
          title="Total Rig"
          subtitle="Total rig yang beroperasi"
        >
          <Box width="100%" height="100%">
            {dataRigTypePieChart ? (
              <PieChart3D
                data={dataRigTypePieChart.data}
                layout={{
                  ...dataRigTypePieChart.layout,
                  autosize: true,
                  width: undefined,
                  height: 400,
                  responsive: true,
                }}
                style={{ width: "100%", height: "100%" }}
                useResizeHandler={true}
              />
            ) : (
              <Skeleton height="400px" width="100%" />
            )}
          </Box>
        </HeaderCard>
      </Flex>

      <Tabs>
        <TabList>
          <Tab>Progress</Tab>
          <Tab>Well Readiness Monitoring</Tab>
          <Tab>Issues</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            {loadingTable ? (
              <Skeleton height="400px" width="100%" />
            ) : (
              <PaginatedTable
                jobs={progressKKKSfromSKK || []}
                title={"Realisasi Kegiatan Exploration"}
                subtitle={"Realisasi pekerjaan tiap KKKS"}
                loading={loadingTable}
                excludeColumns={["id"]}
                colorColumns={["percentage"]}
                excludeColorColumns={["rencana", "realisasi"]}
                actionButtons={(jobs) => (
                  <Tooltip label="Detail">
                    <IconButton
                      icon={<IconInfoCircle />}
                      size="sm"
                      onClick={() => handleKKKSInfoClick(jobs.id)}
                      rounded="full"
                      aria-label="Detail"
                    />
                  </Tooltip>
                )}
              />
            )}
          </TabPanel>
          <TabPanel>
            <Box maxWidth="100%" overflowX="auto">
              {loadingWRM ? (
                <Skeleton height="400px" width="100%" />
              ) : (
                <PaginatedTable
                  jobs={tableWRM || []}
                  title="Well Readiness Monitoring"
                  subtitle={"Well Readiness Monitoring"}
                  icon={IconBriefcase}
                  loading={loadingWRM}
                  excludeColumns={["job_id"]}
                  disableInfoColumn={true}
                  enableRowNumbers={true}
                  rowWidth={180}
                  colorColumns={[
                    "PEMBEBASAN LAHAN",
                    "IPPKH",
                    "UKL UPL",
                    "AMDAL",
                    "PENGADAAN RIG",
                    "PENGADAAN DRILLING SERVICES",
                    "PENGADAAN LLI",
                    "PERSIAPAN LOKASI",
                    "INTERNAL KKKS",
                    "EVALUASI SUBSURFACE",
                  ]}
                  ShowActionButton={false}
                />
              )}
            </Box>
          </TabPanel>

          <TabPanel>
            <Flex direction={"column"} gap={6}>
              <HeaderCard
                icon={IconExclamationCircle}
                title="Issue Severity"
                subtitle="Issue Severity"
              >
                <Flex
                  height="100%"
                  alignItems={"center"}
                  justifyContent={"center"}
                  margin={"auto"}
                >
                  {plotIssues ? (
                    <Plot
                      data={plotIssues?.data || []}
                      layout={plotIssues?.layout || {}}
                      style={{ width: "100%", height: "400px" }}
                      config={{ displayModeBar: false }}
                    />
                  ) : (
                    <Skeleton height="400px" width="100%" />
                  )}
                </Flex>
              </HeaderCard>
              {loadingIssues ? (
                <Skeleton height="400px" width="100%" />
              ) : (
                <PaginatedTable
                  jobs={tableIssues || []}
                  title="Realisasi Kegiatan Exploration"
                  icon={IconBriefcase}
                  loading={loadingIssues}
                  excludeColumns={["job_id"]}
                  disableInfoColumn={false}
                  infoColumnFloatRight={true}
                  actionHeader={null}
                  enableRowNumbers={true}
                />
              )}
            </Flex>
          </TabPanel>
        </TabPanels>
      </Tabs>

      <ModalDetailK3S
        isOpen={isModalOpen2}
        onClose={() => setIsModalOpen2(false)}
        kkks_id={selectedKkksId}
      />
      <Flex>
        <Footer />
      </Flex>
    </Flex>
  );
};

export default Exploration;
