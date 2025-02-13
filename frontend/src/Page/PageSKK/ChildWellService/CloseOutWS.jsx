import { useEffect, useState } from "react";
import {
  Flex,
  Text,
  Button,
  Tooltip,
  Icon,
  IconButton,
  Skeleton,
} from "@chakra-ui/react";
import PerhitunganCard from "../Components/Card/CardPerhitunganBox";
import { FaCopy, FaCheck, FaStopwatch } from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";
import Footer from "../Components/Card/Footer";
import { getJobPhase, getProgressSKK } from "../../API/APISKK";
import { IconInfoCircle, IconEye, IconEdit } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import PaginatedTable from "../../Components/Card/PaginationTable";
import BreadcrumbCard from "../../Components/Card/Breadcrumb";

const CloseOutWellService = () => {
  const [phaseData, setPhaseData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const data = await getJobPhase("exploration", "ppp");
        setPhaseData(data.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    const getProgress = async () => {
      try {
        const data = await getProgressSKK("wellservice", "co");
        setProgressData(data.data);
      } catch (error) {}
    };
    getData();
    getProgress();
  }, []);

  const selesai_beroperasi = phaseData ? phaseData.diajukan : null;
  const diajukan = phaseData ? phaseData.diajukan : null;
  const diproses = phaseData ? phaseData.diproses : null;
  const disetujui = phaseData ? phaseData.disetujui : null;

  return (
    <Flex gap={6} direction={"column"}>
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        Close Out Well Service
      </Text>
      <BreadcrumbCard />
      <Flex gap={6}>
        <PerhitunganCard
          number={
            selesai_beroperasi
          }
          icon={FaCopy}
          label={"Selesai P3"}
          subLabel="Pekerjaan Selesai P3"
        />
        <PerhitunganCard
          number={
            diajukan
          }
          icon={FaStopwatch}
          bgIcon="yellow.100"
          iconColor="yellow.500"
          label={"diajukan"}
          subLabel="Pekerjaan Di Ajukan"
        />
        <PerhitunganCard
          number={
            diproses
          }
          icon={FaCheck}
          bgIcon="green.100"
          iconColor="green.500"
          label={"diproses"}
          subLabel="Pekerjaan Diproses"
        />
        <PerhitunganCard
          number={
            disetujui
          }
          label={"disetujui"}
          bgIcon="red.100"
          iconColor="red.500"
          icon={MdOutlineVerified}
          subLabel="Pekerjaan Disetujui"
        />
      </Flex>
      <PaginatedTable
        jobs={progressData || []}
        title={"Realisasi Kegiatan Close Out"}
        excludeColumns={["job_id"]}
        actionHeader={null}
        loading={loading}
      />
      <Footer />
    </Flex>
  );
};

export default CloseOutWellService;
