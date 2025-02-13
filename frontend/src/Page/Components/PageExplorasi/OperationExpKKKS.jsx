import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  useDisclosure,
  Icon,
  useToast,
  Tooltip,
  IconButton,
  Skeleton,
} from "@chakra-ui/react";
import {
  IconCheck,
  IconSettings2,
  IconChecks,
  IconClockHour10,
  IconEdit,
  IconEye,
} from "@tabler/icons-react";
import PerhitunganCard from "../../PageKKKS/Components/Card/CardPerhitunganBox";
import Footer from "../../PageKKKS/Components/Card/Footer";
import PaginatedTable from "../../Components/Card/PaginationTable";
import { getTableKKKS, getCountDataSummary } from "../../API/APIKKKS";
import { patchStatusOperationToOperate } from "../../API/PostKkks";
import { Link } from "react-router-dom";
import ModalOperateMessage from "../Card/AlertDialogMessage";
import BreadcrumbCard from "../Card/Breadcrumb";

const OperationExpKKKS = () => {
  const toast = useToast();
  const [tableData, setTableData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [countDataSummary, setCountDataSummary] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const kkks_id = JSON.parse(localStorage.getItem("user")).kkks_id;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    try {
      const fetchData = async () => {
        const data = await getTableKKKS(kkks_id, "exploration", "operation");
        setTableData(data.data);
      };

      const fetchCountData = async () => {
        const data = await getCountDataSummary(
          kkks_id,
          "exploration",
          "operation"
        );
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

  const OperateJob = async () => {
    try {
      const response = await patchStatusOperationToOperate(selectedId);
      if (response.status === 200) {
        toast({
          title: response.data.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        window.location.reload();
        onClose();
        return response;
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleOperate = async () => {
    setLoading(true);
    try {
      const updatedData = await getTableKKKS(
        kkks_id,
        "exploration",
        "operation"
      );
      setTableData(updatedData.data);
      onClose();
    } catch (error) {
      console.error("Failed to update operation status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex gap={4} my={6} direction={"column"}>
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        Operasi Explorasi
      </Text>

      <BreadcrumbCard/>

      <Flex gap={4}>
        <PerhitunganCard
          number={countDataSummary?.disetujui}
          icon={IconCheck}
          bgIcon="green.100"
          iconColor="green.500"
          label={"DISETUJUI"}
          subLabel="Pekerjaan Disetujui"
        />
        <PerhitunganCard
          number={countDataSummary?.persiapan}
          icon={IconClockHour10}
          label={"Persiapan"}
          subLabel="Pekerjaan Persiapan"
          bgIcon="#FFE57F"
          iconColor="#B79200"
        />
        <PerhitunganCard
          number={countDataSummary?.beroperasi}
          icon={IconSettings2}
          label={"Beroperasi"}
          subLabel="Pekerjaan Diajukan"
          bgIcon="#E1EFFE"
          iconColor="#3F83F8"
        />
        <PerhitunganCard
          number={countDataSummary?.selesai_beroperasi}
          icon={IconChecks}
          bgIcon="#5856D6"
          iconColor="#EBF5FF"
          label={"SELESAI"}
          subLabel="Pekerjaan Dikembalikan"
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
              {jobs.STATUS === "OPERATING" ? (
                <Flex gap={2}>
                  <Tooltip label="Update">
                    <IconButton
                      as={Link}
                      icon={<Icon as={IconEdit} />}
                      colorScheme="yellow"
                      size="sm"
                      to={`update/${jobs.job_id}/`}
                      onClick={() => {
                        setSelectedId(jobs.job_id);
                      }}
                      state={{ type_job: "update-exploration" }}
                      rounded="full"
                      aria-label="Update"
                    />
                  </Tooltip>
                  <Tooltip label="View">
                    <IconButton
                      colorScheme="blue"
                      size="sm"
                      as={Link}
                      to={`view/${jobs.job_id}/`}
                      icon={<Icon as={IconEye} />}
                      rounded="full"
                      aria-label="View"
                    />
                  </Tooltip>
                </Flex>
              ) : jobs.STATUS === "PLAN APPROVED" ? (
                <Flex gap={2}>
                  <Tooltip label="WRM">
                    <IconButton
                      colorScheme="orange"
                      size="sm"
                      icon={<Icon as={IconEdit} />}
                      as={Link}
                      to={`wrm/${jobs.job_id}`}
                      rounded="full"
                      aria-label="WRM"
                    />
                  </Tooltip>
                  <Tooltip label="View">
                    <IconButton
                      colorScheme="blue"
                      size="sm"
                      as={Link}
                      to={`exploration/planning/view/${jobs.job_id}/`}
                      icon={<Icon as={IconEye} />}
                      rounded="full"
                      aria-label="View"
                    />
                  </Tooltip>
                </Flex>
                ) : (
                  <Flex gap={2}>
                  <Button
                    as={Link}
                    to={`view/${jobs.job_id}/`}
                    colorScheme="blue"
                    size="sm"
                    borderRadius={"full"}
                    leftIcon={<Icon as={IconEye} />}
                  >
                    View
                  </Button>
                </Flex>
              )}
            </Flex>
          )}
        />
      </Box>

      <ModalOperateMessage
        isOpen={isOpen}
        onClose={onClose}
        job_id={selectedId}
      />

      <Footer />
    </Flex>
  );
};

export default OperationExpKKKS;
