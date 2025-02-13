import {
  Box,
  Flex,
  Grid,
  GridItem,
  Icon,
  IconButton,
  Td,
  Text,
  Tr,
  Th,
} from "@chakra-ui/react";
import React, { useEffect, useMemo } from "react";

import {
  FaArrowAltCircleUp,
  FaBriefcase,
  FaInfoCircle,
  FaRegClock,
} from "react-icons/fa";
import HeaderCard from "./Card/HeaderCard";
import ThreeDBarChartComponent from "./Card/3DBarchart";
import WellTable from "./Card/WellTable";
import TableDashboard from "./Card/TableDashboard";

import { BiBriefcase } from "react-icons/bi";
import ProgressTable from "./Card/Progressbar";
import {
  getDataDashboardSKK,
} from "../../API/APISKK";
import { IconRubberStamp } from "@tabler/icons-react";
import ModalRealisasi from "./Card/ModalRealisasi";
const HomeDashSKK = () => {
  const [datas, setDatas] = React.useState([]);
  const [dataCharts, setDataCharts] = React.useState([]);
  const [dataTable, setDataTable] = React.useState([]);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const chartsData = [
    {
      data: [
        {
          x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          y: [500, 750, 250, 450, 600, 850, 700, 350, 400, 950],
          type: "bar",
          marker: { color: "lightblue" },
        },
        {
          x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          y: [300, 800, 100, 500, 600, 900, 650, 250, 450, 1000],
          type: "bar",
          marker: { color: "darkgreen" },
        },
      ],
      layout: { title: "Chart 1", barmode: "group" },
    },
    {
      data: [
        {
          x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          y: [500, 750, 250, 450, 600, 850, 700, 350, 400, 950],
          type: "bar",
          marker: { color: "lightblue" },
        },
        {
          x: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
          y: [300, 800, 100, 500, 600, 900, 650, 250, 450, 1000],
          type: "bar",
          marker: { color: "darkgreen" },
        },
      ],
      layout: { title: "Chart 2", barmode: "group" },
    },
  ];
  useEffect(() => {
    const getData = async () => {
      const data = await getDataDashboardSKK();
      setDatas(data);
    };

    getData();
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
  const headerTable2 = [
    "Info",
    "KKKS",
    "Explorasi",
    "Exploitasi",
    "Work Over",
    "Well Service",
  ];

  const dataKks = React.useMemo(() => {
    if (!dataTable) return [];

    const formatToPersen = (value) => `${value}%`;

    return dataTable.map((item, index) => ({
      no: index + 1,
      id: item.id,
      kkks: item.nama_kkks,
      exploration: parseInt(item.exploration.percentage),
      development: parseInt(item.development.percentage),
      workover: parseInt(item.workover.percentage),
      wellservice: parseInt(item.wellservice.percentage),
    }));
  }, [dataTable]);

  const data = () => {
    if (!datas) return [];
    return [
      {
        id: 1,
        pekerjaan: "Exploration",
        rencana: datas.exploration?.plan ?? "N/A",
        realisasi: datas.exploration?.realization ?? "N/A",
        percentage: datas.exploration?.percentage ?? "N/A",
        change: datas.exploration?.change ?? "N/A",
      },
      {
        id: 2,
        pekerjaan: "Exploitation",
        rencana: datas.development?.plan ?? "N/A",
        realisasi: datas.development?.realization ?? "N/A",
        percentage: datas.development?.percentage ?? "N/A",
        change: datas.development?.change ?? "N/A",
      },
      {
        id: 3,
        pekerjaan: "Work Over",
        rencana: datas.workover?.plan ?? "N/A",
        realisasi: datas.workover?.realization ?? "N/A",
        percentage: datas.workover?.percentage ?? "N/A",
        change: datas.workover?.change ?? "N/A",
      },
      {
        id: 4,
        pekerjaan: "Well Service",
        rencana: datas.wellservice?.plan ?? "N/A",
        realisasi: datas.wellservice?.realization ?? "N/A",
        percentage: datas.wellservice?.percentage ?? "N/A",
        change: datas.wellservice?.change ?? "N/A",
      },
    ];
  };
  const date = new Date();
  const dateFormate = date.toDateString();
  const getColorByValue = (value) => {
    if (value < 30) return "#ffe7e7";
    if (value < 60) return "#FFE4BE";
    if (value < 80) return "#FFF5CB";
    return "#BEFFE7";
  };

  const getColorByValue2 = (value) => {
    if (value == "#ffe7e7") return "#CE0000";
    if (value == "#FFE4BE") return "#975700";
    if (value == "#FFF5CB") return "#7D6400";
    return "#005737";
  };

  const ColoredCell = ({ value }) => (
    <Td
      fontSize="18px"
      bg={getColorByValue(value)}
      color={getColorByValue2(getColorByValue(value))}
      fontWeight={600}
    >
      {value}%
    </Td>
  );
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
          Halo, {JSON.parse(localStorage.getItem("user")).username}
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
                        onClick={() => setIsModalOpen(true)}
                      />
                      <ModalRealisasi
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        link="https://your-link-here.com"
                        title="Exploration"
                        date="22 MARET 2024"
                        chartsData={chartsData}
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
                      {item.percentage}
                    </Td>
                  </Tr>
                ))
              ) : (
                <p>Loading....</p>
              )}
            </TableDashboard>
          </GridItem>
          <GridItem colSpan={2}>
            <ThreeDBarChartComponent
              datas={dataCharts ? dataCharts.data : []}
              layouts={dataCharts ? dataCharts.layout : []}
            />
          </GridItem>
        </Grid>
      </HeaderCard>

      <Box mt={4}>
        <HeaderCard
          icon={BiBriefcase}
          title={"Realisasi Kegiatan Pengeboran & KUPS"}
          subtitle={"Home"}
        >
          <TableDashboard headers={headerTable2}>
            {dataKks?.map((item, index) => {
              return (
                <Tr key={index}>
                  <Td fontSize="18px">
                    <IconButton colorScheme="blue" icon={<FaInfoCircle />} />
                  </Td>
                  <Td fontSize="18px" fontWeight={600}>
                    {item.kkks}
                  </Td>
                  <ColoredCell value={item.exploration} />
                  <ColoredCell value={item.development} />
                  <ColoredCell value={item.workover} />

                  <ColoredCell value={item.wellservice} />
                </Tr>
              );
            })}
          </TableDashboard>
        </HeaderCard>
      </Box>
    </Box>
  );
};

export default HomeDashSKK;
