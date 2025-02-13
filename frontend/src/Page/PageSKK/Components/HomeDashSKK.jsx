import {
  Box,
  Flex,
  Grid,
  GridItem,
  IconButton,
  Td,
  Text,
  Tr,
  Button,
  Tooltip,
  Icon,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaArrowAltCircleUp, FaInfoCircle } from "react-icons/fa";
import HeaderCard from "./Card/HeaderCard";
import BarChartComponent from "./Card/3DBarchart";
import TableDashboard from "../../Components/Card/TableDashboard";
import { Link } from "react-router-dom";
import { getDataDashboardSKK, getProgressKKKS } from "../../API/APISKK";
import { IconRubberStamp } from "@tabler/icons-react";
import ModalRealisasi from "./Card/ModalRealisasi";
import ModalDetailK3S from "./Card/ModalDetailK3S";
import PaginatedTable from "../../Components/Card/PaginationTable";
import { IconInfoCircle } from "@tabler/icons-react";

const HomeDashSKK = () => {
  const [datas, setDatas] = useState([]);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [selectedKkksId, setSelectedKkksId] = useState(null);
  const [selectedJobType, setJobType] = useState(null);
  const [progressK3S, setProgressK3S] = useState([]);
  const [loading, setLoading] = useState();
  const username = JSON.parse(localStorage.getItem("user")).username;

  

  useEffect(() => {
    const getData = async () => {
      setLoading(true);
      try {
        const data = await getDataDashboardSKK();
        setDatas(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    getData();
  }, []);

  useEffect(() => {
    const getProgressData = async () => {
      setLoading(true);
      try {
        const data = await getProgressKKKS();
        

        setProgressK3S(data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    getProgressData();
  }, []);

  const dataPerubahan = (data) => {
    return (
      <>
        <Flex gap={1}>
          <FaArrowAltCircleUp color="green" size={20} />
          <Text fontSize={"18px"} color={"green"}>
            {data}
          </Text>
        </Flex>
      </>
    );
  };

  const headerTable1 = [
    "Info",
    "Pekerjaan",
    "Rencana WP&B",
    "Realisasi 2024",
    "Percentage",
  ];

  const data = () => {
    if (!datas) return [];
    return [
      {
        id: 1,
        pekerjaan: "Exploration",
        rencana: datas?.table?.exploration?.rencana ?? "N/A",
        realisasi: datas?.table?.exploration?.realisasi ?? "N/A",
        percentage: datas?.table?.exploration?.percentage ?? "N/A",
        change: datas?.table?.exploration?.change ?? "N/A",
      },
      {
        id: 2,
        pekerjaan: "Development",
        rencana: datas?.table?.development?.rencana ?? "N/A",
        realisasi: datas?.table?.development?.realisasi ?? "N/A",
        percentage: datas?.table?.development?.percentage ?? "N/A",
        change: datas?.table?.development?.change ?? "N/A",
      },
      {
        id: 3,
        pekerjaan: "Work Over",
        rencana: datas?.table?.workover?.rencana ?? "N/A",
        realisasi: datas?.table?.workover?.realisasi ?? "N/A",
        percentage: datas?.table?.workover?.percentage ?? "N/A",
        change: datas?.table?.workover?.change ?? "N/A",
      },
      {
        id: 4,
        pekerjaan: "Well Service",
        rencana: datas?.table?.wellservice?.rencana ?? "N/A",
        realisasi: datas?.table?.wellservice?.realisasi ?? "N/A",
        percentage: datas?.table?.wellservice?.percentage ?? "N/A",
        change: datas?.table?.wellservice?.change ?? "N/A",
      },
    ];
  };

  const date = new Date();
  const dateFormate = date.toDateString();

  const handleKKKSInfoClick = (item) => {
    setSelectedKkksId(item);
    setIsModalOpen2(true);
  };

  const handleJobInfoClick = (job_type) => {
    setJobType(job_type);
    setIsModalOpen1(true);
  };

  return (
    <Box gap={16}>
      <Flex
        flexDirection={"column"}
        gap={0}
        marginY={10}
        fontFamily={"Mulish"}
        color={"#333333"}
      >
        <Text fontSize={28} fontWeight={400} textTransform={"uppercase"}>
          Halo, {username}
        </Text>
        <Text fontSize={32} fontWeight={800}>
          Selamat Datang di ApDPS!
        </Text>
        <Text fontSize={16} fontWeight={400}>
          Lihat, kelola, dan optimalkan data Anda dengan mudah.
        </Text>
      </Flex>
      <HeaderCard
        title={"Realisasi Kegiatan Pengeboran & KUPS"}
        subtitle={dateFormate}
        icon={IconRubberStamp}
      >
        <Grid templateColumns="repeat(4, 1fr)" mt={4} gap={4}>
          <GridItem colSpan={2}>
            <TableDashboard headers={headerTable1}>
              {datas ? (
                data().map((item) => (
                  <Tr key={item.id} fontFamily={"Mulish"}>
                    <Td>
                      <IconButton
                        icon={<FaInfoCircle />}
                        onClick={() => handleJobInfoClick(item.pekerjaan)}
                      />
                    </Td>
                    <Td fontSize={"18px"} fontFamily={"Mulish"}>
                      {item.pekerjaan}
                    </Td>
                    <Td fontSize={"18px"} fontFamily={"Mulish"}>
                      {item.rencana}
                    </Td>
                    <Td fontFamily={"Mulish"}>
                      <Flex gap={4} fontSize={"18px"}>
                        {item.realisasi}
                        {item.change ? dataPerubahan(item.change) : null}
                      </Flex>
                    </Td>
                    <Td fontSize={"18px"} fontFamily={"Mulish"}>
                      {item.percentage} %
                    </Td>
                  </Tr>
                ))
              ) : (
                <p>Loading....</p>
              )}
            </TableDashboard>
            <ModalRealisasi
              isOpen={isModalOpen1}
              onClose={() => setIsModalOpen1(false)}
              job_type={selectedJobType}
              title={selectedJobType}
              date="22 MARET 2024"
            />
          </GridItem>
          <GridItem colSpan={2}>
            <BarChartComponent
              datas={datas?.plot?.data}
              layouts={{
                ...datas?.plot?.layout,
                autosize: true,
                width: undefined,
                responsive: true,
              }}
              style={{ width: "100%", height: "100" }}
              useResizeHandler={true}
            />
          </GridItem>
        </Grid>
      </HeaderCard>

      <Box mt={4}>
        <PaginatedTable
          jobs={progressK3S || []}
          title={"Realisasi Kegiatan Pengeboran & KUPS KKKS"}
          subtitle={"Realisasi pekerjaan tiap KKKS"}
          loading={loading}
          excludeColumns={["id"]}
          actionHeader="Aksi"
          actionButtons={(jobs) => (
            <Tooltip label="Info">
              <IconButton
                icon={<Icon as={IconInfoCircle} />}
                colorScheme="gray"
                size="sm"
                as={Link}
                onClick={() => handleKKKSInfoClick(jobs.id)}
                rounded="full"
                aria-label="Info"
              />
            </Tooltip>
          )}
        />
        <ModalDetailK3S
          isOpen={isModalOpen2}
          onClose={() => setIsModalOpen2(false)}
          kkks_id={selectedKkksId}
        />
      </Box>
    </Box>
  );
};

export default HomeDashSKK;
