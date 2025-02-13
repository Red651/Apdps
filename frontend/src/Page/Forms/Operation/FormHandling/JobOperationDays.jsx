import React, { useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  GridItem,
  useToast,
  Icon,
  IconButton,
  Select,
  Text,
  FormLabel,
  InputGroup,
  InputRightAddon,
  Input,
  SimpleGrid,
  HStack,
} from "@chakra-ui/react";
import { 
  IconCylinder, 
  IconTrash, 
  IconTable, 
  IconPlus, 
  IconEdit, 
  IconX 
} from "@tabler/icons-react";
import TableComponent from "../../Components/TableComponent";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";
import CardFormK3 from "../../Components/CardFormK3";
// Modifikasi FormControlCard untuk mendukung InputGroup
const FormControlCard = ({
  labelForm,
  placeholder,
  type,
  value,
  handleChange,
  borderRightRadius,
  ...rest
}) => {
  return (
    <Input
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={handleChange}
      borderRightRadius={borderRightRadius}
      {...rest}
    />
  );
};
const JobOperationDays = () => {
  const { state, dispatch } = useJobContext();
  const data = state?.initialOperationData?.actual_job;
  const unitType = data?.well?.unit_type || "METRICS";
  const [tableData, setTableData] = React.useState([]);
  const toast = useToast();
  const [editIndex, setEditIndex] = React.useState(null);
  
  // Determine depth and diameter units based on unit type
  const depthUnit = unitType === "METRICS" ? "m" : "feet";
  const [formData, setFormData] = React.useState({
    phase: "",
    depth_in: "",
    depth_out: "",
    operation_days: "",
    unit_type: unitType,
    depth_datum: "RT",
  });
  useEffect(() => {
    if (data?.job_operation_days) {
      setTableData(data.job_operation_days);
    }
  }, [data]);
  useEffect(() => {
    if (tableData.length > 0) {
      const lastEntry = tableData[tableData.length - 1];
      setFormData((prevData) => ({
        ...prevData,
        unit_type: lastEntry.unit_type || unitType,
        depth_datum: lastEntry.depth_datum || "RT",
      }));
    }
  }, [tableData, unitType]);
  const headers = [
    { Header: "Phase", accessor: "phase" },
    { Header: `Depth In (${depthUnit})`, accessor: "depth_in" },
    { Header: `Depth Out (${depthUnit})`, accessor: "depth_out" },
    { Header: "Operation Days", accessor: "operation_days" },
    {
      Header: "Action",
      render: (row) => {
        const currentIndex = tableData.findIndex(
          (item) => JSON.stringify(item) === JSON.stringify(row)
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
  const handleChangeData = useCallback(
    (name) => (e) => {
      let value = e.target.value;
      if (e.target.type === "number") {
        value = value.includes(".") ? parseFloat(value) : parseInt(value, 10);
        if (isNaN(value)) value = "";
      } else {
        value = value.toString();
      }
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    },
    []
  );
  const resetForm = useCallback(() => {
    setFormData({
      phase: "",
      depth_in: "",
      depth_out: "",
      operation_days: "",
      unit_type: unitType,
      depth_datum: "RT",
    });
    setEditIndex(null);
  }, [unitType]);
  const validateForm = useCallback(() => {
    const { 
      phase, 
      depth_in, 
      depth_out, 
      operation_days 
    } = formData;
    // Validasi tipe dan rentang
    if (!phase) {
      toast({ title: "Error", description: "Phase harus diisi", status: "error" });
      return false;
    }
    if (isNaN(depth_in) || depth_in < 0) {
      toast({ 
        title: "Error", 
        description: "Depth In harus berupa angka positif", 
        status: "error" 
      });
      return false;
    }
    if (isNaN(depth_out) || depth_out < 0) {
      toast({ 
        title: "Error", 
        description: "Depth Out harus berupa angka positif", 
        status: "error" 
      });
      return false;
    }
    if (isNaN(operation_days) || operation_days <= 0) {
      toast({ 
        title: "Error", 
        description: "Operation Days harus berupa angka positif", 
        status: "error" 
      });
      return false;
    }
    // Pastikan depth_in tidak lebih besar dari depth_out
    if (depth_in > depth_out) {
      toast({ 
        title: "Error", 
        description: "Depth In tidak boleh lebih besar dari Depth Out", 
        status: "error" 
      });
      return false;
    }
    return true;
  }, [formData, toast]);
  const handleSubmit = useCallback(() => {
    if (!validateForm()) return;
    
    let updatedTableData;
    if (editIndex !== null) {
      // Update existing row
      updatedTableData = [...tableData];
      updatedTableData[editIndex] = { ...formData, unit_type: unitType };
      
      toast({
        title: "Sukses",
        description: "Data berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      // Add new row
      updatedTableData = [
        ...tableData,
        { ...formData, unit_type: unitType },
      ];
      
      toast({
        title: "Sukses",
        description: "Data berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
    setTableData(updatedTableData);
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: {
        ...state.initialOperationData,
        actual_job: {
          ...state.initialOperationData.actual_job,
          job_operation_days:
            updatedTableData.length === 0 ? null : updatedTableData,
        },
      },
    });
    resetForm();
  }, [
    formData,
    editIndex,
    tableData,
    state.initialOperationData,
    dispatch,
    resetForm,
    toast,
    validateForm,
    unitType,
  ]);
  const handleEdit = useCallback((row, index) => {
    setFormData(row);
    setEditIndex(index);
  }, []);
  const handleDelete = useCallback(
    (index) => {
      const updatedTableData = tableData.filter((_, idx) => idx !== index);
      setTableData(updatedTableData);
      dispatch({
        type: UPDATE_OPERATION_DATA,
        payload: {
          ...state.initialOperationData,
          actual_job: {
            ...state.initialOperationData.actual_job,
            job_operation_days:
              updatedTableData.length === 0 ? null : updatedTableData,
          },
        },
      });
      toast({
        title: "Sukses",
        description: "Data berhasil dihapus",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    [tableData, state.initialOperationData, dispatch, toast]
  );
  return (
    <SimpleGrid columns={2} gap={4} borderRadius="lg">
      <GridItem>
        <CardFormK3
          title="Job Operation Days"
          subtitle="Input job operation days"
          OptionDepth={['RT', 'KB', 'MSL']} 
          OptionDepthStatus={false}
          value={formData.depth_datum} // Tambahkan prop value
          OptionValue={(selectedValue) => {
            // Buat event-like object untuk handleChangeData
            const event = {
              target: {
                name: "depth_datum",
                value: selectedValue,
                type: "text"
              }
            };
            handleChangeData("depth_datum")(event);
          }}
        >
        <Flex direction="column" gap={4}>
          <Box>
            <FormLabel htmlFor="phase">Phase</FormLabel>
            <InputGroup>
              <FormControlCard
                labelForm="Phase"
                placeholder="Enter phase"
                type="text"
                value={formData.phase}
                handleChange={handleChangeData("phase")}
              />
            </InputGroup>
          </Box>
          <Flex gap={2}>
            <Box width="50%">
              <FormLabel htmlFor="depth-in">Depth In</FormLabel>
              <InputGroup>
                <FormControlCard
                  placeholder={`Depth In`}
                  type="number"
                  value={formData.depth_in}
                  handleChange={handleChangeData("depth_in")}
                  borderRightRadius={0}
                />
                <InputRightAddon children={depthUnit} />
              </InputGroup>
            </Box>
            <Box width="50%">
              <FormLabel>Depth Out</FormLabel>
              <InputGroup>
                <FormControlCard
                  placeholder={`Depth Out`}
                  type="number"
                  value={formData.depth_out}
                  handleChange={handleChangeData("depth_out")}
                  borderRightRadius={0}
                />
                <InputRightAddon children={depthUnit} />
              </InputGroup>
            </Box>
          </Flex>
          <Box>
            <FormLabel htmlFor="phase">Operation Days</FormLabel>
            <FormControlCard
              labelForm="Operation Days"
              placeholder="Operation Days"
              type="number"
              value={formData.operation_days}
              handleChange={handleChangeData("operation_days")}
              />
          </Box>
          <Flex alignItems={"center"} justifyContent={"flex-end"}>
            <Button
              colorScheme={editIndex !== null ? "yellow" : "blue"}
              variant="solid"
              onClick={handleSubmit}
              borderRadius={"full"}
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
                ml={2}
              >
                Cancel
              </Button>
            )}
          </Flex>
        </Flex>
              </CardFormK3>
      </GridItem>
      <GridItem minWidth="300px" minHeight="400px">
        <CardFormK3 title="Job Hazard Table" icon={IconTable}>
          <TableComponent
            data={tableData}
            headers={headers}
            minHeight="560px"
          />
        </CardFormK3>
      </GridItem>
    </SimpleGrid>
  );
};
export default JobOperationDays;