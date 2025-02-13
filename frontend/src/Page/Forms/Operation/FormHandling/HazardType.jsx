import React, { useEffect, useCallback } from "react";
import CardFormK3 from "../../Components/CardFormK3";
import {
  Button,
  Grid,
  GridItem,
  useToast,
  HStack,
  Icon,
  IconButton,
} from "@chakra-ui/react";
import FormControlCard from "../../Components/FormControl";
import TableComponent from "../../Components/TableComponent";
import { SelectComponent, SelectOption } from "../../Components/SelectOption";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";
import {
  IconTrash,
  IconTable,
  IconPlus,
  IconEdit,
  IconX,
} from "@tabler/icons-react";
const HazardType = () => {
  const { state, dispatch } = useJobContext();
  const data = state?.initialOperationData?.actual_job;
  const [tableData, setTableData] = React.useState([]);
  const toast = useToast();
  const [editIndex, setEditIndex] = React.useState(null);
  const [formData, setFormData] = React.useState({
    hazard_type: "",
    severity: "",
    hazard_description: "",
    mitigation: "",
    remark: "",
  });
  useEffect(() => {
    if (data?.job_hazards) {
      setTableData(data.job_hazards);
    }
  }, [data]);
  const headers = [
    { Header: "Hazard Type", accessor: "hazard_type" },
    { Header: "Hazard Severity", accessor: "severity" },
    { Header: "Hazard Desc", accessor: "hazard_description" },
    { Header: "Mitigation", accessor: "mitigation" },
    { Header: "Remarks", accessor: "remark" },
    {
      Header: "Actions",
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
      const value = e.target.value;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    },
    []
  );
  const resetForm = useCallback(() => {
    setFormData({
      hazard_type: "",
      severity: "",
      hazard_description: "",
      mitigation: "",
      remark: "",
    });
    setEditIndex(null);
  }, []);
  const validateForm = useCallback(() => {
    const { hazard_type, severity, hazard_description, mitigation } = formData;
    if (!hazard_type || !severity || !hazard_description || !mitigation) {
      toast({
        title: "Error",
        description: "Semua field harus diisi kecuali Remarks",
        status: "error",
        duration: 3000,
        isClosable: true,
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
      updatedTableData[editIndex] = formData;

      toast({
        title: "Sukses",
        description: "Data hazard berhasil diperbarui",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      // Add new row
      updatedTableData = [...tableData, formData];

      toast({
        title: "Sukses",
        description: "Data hazard berhasil ditambahkan",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }

    // Update state and global state
    setTableData(updatedTableData);
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: {
        ...state.initialOperationData,
        actual_job: {
          ...state.initialOperationData.actual_job,
          job_hazards: updatedTableData.length === 0 ? null : updatedTableData,
        },
      },
    });

    // Reset form
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
            job_hazards:
              updatedTableData.length === 0 ? null : updatedTableData,
          },
        },
      });

      toast({
        title: "Sukses",
        description: "Data hazard berhasil dihapus",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    [tableData, state.initialOperationData, dispatch, toast]
  );
  return (
    <Grid gap={4} templateColumns="repeat(2, 1fr)">
      <GridItem minWidth="300px" minHeight="400px">
        <CardFormK3 title="Job Hazard">
          <SelectComponent
            label="Hazard Type"
            onChange={handleChangeData("hazard_type")}
            value={formData.hazard_type}
          >
            {[
              "GAS KICK",
              "STUCK PIPE",
              "LOST CIRCULATION",
              "WELL CONTROL",
              "EQUIPMENT FAILURE",
              "OTHER",
            ].map((option) => (
              <SelectOption key={option} label={option} value={option} />
            ))}
          </SelectComponent>
          <SelectComponent
            label="Hazard Severity"
            onChange={handleChangeData("severity")}
            value={formData.severity}
          >
            {["LOW", "MEDIUM", "HIGH"].map((option) => (
              <SelectOption key={option} label={option} value={option} />
            ))}
          </SelectComponent>
          <FormControlCard
            labelForm="Hazard Description"
            placeholder="Hazard Description"
            type="text"
            isTextArea
            value={formData.hazard_description}
            handleChange={handleChangeData("hazard_description")}
          />
          <FormControlCard
            labelForm="Mitigation"
            placeholder="Mitigation"
            value={formData.mitigation}
            isTextArea
            handleChange={handleChangeData("mitigation")}
          />
          <FormControlCard
            labelForm="Remarks"
            placeholder="Remarks"
            value={formData.remark}
            handleChange={handleChangeData("remark")}
          />
          <HStack spacing={2} justifyContent="flex-end">
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
                Cancel
              </Button>
            )}
          </HStack>
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
    </Grid>
  );
};
export default HazardType;
