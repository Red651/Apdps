import React, { useState } from "react";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Button,
  Heading,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Icon,
  Text,
  IconButton,
  HStack,
} from "@chakra-ui/react";
import {
  IconBinaryTree,
  IconTable,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

const JobOperationForm = ({ onAddItem }) => {
  const [formData, setFormData] = useState({
    event: "",
    start_date: null,
    end_date: null,
    remarks: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    onAddItem(formData);
    setFormData({ event: "", start_date: "", end_date: "", remarks: "" });
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={4} width="100%">
      <Flex alignItems="center" mb={6}>
        <Icon as={IconBinaryTree} boxSize={12} color="gray.800" mr={3} />
        <Flex flexDirection={"column"}>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="gray.700"
            fontFamily={"Mulish"}
          >
            {"Work Breakdown Structure"}
          </Text>
          <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
            {"subtitle"}
          </Text>
        </Flex>
      </Flex>
      <VStack spacing={4} align="stretch">
        <FormControl>
          <FormLabel>Event</FormLabel>
          <Input
            name="event"
            value={formData.event}
            onChange={handleInputChange}
            placeholder="Event"
          />
        </FormControl>
        <FormControl>
          <FormLabel>Start Date</FormLabel>
          <Input
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleInputChange}
          />
        </FormControl>
        <FormControl>
          <FormLabel>End Date</FormLabel>
          <Input
            name="end_date"
            type="date"
            disabled={formData.start_date === null}
            min={formData.start_date}
            value={formData.end_date}
            onChange={handleInputChange}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Remarks</FormLabel>
          <Input
            name="remarks"
            value={formData.remarks}
            onChange={handleInputChange}
            placeholder="Remarks"
          />
        </FormControl>
        <Button onClick={handleAdd} colorScheme="blue">
          Add
        </Button>
      </VStack>
    </Box>
  );
};

const WorkBreakDownStructure = ({ ondata, errorForms }) => {
  const [items, setItems] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const handleAddItem = (newItem) => {
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    ondata(updatedItems);
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
    ondata(updatedItems);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = items.filter((_, i) => i !== index);
    setItems(updatedItems);
    ondata(updatedItems);
  };

  return (
    <Flex mt={4}>
      <Box flex={1} mr={4}>
        <JobOperationForm onAddItem={handleAddItem} />
      </Box>
      <Box
        flex={1}
        maxHeight={"465px"}
        overflowY={"auto"}
        borderWidth="1px"
        borderRadius="lg"
        p={4}
      >
        <Flex alignItems="center" mb={6}>
          <Icon as={IconTable} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              {"Table"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {"subtitle"}
            </Text>
          </Flex>
        </Flex>
        {items.length > 0 ? (
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Event</Th>
                <Th>Start Date</Th>
                <Th>End Date</Th>
                <Th>Remarks</Th>
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
                          width={"200px"}
                          name="event"
                          value={editFormData.event}
                          onChange={handleEditChange}
                        />
                      </Td>
                      <Td>
                        <Input
                          name="start_date"
                          type="date"
                          value={editFormData.start_date}
                          onChange={handleEditChange}
                        />
                      </Td>
                      <Td>
                        <Input
                          name="end_date"
                          type="date"
                          value={editFormData.end_date}
                          onChange={handleEditChange}
                        />
                      </Td>
                      <Td>
                        <Input
                          name="remarks"
                          value={editFormData.remarks}
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
                      <Td>{item.event}</Td>
                      <Td>{item.start_date}</Td>
                      <Td>{item.end_date}</Td>
                      <Td>{item.remarks}</Td>
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
        ) : (
          <Flex
            justifyContent="center"
            flexDirection={"column"}
            alignItems="center"
            height="100%"
          >
            <Heading fontFamily={"Mulish"}>Tidak Ada Data</Heading>
            {errorForms &&
              errorForms["job_plan.well.work_breakdown_structure"] && (
                <Text color="red.500" fontSize="sm" mt={2}>
                  Job Operation Day cannot be empty.
                </Text>
              )}
          </Flex>
        )}
      </Box>
    </Flex>
  );
};

export default WorkBreakDownStructure;
