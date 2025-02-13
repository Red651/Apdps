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
} from "@chakra-ui/react";
import {
  IconTablePlus,
  IconTrash,
  IconEdit,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { ADD_JOB_EXP_DEV_JOB_PLAN_WELL } from "../../../Reducer/reducer";
import { useJobContext } from "../../../Context/JobContext";
import { useParams } from "react-router-dom";

const WellSummary = ({  errorForms, unittype }) => {

  const { state, dispatch } = useJobContext();
  const {job_id} = useParams();
  
  const [currentEntry, setCurrentEntry] = useState({
    unit_type: unittype,
    depth: "",
    hole_diameter: "",
    casing_outer_diameter: "",
    mud_program: "",
    bit: "",
    logging: "",
    cementing_program: "",
    bottom_hole_temperature: "",
    rate_of_penetration: "",
    remarks: "",
  });

  const [tableData, setTableData] = useState([]);
  const [depthValue, setDepthValue] = useState("MSL");
  const [editIndex, setEditIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  // Menangani perubahan input
  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue =
      type === "number" && value !== "" ? parseFloat(value) : value;
    setCurrentEntry((prev) => ({ ...prev, [name]: processedValue }));
  };

  // Menangani perubahan input saat mengedit
  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue =
      type === "number" && value !== "" ? parseFloat(value) : value;
    setEditFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  // Menangani pengeditan baris data
  const handleEditRow = (index) => {
    setEditIndex(index);
    setEditFormData(tableData[index]);
  };

  // Menyimpan hasil edit
  const handleSaveEdit = (index) => {
    const updatedData = [...tableData];
    updatedData[index] = editFormData;
    setTableData(updatedData);
    setEditIndex(null);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
  };

  // Menghapus baris data
  const handleDeleteRow = (index) => {
    const newData = tableData.filter((_, i) => i !== index);
    setTableData(newData);
  };

  // Menambah entry baru ke tabel
  const handleAddClickLocal = () => {
    const newEntry = {
      ...currentEntry,
      depth_datum: depthValue, // Include depth_datum with the current selected value
    };
    setTableData((prev) => [...prev, newEntry]); // Update the local table data state
    setCurrentEntry({
      unit_type: unittype,
      depth: "",
      hole_diameter: "",
      casing_outer_diameter: "",
      mud_program: "",
      bit: "",
      logging: "",
      cementing_program: "",
      bottom_hole_temperature: "",
      rate_of_penetration: "",
      remarks: "",
    });
  };

  // Mengirim data terbaru ke parent component saat `tableData` berubah
  useEffect(() => {
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: { 
        well_summary: tableData
      }
    });
  }, [tableData]);

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
                  Subtitle
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
            <Grid templateColumns="repeat(4, 1fr)" gap={4}>
              <FormControl>
                <FormLabel>Depth</FormLabel>
                <InputGroup>
                  <Input
                    name="depth"
                    type="number"
                    value={currentEntry.depth}
                    onChange={handleInputChange}
                    placeholder="Depth"
                  />
                  <InputRightAddon>
                    {unittype === "METRICS" ? "m" : "ft"}
                  </InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Hole Diameter</FormLabel>
                <InputGroup>
                  <Input
                    name="hole_diameter"
                    value={currentEntry.hole_diameter}
                    type="number"
                    onChange={handleInputChange}
                    placeholder="Hole Diameter"
                  />
                  <InputRightAddon>
                    {unittype === "METRICS" ? "mm" : "in"}
                  </InputRightAddon>
                </InputGroup>
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
                  <InputRightAddon>
                    {unittype === "METRICS" ? "mm" : "in"}
                  </InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Mud Program</FormLabel>
                <Input
                  name="mud_program"
                  type="text"
                  value={currentEntry.mud_program}
                  onChange={handleInputChange}
                  placeholder="Mud Program"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Bit</FormLabel>
                <InputGroup>
                  <Input
                    name="bit"
                    value={currentEntry.bit}
                    onChange={handleInputChange}
                    placeholder="Bit"
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Logging Program</FormLabel>
                <Input
                  name="logging"
                  value={currentEntry.logging}
                  type="text"
                  onChange={handleInputChange}
                  placeholder="Logging Program"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Cementing Program</FormLabel>
                <Input
                  name="cementing_program"
                  value={currentEntry.cementing_program}
                  onChange={handleInputChange}
                  placeholder="Cementing Program"
                />
              </FormControl>
              <FormControl>
                <FormLabel>Bottom Hole Temperature</FormLabel>
                <InputGroup>
                  <Input
                    name="bottom_hole_temperature"
                    value={currentEntry.bottom_hole_temperature}
                    type="number"
                    onChange={handleInputChange}
                    placeholder="Bottom Hole Temperature"
                  />
                  <InputRightAddon>
                    {unittype === "METRICS" ? "°C" : "°F"}
                  </InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Rate of Penetration</FormLabel>
                <InputGroup>
                  <Input
                    name="rate_of_penetration"
                    value={currentEntry.rate_of_penetration}
                    onChange={handleInputChange}
                    type="number"
                    placeholder="Rate of Penetration"
                  />
                  <InputRightAddon>
                    {unittype === "METRICS" ? "m/hr" : "ft/hr"}
                  </InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Remarks</FormLabel>
                <Input
                  name="remarks"
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
                    <Th>Bit</Th>
                    <Th>Depth</Th>
                    <Th>Hole Diameter</Th>
                    <Th>Casing Diameter</Th>
                    <Th>Logging</Th>
                    <Th>Mud Program</Th>
                    <Th>Bottom Hole Temperature</Th>
                    <Th>Rate of Penetration</Th>
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
                              name="bit"
                              value={editFormData.bit}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="depth"
                              type="number"
                              value={editFormData.depth}
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
                              name="casing_outer_diameter"
                              type="number"
                              value={editFormData.casing_outer_diameter}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="logging"
                              value={editFormData.logging}
                              onChange={handleEditChange}
                            />
                          </Td>
                          <Td>
                            <Input
                              name="mud_program"
                              value={editFormData.mud_program}
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
                          <Td>{row.bit}</Td>
                          <Td>{row.depth}</Td>
                          <Td>{row.hole_diameter}</Td>
                          <Td>{row.casing_outer_diameter}</Td>
                          <Td>{row.logging}</Td>
                          <Td>{row.mud_program}</Td>
                          <Td>{row.bottom_hole_temperature}</Td>
                          <Td>{row.rate_of_penetration}</Td>
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
              <Flex
                justifyContent="center"
                flexDirection={"column"}
                alignItems="center"
                height="100%"
              >
                <Heading fontFamily={"Mulish"}>Tidak Ada Data</Heading>
                {!!errorForms["job_plan.well.well_summary"] && (
                  <Text color="red.500" fontSize="sm" mt={2}>
                    Well Summary cannot be empty.
                  </Text>
                )}
              </Flex>
            )}
          </Box>
        </Box>
      </GridItem>
    </Grid>
  );
};

export default WellSummary;
