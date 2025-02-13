import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  Heading,
  Flex,
  Select,
  Icon,
  Text,
  
} from '@chakra-ui/react';

import {IconVolcano, IconTable} from "@tabler/icons-react";
const HazardTypeForm = ({ onAddItem }) => {
  const [formData, setFormData] = useState({
    hazard_type: '',
    hazard_description: '',
    severity: '',
    remarks: '',
    mitigation:''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddItem(formData);
    setFormData({ hazard_type: '', hazard_description: '', severity: '', remarks: '', mitigation: '' });
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={4} width="100%">
      <Flex alignItems="center" mb={6}>
        <Icon as={IconVolcano} boxSize={12} color="gray.800" mr={3} />
        <Flex flexDirection={"column"}>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="gray.700"
            fontFamily={"Mulish"}
          >
            {"Hazard Type"}
          </Text>
          <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
            {"subtitle"}
          </Text>
        </Flex>
      </Flex>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl>
            <FormLabel>Hazard Type</FormLabel>
            <Select
            name="hazard_type"
            value={formData.hazard_type}
            onChange={handleInputChange}>
              <option value="GAS KICK">GAS KICK</option>
              <option value="STUCK PIPE">STUCK PIPE</option>
              <option value="LOST CIRCULATION">LOST CIRCULATION</option>
              <option value="WELL CONTROL">WELL CONTROL</option>
              <option value="EQUIPMENT FAILURE">EQUIPMENT FAILURE</option>
              <option value="OTHER">OTHER</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Hazard Description</FormLabel>
            <Input
              name="hazard_description"
              type="text"
              placeholder="hazard_description"
              value={formData.hazard_description}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Severity</FormLabel>
            <Input
              name="severity"
              type="text"
              placeholder="severity"
              value={formData.severity}
              onChange={handleInputChange}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Mitigation</FormLabel>
            <Input
              name="mitigation"
              value={formData.mitigation}
              onChange={handleInputChange}
              placeholder="mitigation"
            />
          </FormControl>
          <FormControl>
            <FormLabel>Remarks</FormLabel>
            <Input
              name="remarks"
              value={formData.remarks}
              onChange={handleInputChange}
              placeholder="remarks"
            />
          </FormControl>
          <Button type="submit" colorScheme="blue">
            Add
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

const HazardType = ({onDataChange}) => {
  const [items, setItems] = useState([]);

  const handleAddItem = (newItem) => {
    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    onDataChange(updatedItems); // Kirim data ke Parent component
  };

  return (
    <Flex mt={4}>
      <Box flex={1}  mr={4}>
        <HazardTypeForm onAddItem={handleAddItem} />
      </Box>
      <Box flex={1} maxHeight={"465px"} overflowY={"auto"} borderWidth="1px" borderRadius="lg" p={4}>
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
              <Th>Hazard Type</Th>
              <Th>Hazard Desc</Th>
              <Th>Severity</Th>
              <Th>Mitigation</Th>
              <Th>Remarks</Th>
            </Tr>
          </Thead>
          <Tbody>
            {items.map((item, index) => (
              <Tr key={index}>
                <Td>{item.hazard_type}</Td>
                <Td>{item.hazard_description}</Td>
                <Td>{item.severity}</Td>
                <Td>{item.mitigation}</Td>
                <Td>{item.remarks}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Flex>
  );
};

export default HazardType;
