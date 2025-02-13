import { useEffect, useState } from "react";
import { Flex, Text, Button, Tooltip, Icon, Skeleton } from "@chakra-ui/react";
import PerhitunganCard from "../Components/Card/CardPerhitunganBox";
import { FaCopy, FaCheck, FaStopwatch } from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";
import Footer from "../Components/Card/Footer";
import { getJobPhase, getProgressSKK } from "../../API/APISKK";
import { IconEye } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import PaginatedTable from "../../Components/Card/PaginationTable";
import BreadcrumbCard from "../../Components/Card/Breadcrumb";

const OperationWS = () => {
  const [phaseData, setPhaseData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const data = await getJobPhase("wellservice", "operation");
        setPhaseData(data.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    const getProgress = async () => {
      try {
        const data = await getProgressSKK("wellservice", "operation");
        setProgressData(data.data);
      } catch (error) {
        console.error(error);
      }
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
        Operation Well Service
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
        jobs={progressData || []}
        title={"Realisasi Kegiatan Operation"}
        excludeColumns={["job_id"]}
        loading={loading}
        actionButtons={(jobs) => (
          <Flex>
            {jobs.STATUS === "PLAN APPROVED" ? (
              <Tooltip label="View">
                <Button
                  colorScheme="blue"
                  size="sm"
                  as={Link}
                  to={`/skk/wellservice/planning/view/${jobs.job_id}`}
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
                  to={`/skk/wellservice/operating/view/${jobs.job_id}`}
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
                  to={`/skk/wellservice/operating/view/${jobs.job_id}`}
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
                  to={`/skk/wellservice/operating/view/${jobs.job_id}`}
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
                  to={`/skk/wellservice/operating/view/${jobs.job_id}`}
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

export default OperationWS;
