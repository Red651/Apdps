import React, { useState, useEffect, useCallback } from "react";
import { getAllRigs, getSummaryRig } from "../../API/APIKKKS";
import { deleteRig, editRig } from "../../API/PostKkks";
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
import {
  IconPlus,
  IconEyeFilled,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import PerhitunganCard from "../../PageKKKS/Components/Card/CardPerhitunganBox";
import { IconClipboardList, IconBuildingLighthouse } from "@tabler/icons-react";
import RigDetailModal from "./RigDetailModal";
import CreateRigForm from "./RigForm";
import PaginatedTableAGGrid from "../../Components/Card/PaginationTable";
import BreadcrumbCard from "../Card/Breadcrumb";

const Rig = () => {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [perPageOptions] = useState([5, 10, 25, 50]);
  const [loading, setLoading] = useState(true);
  const [totalData, setTotalData] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const toast = useToast();
  const [summaryData, setSummaryData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRigId, setSelectedRigId] = useState(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRig, setSelectedRig] = useState(null);
  const [rigName, setRigName] = useState("");
  const [rigType, setRigType] = useState("");
  const [rigHorsePower, setRigHorsePower] = useState(0);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rigToDelete, setRigToDelete] = useState(null);

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

  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);

  const handleCloseModal = useCallback(async () => {
    setIsModalOpen(false);
    await Promise.all([fetchData(), fetchSummaryData()]);
  }, [fetchData, fetchSummaryData]);

  const closeModal = useCallback(() => {
    setSelectedRigId(null);
    setIsOpen(false);
  }, []);

  const handleEditClick = useCallback((rig) => {
    setSelectedRig(rig);
    setRigName(rig["Rig Name"]);
    setRigType(rig["Rig Type"]);
    setRigHorsePower(rig["Rig Horse Power"]);
    setIsEditOpen(true);
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

  const handleEditSubmit = useCallback(async () => {
    try {
      const updatedRig = {
        rig_name: rigName,
        rig_type: rigType,
        rig_horse_power: rigHorsePower,
      };
      await editRig(selectedRig.id, updatedRig);
      await Promise.all([fetchData(), fetchSummaryData()]);

      toast({
        title: "Rig updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to update rig:", error);
      toast({
        title: "Failed to update rig",
        description: error.response?.data?.message || "Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  }, [
    rigName,
    rigType,
    rigHorsePower,
    selectedRig,
    toast,
    fetchData,
    fetchSummaryData,
  ]);

  const handleDeleteClick = useCallback((rig_id) => {
    setRigToDelete(rig_id);
    setIsDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    try {
      await deleteRig(rigToDelete);
      await Promise.all([fetchData(), fetchSummaryData()]);

      toast({
        title: "Rig deleted.",
        description: "The rig was successfully deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting rig:", error);
      toast({
        title: "Error",
        description: "Failed to delete the rig.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsDeleteModalOpen(false);
      setRigToDelete(null);
    }
  }, [rigToDelete, toast, fetchData, fetchSummaryData]);

  const actionButtons = useCallback(
    (rig) => (
      <Flex gap={2}>
        <Tooltip label="Edit">
          <IconButton
            aria-label="Edit"
            icon={<Icon as={IconEdit} />}
            colorScheme="blue"
            size="sm"
            onClick={() => handleEditClick(rig)}
            rounded="full"
          />
        </Tooltip>
        <Tooltip label="Delete">
          <IconButton
            aria-label="Delete"
            icon={<Icon as={IconTrash} />}
            colorScheme="red"
            size="sm"
            onClick={() => handleDeleteClick(rig.id)}
            rounded="full"
          />
        </Tooltip>
        <Tooltip label="View">
          <IconButton
            aria-label="View"
            icon={<Icon as={IconEyeFilled} />}
            colorScheme="green"
            size="sm"
            onClick={() => openModal(rig.id)}
            rounded="full"
          />
        </Tooltip>
      </Flex>
    ),
    [handleEditClick, handleDeleteClick, openModal],
  );

  return (
    <Flex direction="column" gap={4} p={5}>
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        Rig Master
      </Text>

      <BreadcrumbCard />
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
        actionButton={
          <Button
            leftIcon={<Icon as={IconPlus} />}
            colorScheme="blue"
            rounded={"full"}
            onClick={handleOpenModal}
          >
            Tambah Rig
          </Button>
        }
      />

      <Modal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        lazyBehavior="unmount"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Rig</ModalHeader>
          <ModalBody>
            <FormControl id="rigName">
              <FormLabel>Rig Name</FormLabel>
              <Input
                value={rigName}
                onChange={(e) => setRigName(e.target.value)}
              />
            </FormControl>
            <FormControl id="rigType">
              <FormLabel>Rig Type</FormLabel>
              <Select
                value={rigType}
                onChange={(e) => setRigType(e.target.value)}
              >
                <option value="Land">Land</option>
                <option value="Jackup">Jackup</option>
                <option value="Semi-Submersible">Semi-Submersible</option>
                <option value="Drillship">Drillship</option>
                <option value="Platform">Platform</option>
                <option value="Tender">Tender</option>
                <option value="Barge">Barge</option>
                <option value="Inland Barge">Inland Barge</option>
                <option value="Submersible">Submersible</option>
              </Select>
            </FormControl>
            <FormControl id="rigHorsePower">
              <FormLabel>Rig Horse Power</FormLabel>
              <NumberInput
                value={rigHorsePower}
                onChange={(valueString) =>
                  setRigHorsePower(Number(valueString))
                }
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleEditSubmit}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <RigDetailModal
        isOpen={isOpen}
        onClose={closeModal}
        rig_id={selectedRigId}
      />

      <CreateRigForm isOpen={isModalOpen} onClose={handleCloseModal} />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        lazyBehavior="unmount"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Confirmation</ModalHeader>
          <ModalBody>Are you sure you want to delete this rig?</ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={confirmDelete}>
              Yes, Delete
            </Button>
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default Rig;
