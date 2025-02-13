import { useEffect, useState } from "react";
import { Flex, Text, Icon, Tooltip, Button, Skeleton } from "@chakra-ui/react";
import PerhitunganCard from "../Components/Card/CardPerhitunganBox";
import { FaCopy, FaCheck, FaStopwatch } from "react-icons/fa";
import { MdOutlineVerified } from "react-icons/md";
import Footer from "../Components/Card/Footer";
import { getJobPhase, getProgressSKK } from "../../API/APISKK";

import { IconInfoCircle, IconEye, IconChecklist } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import PaginatedTable from "../../Components/Card/PaginationTable";
import BreadcrumbCard from "../../Components/Card/Breadcrumb";

const PlanningWorkOver = () => {
  const [phaseData, setPhaseData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      try {
        setLoading(true);
        const data = await getJobPhase("workover", "plan");
        setPhaseData(data.data);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    const getProgress = async () => {
      try {
        const data = await getProgressSKK("workover", "plan");
        setProgressData(data.data);
      } catch (error) {}
    };
    getData();
    getProgress();
  }, []);

  const proposedCount = phaseData ? phaseData.diajukan : null;
  const AprovedCount = phaseData ? phaseData.disetujui : null;
  const PendingCount = phaseData ? phaseData.diproses : null;
  const ReturnedCount = phaseData ? phaseData.dikembalikan : null;

  return (
    <Flex gap={6} direction={"column"}>
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        Planning Work Over
      </Text>
      <BreadcrumbCard />
      <Flex gap={6}>
        <PerhitunganCard
          number={
            proposedCount 
          }
          icon={FaCopy}
          label={"PROPOSED"}
          subLabel="Pekerjaan Diajukan"
        />
        <PerhitunganCard
          number={
            PendingCount 
          }
          icon={FaStopwatch}
          bgIcon="yellow.100"
          iconColor="yellow.500"
          label={"PROCESS"}
          subLabel="Pekerjaan Di Proses"
        />
        <PerhitunganCard
          number={
            AprovedCount 
          }
          icon={FaCheck}
          bgIcon="green.100"
          iconColor="green.500"
          label={"APPROVED"}
          subLabel="Pekerjaan Disetujui"
        />
        <PerhitunganCard
          number={
            ReturnedCount 
          }
          label={"RETURNED"}
          bgIcon="red.100"
          iconColor="red.500"
          icon={MdOutlineVerified}
          subLabel="Pekerjaan Dikembalikan"
        />
      </Flex>
      <PaginatedTable
        jobs={progressData || []}
        title={"Realisasi Kegiatan Planning"}
        excludeColumns={["job_id"]}
        loading={loading}
        actionButtons={(jobs) => (
          <Flex gap={2}>
          {jobs.STATUS === "APPROVED" ? (
            <Tooltip label="View">
              <Button
                leftIcon={<Icon as={IconEye} />}
                colorScheme="blue"
                size="sm"
                as={Link}
                to={`/skk/workover/planning/view/${jobs.job_id}`}
                rounded="full"
                aria-label="View"
              >
                View
              </Button>
            </Tooltip>
          ) : jobs.STATUS === "PROPOSED" ? (
            <Tooltip label="Validate">
              <IconButton
                icon={<Icon as={IconChecklist} />}
                colorScheme="green"
                size="sm"
                as={Link}
                to={`/skk/workover/planning/validate/${jobs.job_id}`}
                rounded="full"
                aria-label="Validate"
              />
            </Tooltip>
          ) : jobs.STATUS === "FINISHED" ? (
            <Tooltip label="View">
              <Button
                leftIcon={<Icon as={IconEye} />}
                colorScheme="blue"
                size="sm"
                as={Link}
                to={`/skk/workover/planning/view/${jobs.job_id}`}
                rounded="full"
                aria-label="View"
              >
                View
              </Button>
            </Tooltip>
          ) : jobs.STATUS === "RETURNED" ? (
            <Tooltip label="View">
              <Button
                leftIcon={<Icon as={IconEye} />}
                colorScheme="blue"
                size="sm"
                as={Link}
                to={`/skk/workover/planning/view/${jobs.job_id}`}
                rounded="full"
                aria-label="View"
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

export default PlanningWorkOver;
