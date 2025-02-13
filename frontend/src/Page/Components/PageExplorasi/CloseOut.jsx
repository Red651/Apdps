import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Flex,
  Text,
  Button,
  useDisclosure,
  Icon,
  useToast,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import {
  IconCheck,
  IconSettings2,
  IconChecks,
  IconClockHour10,
  IconEye,
  IconCoin,
  IconSend,
} from "@tabler/icons-react";
import PerhitunganCard from "../../PageKKKS/Components/Card/CardPerhitunganBox";
import Footer from "../../PageKKKS/Components/Card/Footer";
import PaginatedTable from "../../Components/Card/PaginationTable";
import { getTableKKKS, getCountDataSummary } from "../../API/APIKKKS";
import { patchStatusOperationToOperate } from "../../API/PostKkks";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Skeleton,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import BreadcrumbCard from "../Card/Breadcrumb";

const CloseOutExplorationKKKS = () => {
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
        const data = await getTableKKKS(kkks_id, "exploration", "co");
        setTableData(data.data);
      };

      const fetchCountData = async () => {
        const data = await getCountDataSummary(kkks_id, "exploration", "co");
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

  return (
    <Flex gap={4} my={6} direction={"column"}>
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        Close Out Exploration
      </Text>

      <BreadcrumbCard />

      <Flex gap={6}>
        <PerhitunganCard
          number={countDataSummary?.selesai_p3}
          icon={IconChecks}
          bgIcon="#5856D6"
          iconColor="#EBF5FF"
          label={"selesai p3"}
          subLabel="Pekerjaan Dikembalikan"
        />

        <PerhitunganCard
          number={countDataSummary?.diajukan}
          icon={IconSettings2}
          label={"diajukan"}
          subLabel="Pekerjaan Diajukan"
          bgIcon="#E1EFFE"
          iconColor="#3F83F8"
        />
        <PerhitunganCard
          number={countDataSummary?.diproses}
          icon={IconClockHour10}
          label={"diproses"}
          subLabel="Pekerjaan Persiapan"
          bgIcon="#FFE57F"
          iconColor="#B79200"
        />
        <PerhitunganCard
          number={countDataSummary?.disetujui}
          icon={IconCheck}
          bgIcon="green.100"
          iconColor="green.500"
          label={"disetujui"}
          subLabel="Pekerjaan Disetujui"
        />
      </Flex>

      <Box>
        <PaginatedTable
          jobs={tableData || []}
          loading={loading}
          title={"Pekerjaan Disetujui dan Beroperasi"}
          subtitle={"Pekerjaan yang telah disetujui dan yang beroperasi"}
          excludeColumns={["job_id", "KKKS"]}
          actionHeader={null}
          actionButtons={(jobs) => (
            <Flex>
              {jobs.STATUS === "PROPOSED" ? (
                <Flex gap={2}>
                  <Button
                    as={Link}
                    leftIcon={<Icon as={IconSend} />}
                    colorScheme="green"
                    size="sm"
                    to={`/exploration/closeout/form/${jobs.job_id}/`}
                  >
                    {jobs.STATUS}
                  </Button>
                  <Tooltip label="View">
                    <IconButton
                      colorScheme="blue"
                      size="sm"
                      as={Link}
                      to={`/view/ppp/${jobs.job_id}/`}
                      icon={<Icon as={IconEye} />}
                      rounded="full"
                      aria-label="View"
                    />
                  </Tooltip>
                </Flex>
              ) : jobs.STATUS === "APPROVED" ? (
                <Flex gap={2}>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    leftIcon={<Icon as={IconCheck} />}
                    onClick={() => {
                      setSelectedId(jobs.job_id);
                      onOpen();
                    }}
                    isDisabled
                  >
                    {jobs.STATUS}
                  </Button>
                  <Tooltip label="View">
                    <IconButton
                      colorScheme="blue"
                      size="sm"
                      as={Link}
                      to={`/view/ppp/${jobs.job_id}/`}
                      icon={<Icon as={IconEye} />}
                      rounded="full"
                      aria-label="View"
                    />
                  </Tooltip>
                </Flex>
              ) : jobs.STATUS === "FINISHED P3" ? (
                <Flex gap={2}>
                  <Button
                    colorScheme="green"
                    size="sm"
                    leftIcon={<Icon as={IconCoin} />}
                  >
                    Update
                  </Button>
                  <Tooltip label="View">
                    <IconButton
                      colorScheme="blue"
                      size="sm"
                      as={Link}
                      to={`/view/ppp/${jobs.job_id}/`}
                      icon={<Icon as={IconEye} />}
                      rounded="full"
                      aria-label="View"
                    />
                  </Tooltip>
                </Flex>
              ) : null}
            </Flex>
          )}
        />
      </Box>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Operasi Konfirmasi
            </AlertDialogHeader>

            <AlertDialogBody>
              Apakah Anda yakin ingin mengubah status pekerjaan ini menjadi
              "OPERATING"?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={OperateJob} ml={3}>
                Operate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <Footer />
    </Flex>
  );
};

export default CloseOutExplorationKKKS;
