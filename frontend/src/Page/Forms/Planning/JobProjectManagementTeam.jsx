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
  IconUsers,
} from "@tabler/icons-react";
import { useJobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN } from "../../../Reducer/reducer";
import { useParams } from "react-router-dom";

const ManagementForm = ({ onAddItem }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    company: "",
    position: "",
    name: "",
    email: "", // New field
    contact: "", // New field
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const { company, position, name, email, contact } = formData;
    if (!company || !position || !name || !email || !contact) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return false;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
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
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onAddItem(formData);
      setFormData({
        company: "",
        position: "",
        name: "",
        email: "",
        contact: "",
      });
    }
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={4}>
      <Flex alignItems="center" mb={6}>
        <Icon as={IconUsers} boxSize={12} color="gray.800" mr={3} />
        <Flex flexDirection="column">
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="gray.700"
            fontFamily={"Mulish"}
          >
            Project Management Team
          </Text>
          <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
            Add team member details
          </Text>
        </Flex>
      </Flex>

      <form onSubmit={handleSubmit}>
        <FormControl mb={4}>
          <FormLabel>Company</FormLabel>
          <Input
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            placeholder="Enter company name"
          />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Position</FormLabel>
          <Input
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            placeholder="Enter position"
          />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Name</FormLabel>
          <Input
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter name"
          />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Email</FormLabel>
          <Input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
          />
        </FormControl>

        <FormControl mb={4}>
          <FormLabel>Contact</FormLabel>
          <Input
            name="contact"
            value={formData.contact}
            onChange={handleInputChange}
            placeholder="Enter contact number"
          />
        </FormControl>

        <Button type="submit" colorScheme="blue" width="full">
          Add Team Member
        </Button>
      </form>
    </Box>
  );
};

const JobProjectManagementTeam = ({initialData=null,TypeSubmit="create"}) => {
  const { state, dispatch } = useJobContext();
  const { job_id } = useParams();
  const [items, setItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  

  useEffect(() => {
    if (TypeSubmit === "update" && initialData) {
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
        job_project_management_team: dataNull,
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
        <ManagementForm onAddItem={handleAddItem} />
      </GridItem>
      <Box borderWidth="1px" borderRadius="lg" p={4}>
        <GridItem>
          <Flex alignItems="center" mb={6}>
            <Icon as={IconTable} boxSize={12} color="gray.800" mr={3} />
            <Flex flexDirection="column">
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="gray.700"
                fontFamily={"Mulish"}
              >
                Team Members Table
              </Text>
              <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
                Manage team members
              </Text>
            </Flex>
          </Flex>

          {items.length > 0 ? (
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Company</Th>
                    <Th>Position</Th>
                    <Th>Name</Th>
                    <Th>Email</Th>
                    <Th>Contact</Th>
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
                              name="company"
                              value={editFormData.company}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="position"
                              value={editFormData.position}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="name"
                              value={editFormData.name}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="email"
                              type="email"
                              value={editFormData.email}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="contact"
                              value={editFormData.contact}
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
                          <Td>{item.company}</Td>
                          <Td>{item.position}</Td>
                          <Td>{item.name}</Td>
                          <Td>{item.email}</Td>
                          <Td>{item.contact}</Td>
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
                No team members added yet
              </Text>
            </Flex>
          )}
        </GridItem>
      </Box>
    </Grid>
  );
};

export default JobProjectManagementTeam;
