import { useEffect, useState } from "react";
import {
  Flex,
  Text,
  Button,
  Icon,
  IconButton,
  Tooltip,
  Skeleton,
} from "@chakra-ui/react";
import PerhitunganCard from "../Components/Card/CardPerhitunganBox";
import { FaCopy, FaCheck, FaStopwatch } from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";
import Footer from "../Components/Card/Footer";
import { getJobPhase, getProgressSKK } from "../../API/APISKK";
import BreadCrumbCard from "../../Components/Card/Breadcrumb";

import {
  IconInfoCircle,
  IconEye,
  IconEyeFilled,
  IconChecklist,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import PaginatedTable from "../../Components/Card/PaginationTable";

const PPPExp = () => {
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
        const data = await getProgressSKK("exploration", "ppp");
        setProgressData(data.data);
      } catch (error) {}
    };

    getData();
    getProgress();
  }, []);

  const disetujui = phaseData ? phaseData.disetujui : null;
  const diajukan = phaseData ? phaseData.diajukan : null;
  const diproses = phaseData ? phaseData.diproses : null;
  const selesai = phaseData ? phaseData.selesai_beroperasi : null;

  return (
    <Flex gap={6} direction={"column"}>
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        PPP Exploration
      </Text>
      <BreadCrumbCard />
      <Flex gap={6}>
        <PerhitunganCard
          number={disetujui}
          icon={FaCopy}
          label={"disetujui"}
          subLabel="Pekerjaan disetujui"
        />
        <PerhitunganCard
          number={diajukan}
          icon={FaStopwatch}
          bgIcon="yellow.100"
          iconColor="yellow.500"
          label={"diajukan"}
          subLabel="Pekerjaan Diajukan P3"
        />
        <PerhitunganCard
          number={diproses}
          icon={FaCheck}
          bgIcon="green.100"
          iconColor="green.500"
          label={"diproses"}
          subLabel="Pekerjaan Diproses"
        />
        <PerhitunganCard
          number={selesai}
          label={"selesai"}
          bgIcon="red.100"
          iconColor="red.500"
          icon={MdOutlineVerified}
          subLabel="Pekerjaan Selesai"
        />
      </Flex>
      <PaginatedTable
        jobs={progressData || []}
        loading={loading}
        title={"Realisasi Kegiatan PPP"}
        excludeColumns={["job_id"]}
        actionHeaderWidth={160}
        actionButtons={(jobs) => (
          <Flex gap={2}>
            {jobs.STATUS === "APPROVED" ? (
              <Button
                colorScheme="blue"
                size="sm"
                as={Link}
                to={`/skk/exploration/ppp/view/${jobs.job_id}`}
                leftIcon={<Icon as={IconEye} />}
                rounded="full"
                aria-label="View"
              >
                View
              </Button>
            ) : jobs.STATUS === "PROPOSED" ? (
              <Button
                colorScheme="green"
                size="sm"
                as={Link}
                to={`/skk/exploration/ppp/validate/${jobs.job_id}`}
                leftIcon={<Icon as={IconChecklist} />}
                rounded="full"
                aria-label="Validate"
              >
                Validate
              </Button>
            ) : jobs.STATUS === "OPERATION FINISHED" ? (
              <Button
                colorScheme="blue"
                size="sm"
                as={Link}
                to={`/skk/exploration/operating/view/${jobs.job_id}`}
                leftIcon={<Icon as={IconEye} />}
                rounded="full"
                aria-label="View"
              >
                View
              </Button>
            ) : jobs.STATUS === "RETURNED" ? (
              <Button
                colorScheme="blue"
                size="sm"
                as={Link}
                to={`/skk/exploration/ppp/view/${jobs.job_id}`}
                leftIcon={<Icon as={IconEye} />}
                rounded="full"
                aria-label="View"
              >
                View
              </Button>
            ) : null}
          </Flex>
        )}
      />

      <Footer />
    </Flex>
  );
};

export default PPPExp;
