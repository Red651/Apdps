import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Grid,
  GridItem,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  IconButton,
  HStack,
  Text,
  Flex,
} from "@chakra-ui/react";
import {
  IconTable,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
  IconTool,
} from "@tabler/icons-react";
import { useJobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN } from "../../../Reducer/reducer";
import { useParams } from "react-router-dom";

const EquipmentForm = ({ onAddItem }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    equipment: "",
    vendor: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { equipment, vendor } = formData;
    if (!equipment || !vendor) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAddItem(formData);
      setFormData({
        equipment: "",
        vendor: "",
      });
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={4}>
      <Flex alignItems="center" mb={6}>
        <Icon as={IconTool} boxSize={12} color="gray.800" mr={3} />
        <Flex flexDirection="column">
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="gray.700"
            fontFamily={"Mulish"}
          >
            Equipment Details
          </Text>
          <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
            Add equipment information
          </Text>
        </Flex>
      </Flex>

      <form onSubmit={handleSubmit}>
        <FormControl mb={4}>
          <FormLabel>Equipment</FormLabel>
          <Input
            name="equipment"
            value={formData.equipment}
            onChange={handleInputChange}
            placeholder="Enter equipment name"
          />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Vendor</FormLabel>
          <Input
            name="vendor"
            value={formData.vendor}
            onChange={handleInputChange}
            placeholder="Enter vendor name"
          />
        </FormControl>

        <Button type="submit" colorScheme="blue" width="full">
          Add Equipment
        </Button>
      </form>
    </Box>
  );
};

const JobEquipments = ({initialData=null,TypeSubmit="create"}) => {
  const { state, dispatch } = useJobContext();
  const { job_id } = useParams();
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const jobDataPlanning = state.jobPlanExpDev?.job_plan?.job_equipments || [];

  useEffect(() => {
    if (initialData && TypeSubmit === "update") {
      setItems((prev) => [...prev, ...initialData]);
    } else {
      setItems([]);
    }
  }, [TypeSubmit]);

  const dataNull = items.length === 0 ? null : items;
  useEffect(() => {
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN,
      payload: {
        job_equipments: dataNull,
      },
    });
  }, [items]);

  const handleAddItem = (newItem) => {
    setItems([...items, newItem]);
  };

  const handleEditClick = (index) => {
    setEditIndex(index);
    setEditFormData(items[index]);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveEdit = (index) => {
    const updatedItems = [...items];
    updatedItems[index] = editFormData;
    setItems(updatedItems);
    setEditIndex(null);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
  };

  return (
    <Grid gap={4} templateColumns="repeat(2, 1fr)" my={4}>
      <GridItem>
        <EquipmentForm onAddItem={handleAddItem} />
      </GridItem>
      <GridItem>
        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <Flex alignItems="center" mb={6}>
            <Icon as={IconTable} boxSize={12} color="gray.800" mr={3} />
            <Flex flexDirection="column">
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="gray.700"
                fontFamily={"Mulish"}
              >
                Equipment List
              </Text>
              <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
                Manage equipment details
              </Text>
            </Flex>
          </Flex>

          {items.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Equipment</Th>
                    <Th>Vendor</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {items.map((item, index) => (
                    <Tr key={index}>
                      {editIndex === index ? (
                        <>
                          <Td>
                            <Input
                              name="equipment"
                              value={editFormData.equipment}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="vendor"
                              value={editFormData.vendor}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                icon={<Icon as={IconCheck} />}
                                colorScheme="green"
                                onClick={() => handleSaveEdit(index)}
                                aria-label="Save"
                              />
                              <IconButton
                                icon={<Icon as={IconX} />}
                                colorScheme="red"
                                onClick={handleCancelEdit}
                                aria-label="Cancel"
                              />
                            </HStack>
                          </Td>
                        </>
                      ) : (
                        <>
                          <Td>{item.equipment}</Td>
                          <Td>{item.vendor}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                icon={<Icon as={IconEdit} />}
                                colorScheme="blue"
                                onClick={() => handleEditClick(index)}
                                aria-label="Edit"
                              />
                              <IconButton
                                icon={<Icon as={IconTrash} />}
                                colorScheme="red"
                                onClick={() => handleDeleteItem(index)}
                                aria-label="Delete"
                              />
                            </HStack>
                          </Td>
                        </>
                      )}
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          ) : (
            <Flex justifyContent="center" alignItems="center" height="200px">
              <Text fontSize="lg" color="gray.500">
                No equipment added yet
              </Text>
            </Flex>
          )}
        </Box>
      </GridItem>
    </Grid>
  );
};

export default JobEquipments;
