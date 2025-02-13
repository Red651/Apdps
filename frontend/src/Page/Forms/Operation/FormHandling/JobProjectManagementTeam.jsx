import React, { useEffect, useCallback } from "react";
import FormControlCard from "../../Components/FormControl";
import CardFormK3 from "../../Components/CardFormK3";
import { Button, Grid, GridItem, useToast, HStack, IconButton, Icon } from "@chakra-ui/react";
import TableComponent from "../../Components/TableComponent";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";
import {IconEdit, IconTrash, IconPlus, IconX} from "@tabler/icons-react";

const JobProjectManagementTeam = () => {
  const { state, dispatch } = useJobContext();
  const toast = useToast();
  const [rowData, setRowData] = React.useState([]);
  const [editIndex, setEditIndex] = React.useState(null);
  const [formData, setFormData] = React.useState({
    company: "",
    position: "",
    name: "",
    email: "",
    contact: "",
  });

  useEffect(() => {
    if (state?.initialOperationData?.actual_job?.job_project_management_team) {
      const teamData =
        state.initialOperationData.actual_job.job_project_management_team;
      const updatedTeamData = teamData.map((team) => ({
        ...team,
        email: team.email || "",
        contact: team.contact || "",
      }));
      setRowData(updatedTeamData);
    }
  }, [state]);

  const headers = [
    {
      Header: "Company",
      accessor: "company",
    },
    {
      Header: "Position",
      accessor: "position",
    },
    {
      Header: "Name",
      accessor: "name",
    },
    {
      Header: "Email",
      accessor: "email",
    },
    {
      Header: "Contact",
      accessor: "contact",
    },
    {
      Header: "Actions",
      accessor: "actions",
      render: (row) => {
        const currentIndex = rowData.findIndex(
          (item) =>
            item.company === row.company &&
            item.position === row.position &&
            item.name === row.name &&
            item.email === row.email &&
            item.contact === row.contact,
        );

        return (
          <HStack spacing={2}>
            <IconButton
              size="sm"
              colorScheme="yellow"
              onClick={() => handleEdit(row, currentIndex)}
              icon={<Icon as={IconEdit} />}
              borderRadius={"full"}
            />
            <IconButton
              size="sm"
              colorScheme="red"
              onClick={() => handleDelete(currentIndex)}
              icon={<Icon as={IconTrash} />}
              borderRadius={"full"}
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
      company: "",
      position: "",
      name: "",
      email: "",
      contact: "",
    });
    setEditIndex(null);
  }, []);

  const validateForm = useCallback(() => {
    const { company, position, name, email, contact } = formData;
    if (!company || !position || !name) {
      toast({
        title: "Error",
        description: "Please fill required fields (Company, Position, Name)",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    return true;
  }, [formData, toast]);

  const updateGlobalState = useCallback(
    (newData) => {
      const dataToDispatch = newData.map((item) => ({
        ...item,
        email: item.email || "",
        contact: item.contact || "",
      }));

      dispatch({
        type: UPDATE_OPERATION_DATA,
        payload: {
          ...state.initialOperationData,
          actual_job: {
            ...state.initialOperationData.actual_job,
            job_project_management_team:
              dataToDispatch.length == 0 ? null : dataToDispatch,
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
      newData = [...rowData];
      newData[editIndex] = formData;
      setRowData(newData);
      toast({
        title: "Success",
        description: "Data updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      newData = [...rowData, formData];
      setRowData(newData);
      toast({
        title: "Success",
        description: "Data added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    }
    updateGlobalState(newData);
    resetForm();
  }, [
    formData,
    editIndex,
    rowData,
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

      const newData = rowData.filter((_, idx) => idx !== index);
      setRowData(newData);
      updateGlobalState(newData);
      toast({
        title: "Success",
        description: "Data deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    },
    [rowData, updateGlobalState, toast],
  );

  return (
    <Grid gap={4} templateColumns="repeat(2, 1fr)">
      <GridItem minWidth="300px" minHeight="400px">
        <CardFormK3 title="Job Project Management Team">
          <FormControlCard
            labelForm="Company"
            name="company"
            placeholder="Company"
            handleChange={handleChange}
            value={formData.company}
          />
          <FormControlCard
            labelForm="Position"
            name="position"
            placeholder="Position"
            handleChange={handleChange}
            value={formData.position}
          />
          <FormControlCard
            labelForm="Name"
            name="name"
            placeholder="Name"
            handleChange={handleChange}
            value={formData.name}
          />
          <FormControlCard
            labelForm="Email"
            name="email"
            placeholder="Email"
            handleChange={handleChange}
            value={formData.email}
            type="email"
          />
          <FormControlCard
            labelForm="Contact"
            name="contact"
            placeholder="Contact"
            handleChange={handleChange}
            value={formData.contact}
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
        <CardFormK3 title="Job Project Management Table">
          <TableComponent data={rowData} headers={headers} minHeight="480px" />
        </CardFormK3>
      </GridItem>
    </Grid>
  );
};

export default JobProjectManagementTeam;
