import React, { useState, useEffect, useCallback } from "react";
import { getAllRigs, getSummaryRig } from "../API/APIKKKS";
import {
  Box,
  Flex,
  Text,
  FormControl,
  FormLabel,
  Button,
  Input,
  useToast,
  Select,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  NumberInput,
  NumberInputField,
  Icon,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { IconPlus, IconEyeFilled } from "@tabler/icons-react";
import PerhitunganCard from "../PageSKK/Components/Card/CardPerhitunganBox";
import { IconClipboardList, IconBuildingLighthouse } from "@tabler/icons-react";
import RigDetailModal from "../Components/PageRig/RigDetailModal";
import CreateRigForm from "../Components/PageRig/RigForm";
import PaginatedTableAGGrid from "../Components/Card/PaginationTable";
import BreadcrumbCard from "../Components/Card/Breadcrumb";

const Rig = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [perPageOptions] = useState([5, 10, 25, 50]);
  const [loading, setLoading] = useState(true);
  const [totalData, setTotalData] = useState(0);
  const toast = useToast();
  const [summaryData, setSummaryData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRigId, setSelectedRigId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllRigs(page, perPage);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching well instance data: ", error);
      toast({
        title: "Error",
        description: "Failed to fetch data.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [page, perPage, toast]);

  const fetchSummaryData = useCallback(async () => {
    try {
      const response = await getSummaryRig();
      setSummaryData(response.data || []);
      setTotalData(response.data.total_recorded_rigs || 0);
    } catch (error) {
      console.error("Error fetching summary data: ", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchSummaryData();
  }, [fetchSummaryData]);

  const openModal = useCallback((rigId) => {
    setSelectedRigId(rigId);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setSelectedRigId(null);
    setIsOpen(false);
  }, []);

  const handleNextPage = useCallback(() => {
    if (page < Math.ceil(totalData / perPage)) {
      setPage(page + 1);
    }
  }, [page, totalData, perPage]);

  const handlePreviousPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
    }
  }, [page]);

  const handlePerPageChange = useCallback((event) => {
    setPerPage(Number(event.target.value));
    setPage(1);
  }, []);

  const actionButtons = useCallback(
    (rig) => (
      // <Flex gap={2}>
      //   <Tooltip label="View">
      //     <IconButton
      //       aria-label="View"
      //       icon={<Icon as={IconEyeFilled} />}
      //       colorScheme="green"
      //       size="sm"
      //       onClick={() => openModal(rig.id)}
      //       rounded="full"
      //     />
      //   </Tooltip>
      // </Flex>
      <Button
        aria-label="View"
        leftIcon={<Icon as={IconEyeFilled} />}
        colorScheme="blue"
        size="sm"
        rounded="full"
        onClick={() => openModal(rig.id)}
      >
        View
      </Button>
    ),
    [openModal]
  );

  return (
    <Flex direction="column" gap={6}>
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        Rig Master
      </Text>
      <BreadcrumbCard/>
      <PaginatedTableAGGrid
        jobs={data}
        loading={loading}
        page={page}
        perPage={perPage}
        perPageOptions={perPageOptions}
        totalData={totalData}
        onNextPage={handleNextPage}
        onPreviousPage={handlePreviousPage}
        onPerPageChange={handlePerPageChange}
        title="Daftar Rig"
        subtitle={`Rig Terdaftar: ${summaryData?.total_recorded_rigs}`}
        icon={IconBuildingLighthouse}
        actionButtons={actionButtons}
        ShowActionButton={true}
        excludeColumns={"id"}
        excludeColorColumns={"Rig Horse Power"}
        actionHeaderWidth={150}
      />

      <RigDetailModal
        isOpen={isOpen}
        onClose={closeModal}
        rig_id={selectedRigId}
      />
    </Flex>
  );
};

export default Rig;
