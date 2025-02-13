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

import {
  IconInfoCircle,
  IconEye,
  IconEyeFilled,
  IconChecklist,
} from "@tabler/icons-react";
import { Link } from "react-router-dom";
import PaginatedTable from "../../Components/Card/PaginationTable";
import BreadcrumbCard from "../../Components/Card/Breadcrumb";

const OperationDev = () => {
  const [phaseData, setPhaseData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const data = await getJobPhase("development", "operation");
        setPhaseData(data.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    const getProgress = async () => {
      try {
        const data = await getProgressSKK("development", "operation");
        setProgressData(data.data);
        setTableData(data.data);
      } catch (error) {}
    };
    getData();
    getProgress();
  }, []);

  const disetujui = phaseData ? phaseData.disetujui : null;
  const persiapan = phaseData ? phaseData.persiapan : null;
  const beroperasi = phaseData ? phaseData.beroperasi : null;
  const selesai = phaseData ? phaseData.selesai_beroperasi : null;

  return (
    <Flex gap={6} direction={"column"}>
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        Operation Development
      </Text>
      <BreadcrumbCard />
      <Flex gap={6}>
        <PerhitunganCard
          number={
            disetujui
          }
          icon={FaCopy}
          label={"disetujui"}
          subLabel="Pekerjaan disetujui"
        />
        <PerhitunganCard
          number={
            persiapan
          }
          icon={FaStopwatch}
          bgIcon="yellow.100"
          iconColor="yellow.500"
          label={"persiapan"}
          subLabel="Pekerjaan Di persiapan"
        />
        <PerhitunganCard
          number={
            beroperasi
          }
          icon={FaCheck}
          bgIcon="green.100"
          iconColor="green.500"
          label={"beroperasi"}
          subLabel="Pekerjaan Beroperasi"
        />
        <PerhitunganCard
          number={
            selesai
          }
          label={"selesai"}
          bgIcon="red.100"
          iconColor="red.500"
          icon={MdOutlineVerified}
          subLabel="Pekerjaan Selesai"
        />
      </Flex>
      <PaginatedTable
        jobs={tableData || []}
        loading={loading}
        title={"Realisasi Kegiatan Operation"}
        excludeColumns={["job_id"]}
        actionButtons={(jobs) => (
          <Flex>
            {jobs.STATUS === "PLAN APPROVED" ? (
              <Tooltip label="View">
                <Button
                  colorScheme="blue"
                  size="sm"
                  as={Link}
                  to={`/skk/development/planning/view/${jobs.job_id}`}
                  borderRadius="full"
                  leftIcon={<Icon as={IconEye} />}
                >
                  View
                </Button>
              </Tooltip>
            ) : jobs.STATUS === "PROPOSED" ? (
              <Tooltip label="View">
                <Button
                  colorScheme="blue"
                  size="sm"
                  as={Link}
                  to={`/skk/development/operating/view/${jobs.job_id}`}
                  borderRadius="full"
                  leftIcon={<Icon as={IconEye} />}
                >
                  View
                </Button>
              </Tooltip>
            ) : jobs.STATUS === "FINISHED" ? (
              <Tooltip label="View">
                <Button
                  colorScheme="blue"
                  size="sm"
                  as={Link}
                  to={`/skk/development/operating/view/${jobs.job_id}`}
                  borderRadius="full"
                  leftIcon={<Icon as={IconEye} />}
                >
                  View
                </Button>
              </Tooltip>
            ) : jobs.STATUS === "RETURNED" ? (
              <Tooltip label="View">
                <Button
                  colorScheme="blue"
                  size="sm"
                  as={Link}
                  to={`/skk/development/operating/view/${jobs.job_id}`}
                  borderRadius="full"
                  leftIcon={<Icon as={IconEye} />}
                >
                  View
                </Button>
              </Tooltip>
            ) : jobs.STATUS === "OPERATING" ? (
              <Tooltip label="View">
                <Button
                  colorScheme="blue"
                  size="sm"
                  as={Link}
                  to={`/skk/development/operating/view/${jobs.job_id}`}
                  borderRadius="full"
                  leftIcon={<Icon as={IconEye} />}
                >
                  View
                </Button>
              </Tooltip>
            ) : null}
          </Flex>
        )}
      />
      <Footer />
    </Flex>
  );
};

export default OperationDev;
