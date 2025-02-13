import React, { useState, useEffect } from "react";
import {
  Grid,
  GridItem,
  Box,
  Flex,
  Select,
  VStack,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightAddon,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Icon,
  IconButton,
  HStack,
  Heading,
  Spinner,
} from "@chakra-ui/react";
import {
  IconTablePlus,
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

const WellSummary = ({ handleChange, errorForms, unittype = "METRICS", initialData }) => {
  const [loading, setLoading] = useState(true);
  const [currentEntry, setCurrentEntry] = useState({
    unit_type: unittype,
    section_name: "",
    depth_datum: "RT",
    top_depth: null,
    bottom_depth: null,
    hole_diameter: null,
    bit: "",
    casing_outer_diameter: null,
    logging: "",
    mud_type: "WATER BASED MUD",
    mud_weight: null,
    mud_viscosity: null,
    mud_ph_level: null,
    slurry_volume: null,
    slurry_mix: null,
    bottom_hole_temperature: null,
    rate_of_penetration: null,
    weight_on_bit: null,
    rotary_speed: null,
    remarks: "",
  });

  const [tableData, setTableData] = useState([]);
  const [depthValue, setDepthValue] = useState("RT");
  const [editIndex, setEditIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const editedData = await initialData;
        if (editedData?.well_summary) {
          setTableData(editedData.well_summary);
        }
      } catch (error) {
        console.error("Error fetching initial data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [initialData]);

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" && value !== "" ? parseFloat(value) : value;
    setCurrentEntry((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" && value !== "" ? parseFloat(value) : value;
    setEditFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleEditRow = (index) => {
    setEditIndex(index);
    setEditFormData(tableData[index]);
  };

  const handleSaveEdit = (index) => {
    const updatedData = [...tableData];
    updatedData[index] = editFormData;
    setTableData(updatedData);
    setEditIndex(null);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
  };

  const handleDeleteRow = (index) => {
    const newData = tableData.filter((_, i) => i !== index);
    setTableData(newData);
  };

  const handleAddClickLocal = () => {
    const newEntry = {
      ...currentEntry,
      depth_datum: depthValue,
    };
    setTableData((prev) => [...prev, newEntry]);
    setCurrentEntry({
      ...currentEntry,
      section_name: "",
      top_depth: null,
      bottom_depth: null,
      hole_diameter: null,
      bit: "",
      casing_outer_diameter: null,
      logging: "",
      mud_type: "WATER BASED MUD",
      mud_weight: null,
      mud_viscosity: null,
      mud_ph_level: null,
      slurry_volume: null,
      slurry_mix: null,
      bottom_hole_temperature: null,
      rate_of_penetration: null,
      weight_on_bit: null,
      rotary_speed: null,
      remarks: "",
    });
  };

  useEffect(() => {
    handleChange(tableData);
  }, [tableData, handleChange]);

  if (loading) {
    return (
      <Box textAlign="center" p={4}>
        <Spinner />
      </Box>
    );
  }

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={4} fontFamily={"Mulish"}>
      <GridItem colSpan={1} width={"100%"}>
        <Box borderWidth="1px" borderRadius="lg" width={"100%"} p={6} height="100%">
          <Flex justifyContent="space-between" alignItems="center" mb={6}>
            <Flex alignItems="center">
              <Icon as={IconTablePlus} boxSize={12} color="gray.800" mr={3} />
              <Flex flexDirection="column">
                <Text fontSize="xl" fontWeight="bold" color="gray.700" fontFamily={"Mulish"}>
                  Well Summary
                </Text>
                <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
                  Add and manage well summary data
                </Text>
              </Flex>
            </Flex>
            <Select
              width="auto"
              value={depthValue}
              onChange={(e) => setDepthValue(e.target.value)}
            >
              <option value="MSL">MSL</option>
              <option value="RT">RT</option>
              <option value="KB">KB</option>
            </Select>
          </Flex>
          <VStack spacing={4} align="stretch" height="calc(100% - 80px)">
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <FormControl>
                <FormLabel>Section Name</FormLabel>
                <Input
                  name="section_name"
                  type="text"
                  value={currentEntry.section_name}
                  onChange={handleInputChange}
                  placeholder="Section Name"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Top Depth</FormLabel>
                <InputGroup>
                  <Input
                    name="top_depth"
                    type="number"
                    value={currentEntry.top_depth}
                    onChange={handleInputChange}
                    placeholder="Top Depth"
                  />
                  <InputRightAddon>{unittype === "METRICS" ? "m" : "ft"}</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Bottom Depth</FormLabel>
                <InputGroup>
                  <Input
                    name="bottom_depth"
                    type="number"
                    value={currentEntry.bottom_depth}
                    onChange={handleInputChange}
                    placeholder="Bottom Depth"
                  />
                  <InputRightAddon>{unittype === "METRICS" ? "m" : "ft"}</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Hole Diameter</FormLabel>
                <InputGroup>
                  <Input
                    name="hole_diameter"
                    type="number"
                    value={currentEntry.hole_diameter}
                    onChange={handleInputChange}
                    placeholder="Hole Diameter"
                  />
                  <InputRightAddon>{unittype === "METRICS" ? "mm" : "in"}</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Bit</FormLabel>
                <Input
                  name="bit"
                  type="text"
                  value={currentEntry.bit}
                  onChange={handleInputChange}
                  placeholder="Bit"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Casing Outer Diameter</FormLabel>
                <InputGroup>
                  <Input
                    name="casing_outer_diameter"
                    type="number"
                    value={currentEntry.casing_outer_diameter}
                    onChange={handleInputChange}
                    placeholder="Casing Outer Diameter"
                  />
                  <InputRightAddon>{unittype === "METRICS" ? "mm" : "in"}</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Logging</FormLabel>
                <Input
                  name="logging"
                  type="text"
                  value={currentEntry.logging}
                  onChange={handleInputChange}
                  placeholder="Logging"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Mud Type</FormLabel>
                <Select
                  name="mud_type"
                  value={currentEntry.mud_type}
                  onChange={handleInputChange}
                >
                  <option value="WATER BASED MUD">WATER BASED MUD</option>
                  <option value="OIL BASED MUD">OIL BASED MUD</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Mud Weight</FormLabel>
                <InputGroup>
                  <Input
                    name="mud_weight"
                    type="number"
                    value={currentEntry.mud_weight}
                    onChange={handleInputChange}
                    placeholder="Mud Weight"
                  />
                  <InputRightAddon>{unittype === "METRICS" ? "kg/m³" : "lb/ft³"}</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Mud Viscosity</FormLabel>
                <InputGroup>
                  <Input
                    name="mud_viscosity"
                    type="number"
                    value={currentEntry.mud_viscosity}
                    onChange={handleInputChange}
                    placeholder="Mud Viscosity"
                  />
                  <InputRightAddon>cP</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Mud pH Level</FormLabel>
                <Input
                  name="mud_ph_level"
                  type="number"
                  value={currentEntry.mud_ph_level}
                  onChange={handleInputChange}
                  placeholder="Mud pH Level"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Slurry Volume</FormLabel>
                <InputGroup>
                  <Input
                    name="slurry_volume"
                    type="number"
                    value={currentEntry.slurry_volume}
                    onChange={handleInputChange}
                    placeholder="Slurry Volume"
                  />
                  <InputRightAddon>{unittype === "METRICS" ? "m³" : "bbl"}</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Slurry Mix</FormLabel>
                <Input
                  name="slurry_mix"
                  type="number"
                  value={currentEntry.slurry_mix}
                  onChange={handleInputChange}
                  placeholder="Slurry Mix"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Bottom Hole Temperature</FormLabel>
                <InputGroup>
                  <Input
                    name="bottom_hole_temperature"
                    type="number"
                    value={currentEntry.bottom_hole_temperature}
                    onChange={handleInputChange}
                    placeholder="Bottom Hole Temperature"
                  />
                  <InputRightAddon>{unittype === "METRICS" ? "°C" : "°F"}</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Rate of Penetration</FormLabel>
                <InputGroup>
                  <Input
                    name="rate_of_penetration"
                    type="number"
                    value={currentEntry.rate_of_penetration}
                    onChange={handleInputChange}
                    placeholder="Rate of Penetration"
                  />
                  <InputRightAddon>{unittype === "METRICS" ? "m/hr" : "ft/hr"}</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Weight on Bit</FormLabel>
                <InputGroup>
                  <Input
                    name="weight_on_bit"
                    type="number"
                    value={currentEntry.weight_on_bit}
                    onChange={handleInputChange}
                    placeholder="Weight on Bit"
                  />
                  <InputRightAddon>{unittype === "METRICS" ? "kN" : "klbf"}</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Rotary Speed</FormLabel>
                <InputGroup>
                  <Input
                    name="rotary_speed"
                    type="number"
                    value={currentEntry.rotary_speed}
                    onChange={handleInputChange}
                    placeholder="Rotary Speed"
                  />
                  <InputRightAddon>rpm</InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl gridColumn="span 2">
                <FormLabel>Remarks</FormLabel>
                <Input
                  name="remarks"
                  type="text"
                  value={currentEntry.remarks}
                  onChange={handleInputChange}
                  placeholder="Remarks"
                />
              </FormControl>
            </Grid>
            <Flex justifyContent="flex-end">
              <Button colorScheme="blue" onClick={handleAddClickLocal}>
                Add
              </Button>
            </Flex>
          </VStack>
        </Box>
      </GridItem>
      <GridItem colSpan={1} overflow="hidden">
        <Box borderWidth="1px" borderRadius="lg" p={6} height="100%" overflow="hidden">
          <Box height="100%" overflowX="auto" overflowY="auto" maxWidth="100%">
            {tableData.length > 0 ? (
              <Table variant="simple" minWidth="800px">
                <Thead position="sticky" top={0} bg="white" zIndex={1}>
                  <Tr>
                    <Th>Section Name</Th>
                    <Th>Top Depth</Th>
                    <Th>Bottom Depth</Th>
                    <Th>Hole Diameter</Th>
                    <Th>Bit</Th>
                    <Th>Casing Outer Diameter</Th>
                    <Th>Logging</Th>
                    <Th>Mud Type</Th>
                    <Th>Mud Weight</Th>
                    <Th>Mud  Viscosity</Th>
                    <Th>Mud pH Level</Th>
                    <Th>Slurry Volume</Th>
                    <Th>Slurry Mix</Th>
                    <Th>Bottom Hole Temperature</Th>
                    <Th>Rate of Penetration</Th>
                    <Th>Weight on Bit</Th>
                    <Th>Rotary Speed</Th>
                    <Th>Remarks</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {tableData.map((row, index) => (
                    <Tr key={index}>
                      {editIndex === index ? (
                        <>
                          <Td>
                            <Input
                              name="section_name"
                              type="text"
                              value={editFormData.section_name}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="top_depth"
                              type="number"
                              value={editFormData.top_depth}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="bottom_depth"
                              type="number"
                              value={editFormData.bottom_depth}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="hole_diameter"
                              type="number"
                              value={editFormData.hole_diameter}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="bit"
                              type="text"
                              value={editFormData.bit}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="casing_outer_diameter"
                              type="number"
                              value={editFormData.casing_outer_diameter}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="logging"
                              type="text"
                              value={editFormData.logging}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Select
                              name="mud_type"
                              value={editFormData.mud_type}
                              onChange={handleEditChange}
                            >
                              <option value="WATER BASED MUD">WATER BASED MUD</option>
                              <option value="OIL BASED MUD">OIL BASED MUD</option>
                            </Select>
                          </Td>
                          <Td>
                            <Input
                              name="mud_weight"
                              type="number"
                              value={editFormData.mud_weight}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="mud_viscosity"
                              type="number"
                              value={editFormData.mud_viscosity}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="mud_ph_level"
                              type="number"
                              value={editFormData.mud_ph_level}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="slurry_volume"
                              type="number"
                              value={editFormData.slurry_volume}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="slurry_mix"
                              type="text"
                              value={editFormData.slurry_mix}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="bottom_hole_temperature"
                              type="number"
                              value={editFormData.bottom_hole_temperature}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="rate_of_penetration"
                              type="number"
                              value={editFormData.rate_of_penetration}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="weight_on_bit"
                              type="number"
                              value={editFormData.weight_on_bit}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="rotary_speed"
                              type="number"
                              value={editFormData.rotary_speed}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="remarks"
                              type="text"
                              value={editFormData.remarks}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                icon={<Icon as={IconCheck} />}
                                colorScheme="green"
                                size="sm"
                                onClick={() => handleSaveEdit(index)}
                                aria-label="Save"
                              />
                              <IconButton
                                icon={<Icon as={IconX} />}
                                colorScheme="red"
                                size="sm"
                                onClick={handleCancelEdit}
                                aria-label="Cancel"
                              />
                            </HStack>
                          </Td>
                        </>
                      ) : (
                        <>
                          <Td>{row.section_name}</Td>
                          <Td>{row.top_depth}</Td>
                          <Td>{row.bottom_depth}</Td>
                          <Td>{row.hole_diameter}</Td>
                          <Td>{row.bit}</Td>
                          <Td>{row.casing_outer_diameter}</Td>
                          <Td>{row.logging}</Td>
                          <Td>{row.mud_type}</Td>
                          <Td>{row.mud_weight}</Td>
                          <Td>{row.mud_viscosity}</Td>
                          <Td>{row.mud_ph_level}</Td>
                          <Td>{row.slurry_volume}</Td>
                          <Td>{row.slurry_mix}</Td>
                          <Td>{row.bottom_hole_temperature}</Td>
                          <Td>{row.rate_of_penetration}</Td>
                          <Td>{row.weight_on_bit}</Td>
                          <Td>{row.rotary_speed}</Td>
                          <Td>{row.remarks}</Td>
                          <Td>
                            <HStack spacing={2}>
                              <IconButton
                                icon={<Icon as={IconEdit} />}
                                colorScheme="blue"
                                size="sm"
                                onClick={() => handleEditRow(index)}
                                aria-label="Edit row"
                              />
                              <IconButton
                                icon={<Icon as={IconTrash} />}
                                colorScheme="red"
                                size="sm"
                                onClick={() => handleDeleteRow(index)}
                                aria-label="Delete row"
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
              <Flex justifyContent="center" flexDirection={"column"} alignItems="center" height="100%">
                <Heading fontFamily={"Mulish"}>Tidak Ada Data</Heading>
              </Flex>
            )}
          </Box>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default WellSummary;