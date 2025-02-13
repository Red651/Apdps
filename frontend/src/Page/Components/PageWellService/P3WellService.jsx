import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  useDisclosure,
  Icon,
  Tooltip,
  IconButton,
  Skeleton,
} from "@chakra-ui/react";
import {
  IconCheck,
  IconSettings2,
  IconChecks,
  IconClockHour10,
  IconSend,
  IconEye,
} from "@tabler/icons-react";
import PerhitunganCard from "../../PageKKKS/Components/Card/CardPerhitunganBox";
import Footer from "../../PageKKKS/Components/Card/Footer";
import PaginatedTable from "../../Components/Card/PaginationTable";
import { getTableKKKS, getCountDataSummary } from "../../API/APIKKKS";
import { Link } from "react-router-dom";
import BreadcrumbCard from "../Card/Breadcrumb";

const PPPWorkOverKKKS = () => {
  const [tableData, setTableData] = useState(null);
  const [countDataSummary, setCountDataSummary] = useState(null);
  const { isOpen, onClose } = useDisclosure();
  const kkks_id = JSON.parse(localStorage.getItem("user")).kkks_id;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const fetchData = async () => {
        const data = await getTableKKKS(kkks_id, "wellservice", "ppp");
        setTableData(data.data);
      };

      const fetchCountData = async () => {
        const data = await getCountDataSummary(kkks_id, "wellservice", "ppp");
        setCountDataSummary(data.data);
      };

      fetchData();
      fetchCountData();
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [kkks_id]);

  return (
    <Flex gap={4} my={6} direction={"column"}>
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        PPP Well Service
      </Text>

      <BreadcrumbCard />

      <Flex gap={4}>
        <PerhitunganCard
          number={countDataSummary?.selesai_beroperasi}
          icon={IconCheck}
          bgIcon="green.100"
          iconColor="green.500"
          label={"selesai"}
          subLabel="Pekerjaan Selesai"
        />
        <PerhitunganCard
          number={countDataSummary?.diajukan}
          icon={IconClockHour10}
          label={"Diajukan p3"}
          subLabel="Pekerjaan Diajukan untuk P3"
          bgIcon="#FFE57F"
          iconColor="#B79200"
        />
        <PerhitunganCard
          number={countDataSummary?.diproses}
          icon={IconSettings2}
          label={"Diproses"}
          subLabel="Pekerjaan P3 di proses"
          bgIcon="#E1EFFE"
          iconColor="#3F83F8"
        />
        <PerhitunganCard
          number={countDataSummary?.disetujui}
          icon={IconChecks}
          bgIcon="#5856D6"
          iconColor="#EBF5FF"
          label={"P3 Disetujui"}
          subLabel="Pekerjaan P3 Disetujui"
        />
      </Flex>

      <Box>
        <PaginatedTable
          jobs={tableData || []}
          loading={loading}
          title={"Pekerjaan Disetujui dan Beroperasi"}
          subtitle={"Pekerjaan yang telah disetujui dan yang beroperasi"}
          excludeColumns={["job_id", "KKKS"]}
          actionButtons={(jobs) => (
            <Flex>
            {jobs.STATUS === "OPERATION FINISHED" ? (
              <Flex gap={2}>
                <Tooltip label="Propose">
                  <IconButton
                    colorScheme="green"
                    size="sm"
                    as={Link}
                    to={`form/${jobs.job_id}`}
                    icon={<Icon as={IconSend} />}
                    rounded="full"
                    aria-label="Propose"
                  />
                </Tooltip>
                <Tooltip label="View">
                  <IconButton
                    colorScheme="blue"
                    size="sm"
                    as={Link}
                    to={`/wellservice/operation/view/${jobs.job_id}/`}
                    icon={<Icon as={IconEye} />}
                    rounded="full"
                    aria-label="View"
                  />
                </Tooltip>
              </Flex>
            ) : jobs.STATUS === "PROPOSED" ? (
              <Button
                colorScheme="blue"
                size="sm"
                as={Link}
                to={`view/${jobs.job_id}/`}
                leftIcon={<Icon as={IconEye} />}
                aria-label="View"
                borderRadius={"full"}
              >
                View
              </Button>
            ) : jobs.STATUS === "APPROVED" ? (
              <Button
                colorScheme="blue"
                size="sm"
                as={Link}
                to={`view/${jobs.job_id}/`}
                leftIcon={<Icon as={IconEye} />}
                aria-label="View"
                borderRadius={"full"}
              >
                View
              </Button>
            ) : jobs.STATUS === "RETURNED" ? (
              <Button
                colorScheme="blue"
                size="sm"
                as={Link}
                to={`view/${jobs.job_id}/`}
                leftIcon={<Icon as={IconEye} />}
                aria-label="View"
                borderRadius={"full"}
              >
                View
              </Button>
            ) : null}
          </Flex>
          )}
        />
      </Box>

      <Footer />
    </Flex>
  );
};

export default PPPWorkOverKKKS;
