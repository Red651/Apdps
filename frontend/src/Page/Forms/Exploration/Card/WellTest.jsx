import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  GridItem,
  Heading,
  Grid,
  InputRightAddon,
  InputGroup,
  Flex,
  Icon,
  Text,
} from "@chakra-ui/react";
import { IconTableAlias } from "@tabler/icons-react";

const WellTest = ({ onData }) => {
  const [formData, setFormData] = useState([]);
  const [wellTest, setWellTest] = useState({
    unit_type: "METRICS",
    depth_datum: "RT",
    zone_name: "",
    zone_top_depth: 0,
    zone_bottom_depth: 0,
    depth_uom: "FEET",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWellTest((prev) => ({
      ...prev,
      [name]: name.includes("depth") ? parseFloat(value) : value,
    }));
  };

  const handleAddClick = () => {
    const newData = { ...wellTest };
    setFormData((prev) => [...prev, newData]);
    // onData([newData]);
    setWellTest({
      unit_type: "METRICS",
      depth_datum: "RT",
      zone_name: "",
      zone_top_depth: 0,
      zone_bottom_depth: 0,
      depth_uom: "FEET",
    });
  };


  useEffect(() => {
    onData(formData);
  }, [formData]);

  

  return (
    <div fontFamily={"Mulish"}>
      <Grid
        templateColumns={"repeat(2, 1fr)"}
        mt={4}
        gap={4}
        fontFamily={"Mulish"}
      >
        <GridItem>
          <Box borderWidth="1px" borderRadius="lg" p={6}>
            <Flex alignItems="center" mb={6}>
              <Icon as={IconTableAlias} boxSize={12} color="gray.800" mr={3} />
              <Flex flexDirection={"column"}>
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="gray.700"
                  fontFamily={"Mulish"}
                >
                  {"Well Test"}
                </Text>
                <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
                  {"subtitle"}
                </Text>
              </Flex>
            </Flex>
            <VStack spacing={4} align="stretch">
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Zone Name</FormLabel>
                  <InputGroup>
                    <Input
                      name="zone_name"
                      value={wellTest.zone_name}
                      onChange={handleChange}
                      placeholder="Zone Name"
                    />
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Zone Top Depth</FormLabel>
                  <InputGroup>
                    <Input
                      name="zone_top_depth"
                      type="number"
                      value={wellTest.zone_top_depth}
                      onChange={handleChange}
                      placeholder="Zone Top Depth"
                    />
                    \<InputRightAddon>m</InputRightAddon>
                  </InputGroup>
                </FormControl>
              </HStack>
              <HStack spacing={4}>
                <FormControl>
                  <FormLabel>Zone Bottom Depth</FormLabel>
                  <InputGroup>
                    <Input
                      name="zone_bottom_depth"
                      type="number"
                      value={wellTest.zone_bottom_depth}
                      onChange={handleChange}
                      placeholder="Zone Bottom Depth"
                    />
                    <InputRightAddon>m</InputRightAddon>
                  </InputGroup>
                </FormControl>
                <FormControl>
                  <FormLabel>Depth UOM</FormLabel>
                  <Select
                    name="depth_uom"
                    value={wellTest.depth_uom}
                    onChange={handleChange}
                  >
                    <option value="FEET">FEET</option>
                    <option value="METER">METER</option>
                  </Select>
                </FormControl>
              </HStack>
              <Button colorScheme="blue" onClick={handleAddClick}>
                Add
              </Button>
            </VStack>
          </Box>
        </GridItem>
        <GridItem>
          <Box
            borderWidth="1px"
            h={"325px"}
            borderRadius="lg"
            p={6}
            overflowY="auto"
          >
            <Heading size="lg" mb={6} fontFamily={"Mulish"}>
              Table Well Test
            </Heading>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Depth Datum</Th>
                  <Th>Zone Name</Th>
                  <Th>Zone Top Depth</Th>
                  <Th>Zone Bottom Depth</Th>
                  <Th>Depth UOM</Th>
                </Tr>
              </Thead>
              <Tbody>
                {formData.map((data, index) => (
                  <Tr key={index}>
                    <Td>{data.depth_datum}</Td>
                    <Td>{data.zone_name}</Td>
                    <Td>{data.zone_top_depth}</Td>
                    <Td>{data.zone_bottom_depth}</Td>
                    <Td>{data.depth_uom}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </GridItem>
      </Grid>
    </div>
  );
};

export default WellTest;
