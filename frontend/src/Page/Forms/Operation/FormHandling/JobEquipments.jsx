import React, { useEffect, useCallback, useState } from "react";
import { 
  Grid, 
  GridItem, 
  Button, 
  HStack, 
  useToast, 
  Icon,
  IconButton,
  Flex,
  Text
} from "@chakra-ui/react";
import { 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconX,
  IconTool 
} from "@tabler/icons-react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import TableComponent from "../../Components/TableComponent";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";
const JobEquipments = () => {
  const { state, dispatch } = useJobContext();
  const toast = useToast();
  const [editIndex, setEditIndex] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState({
    equipment: "",
    vendor: "",
  });
  useEffect(() => {
    if (state?.initialOperationData?.actual_job?.job_equipments) {
      setTableData(state.initialOperationData.actual_job.job_equipments);
    }
  }, [state]);
  const headers = [
    {
      Header: "Equipment",
      accessor: "equipment",
    },
    {
      Header: "Vendor",
      accessor: "vendor",
    },
    {
      Header: "Actions",
      accessor: "actions",
      render: (row) => {
        const currentIndex = tableData.findIndex(
          (item) =>
            item.equipment === row.equipment && item.vendor === row.vendor,
        );
        return (
          <HStack spacing={2}>
            <IconButton
              icon={<Icon as={IconEdit} />}
              colorScheme="yellow"
              variant="solid"
              borderRadius="full"
              size="sm"
              onClick={() => handleEdit(row, currentIndex)}
            />
            <IconButton
              icon={<Icon as={IconTrash} />}
              colorScheme="red"
              variant="solid"
              borderRadius="full"
              size="sm"
              onClick={() => handleDelete(currentIndex)}
            />
          </HStack>
        );
      },
    },
  ];
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);
  const resetForm = useCallback(() => {
    setFormData({
      equipment: "",
      vendor: "",
    });
    setEditIndex(null);
  }, []);
  const validateForm = useCallback(() => {
    const { equipment, vendor } = formData;
    const errors = [];
    if (!equipment || equipment.trim() === '') {
      errors.push('Equipment');
    }
    if (!vendor || vendor.trim() === '') {
      errors.push('Vendor');
    }
    if (errors.length > 0) {
      toast({
        title: "Error",
        description: `Harap isi field: ${errors.join(', ')}`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    // Cek duplikasi
    if (editIndex === null) {
      const isDuplicate = tableData.some(
        item => 
          item.equipment.toLowerCase() === equipment.toLowerCase() && 
          item.vendor.toLowerCase() === vendor.toLowerCase()
      );
      if (isDuplicate) {
        toast({
          title: "Error",
          description: "Equipment dengan vendor yang sama sudah ada",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        return false;
      }
    }
    return true;
  }, [formData, tableData, toast, editIndex]);
  const updateGlobalState = useCallback(
    (newData) => {
      dispatch({
        type: UPDATE_OPERATION_DATA,
        payload: {
          ...state.initialOperationData,
          actual_job: {
            ...state.initialOperationData.actual_job,
            job_equipments: newData.length === 0 ? null : newData,
          },
        },
      });
    },
    [dispatch, state.initialOperationData],
  );
  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;
    let newData;
    if (editIndex !== null) {
      // Update existing entry
      newData = tableData.map((item, index) =>
        index === editIndex ? formData : item,
      );
      
      toast({
        title: "Sukses",
        description: "Equipment berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      // Add new entry
      newData = [...tableData, formData];
      
      toast({
        title: "Sukses",
        description: "Equipment berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
    setTableData(newData);
    updateGlobalState(newData);
    resetForm();
  }, [
    formData,
    editIndex,
    tableData,
    validateForm,
    updateGlobalState,
    resetForm,
    toast,
  ]);
  const handleEdit = useCallback((row, index) => {
    setFormData(row);
    setEditIndex(index);
  }, []);
  const handleDelete = useCallback(
    (index) => {
      if (index === -1) return;
      const newData = tableData.filter((_, idx) => idx !== index);
      setTableData(newData);
      updateGlobalState(newData);
      toast({
        title: "Sukses",
        description: "Equipment berhasil dihapus",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    [tableData, updateGlobalState, toast],
  );
  return (
    <Grid templateColumns="repeat(2, 1fr)" my={4} gap={4}>
      <GridItem>
        <CardFormK3 title="Equipment">
          <FormControlCard
            labelForm="Equipment"
            type="text"
            name="equipment"
            value={formData.equipment}
            handleChange={handleChange}
            placeholder="Masukkan nama equipment"
          />
          <FormControlCard
            labelForm="Vendor"
            type="text"
            name="vendor"
            value={formData.vendor}
            handleChange={handleChange}
            placeholder="Masukkan nama vendor"
          />
          <Flex justifyContent="flex-end" mt={4}>
            <HStack spacing={2}>
              <Button
                colorScheme={editIndex !== null ? "yellow" : "blue"}
                onClick={handleSubmit}
                borderRadius="full"
                leftIcon={<Icon as={editIndex !== null ? IconEdit : IconPlus} />}
              >
                {editIndex !== null ? "Update" : "Add"}
              </Button>
              {editIndex !== null && (
                <Button
                  colorScheme="gray"
                  onClick={resetForm}
                  borderRadius="full"
                  leftIcon={<Icon as={IconX} />}
                >
                  Batal
                </Button>
              )}
            </HStack>
          </Flex>
        </CardFormK3>
      </GridItem>
      <GridItem>
        <CardFormK3 
          title="Daftar Equipment" 
          headerIcon={<Icon as={IconTool} boxSize={6} />}
        >
          <TableComponent data={tableData} headers={headers} />
        </CardFormK3>
      </GridItem>
    </Grid>
  );
};
export default JobEquipments;