import React, { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { IconBinaryTree, IconTable } from "@tabler/icons-react";

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

const WorkBreakDownStructure = ({ ondata }) => {
  const [items, setItems] = useState([]);

  const handleAddItem = (newItem) => {
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    ondata(updatedItems); // Kirim data ke Parent component
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
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Event</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th>Remarks</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.map((item, index) => (
              <Tr key={index}>
                <Td>{item.event}</Td>
                <Td>{item.start_date}</Td>
                <Td>{item.end_date}</Td>
                <Td>{item.remarks}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
};

export default WorkBreakDownStructure;
