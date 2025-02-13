import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Badge,
  Flex,
  Text,
  Button,
  useDisclosure,
  Tr,
  Td,
  Icon,
  Skeleton,
} from "@chakra-ui/react";
import {
  IconCheck,
  IconSettings2,
  IconChecks,
  IconClockHour10,
  IconEye,
  IconEdit,
  IconTrash,
  IconCopy,
  IconTablePlus,
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
  IconButton,
  Tooltip,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import ModalAndContent from "../../Forms/Components/ModalAndContent";
import FileHandlingUpload from "../../Forms/Components/FileHandlingUpload";
import ActionButtonUploadFile from "../../Forms/Components/ActionButtonUploadFile";
import ModalDeleteJobPlan from "../Shared/ModalDeleteJobPlan";
import { RESET_JOB_PLAN_EXP_DEV } from "../../../Reducer/reducer";
import { useJobContext } from "../../../Context/JobContext";
import BreadcrumbCard from "../Card/Breadcrumb";

const PlanningWorkOverKKKS = () => {
  const [tableData, setTableData] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [countDataSummary, setCountDataSummary] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const {
    isOpen: uploadOpen,
    onOpen: onUploadOpen,
    onClose: onUploadClose,
  } = useDisclosure();
  const cancelRef = useRef();
  const kkks_id = JSON.parse(localStorage.getItem("user")).kkks_id;
  const [loading, setLoading] = useState(true);
  const [parentFile, setParentFile] = React.useState();
  const [errorFile, setErrorFile] = React.useState([]);
  const {
    isOpen: deleteOpen,
    onOpen: onDeleteOpen,
    onClose: onDeleteClose,
  } = useDisclosure();

  const {state, dispatch} = useJobContext();
  React.useEffect(() => {
    dispatch({
      type: RESET_JOB_PLAN_EXP_DEV,
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    try {
      const fetchData = async () => {
        const data = await getTableKKKS(kkks_id, "workover", "plan");
        setTableData(data.data);
      };

      const fetchCountData = async () => {
        const data = await getCountDataSummary(kkks_id, "workover", "plan");
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

  const handleOperate = async () => {
    setLoading(true);
    try {
      await patchStatusOperationToOperate(selectedId);
      const updatedData = await getTableKKKS(kkks_id, "workover", "plan");
      setTableData(updatedData.data);
      onClose();
    } catch (error) {
      console.error("Failed to update operation status:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShow = (job) => {
    setSelectedId(job.job_id);
  };

  const actionButton = () => {
    return (
      <Flex gap={2} fontFamily={"Mulish"}>
        <Button
          borderRadius={"full"}
          onClick={onUploadOpen}
          size={"md"}
          colorScheme="blue"
          leftIcon={<Icon as={IconCopy} />}
          variant={"outline"}

        >
          Upload Batch
        </Button>
        <Button
          borderRadius={"full"}
          as={Link}
          to={"form"}
          leftIcon={<Icon as={IconTablePlus} />}
          colorScheme="blue"
        >
          Ajukan Planning
        </Button>
      </Flex>
    );
  };

  return (
    <Flex gap={4} my={6} direction={"column"}>
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        Planning Work Over
      </Text>

      <BreadcrumbCard />

      <Flex gap={4}>
        <PerhitunganCard
          number={countDataSummary?.diajukan}
          icon={IconCheck}
          bgIcon="green.100"
          iconColor="green.500"
          label={"Diajukan"}
          subLabel="Pekerjaan diajukan"
        />
        <PerhitunganCard
          number={countDataSummary?.diproses}
          icon={IconClockHour10}
          label={"Diproses"}
          subLabel="Pekerjaan Diproses"
          bgIcon="#FFE57F"
          iconColor="#B79200"
        />
        <PerhitunganCard
          number={countDataSummary?.disetujui}
          icon={IconSettings2}
          label={"Disetujui"}
          subLabel="Pekerjaan Disetujui"
          bgIcon="#E1EFFE"
          iconColor="#3F83F8"
        />
        <PerhitunganCard
          number={countDataSummary?.dikembalikan}
          icon={IconChecks}
          bgIcon="#5856D6"
          iconColor="#EBF5FF"
          label={"Dikembalikan"}
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
          actionButton={actionButton()}
          actionButtons={(jobs) => (
            <Flex>
            {jobs.STATUS === "APPROVED" ? (
              <Button
                leftIcon={<Icon as={IconEye} />}
                colorScheme="blue"
                size="sm"
                to={`view/${jobs.job_id}/`}
                as={Link}
                borderRadius={"full"}
              >
                View
              </Button>
            ) : jobs.STATUS === "PROPOSED" || jobs.STATUS === "RETURNED" ? (
              <Flex>
                <Tooltip label="View">
                  <IconButton
                    colorScheme="green"
                    size="sm"
                    onClick={() => handleShow(jobs)}
                    icon={<Icon as={IconEye} />}
                    rounded={"full"}
                    to={`view/${jobs.job_id}`}
                    as={Link}
                  />
                </Tooltip>
                <Tooltip label="Edit">
                  <IconButton
                    colorScheme="yellow"
                    size="sm"
                    as={Link}
                    to={`edit/${jobs.job_id}`}
                    state={{
                      job_phase: "update-workover",
                    }}
                    rounded={"full"}
                    icon={<Icon as={IconEdit} />}
                  />
                </Tooltip>
                <Tooltip label="Delete">
                  <IconButton
                    colorScheme="red"
                    size="sm"
                    onClick={() => {
                      onDeleteOpen();
                      setSelectedId(jobs.job_id);
                    }}
                    rounded={"full"}
                    icon={<Icon as={IconTrash} />}
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
              <Button colorScheme="blue" onClick={handleOperate} ml={3}>
                Operate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      <ModalDeleteJobPlan
        job_id={selectedId}
        isOpen={deleteOpen}
        onClose={onDeleteClose}
      />
      <ModalAndContent
        onClose={onUploadClose}
        isOpen={uploadOpen}
        title="Upload Well Work Over Planning"
        actionButton={
          <ActionButtonUploadFile
            file={parentFile}
            typeJob={"workover"}
            errorMessage={(error) => setErrorFile(error)}
          />
        }
        scrollBehavior="inside"
      >
        <FileHandlingUpload handleChange={(e) => setParentFile(e)} />
        {parentFile && (
          <Box mt={4} p={4} border="1px solid" borderColor="gray.200">
            <Text fontSize="lg">Uploaded File:</Text>
            <Text>Name: {parentFile.name}</Text>
            <Text>Size: {(parentFile.size / 1024).toFixed(2)} KB</Text>
          </Box>
        )}
        <UnorderedList>
          {errorFile &&
            errorFile.map((err, index) => (
              <ListItem key={index} color="red.500">
                {err}
              </ListItem>
            ))}
        </UnorderedList>
      </ModalAndContent>

      <Footer />
    </Flex>
  );
};

export default PlanningWorkOverKKKS;
