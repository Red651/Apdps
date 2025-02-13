import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  VStack,
  Grid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Select,
  InputGroup,
  InputRightAddon,
  Icon,
  Text,
  Image,
  HStack,
  IconButton,
  GridItem,
  Heading,
  useToast,
} from "@chakra-ui/react";
import {
  IconCylinder,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import axios from "axios";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";

const WellCasing = () => {
  const { state, dispatch } = useJobContext();
  const toast = useToast();
  const data = state?.initialOperationData?.actual_job?.well?.well_casing;
  const unittype = state?.initialOperationData?.unit_type || "METRICS";
  const [tableWellCasing, setTableWellCasing] = useState([]);
  const [wellCasing, setWellCasing] = useState({
    unit_type: unittype,
    depth_datum: "RT",
    casing_type: "CONDUCTOR PIPE",
    depth: "",
    length: "",
    hole_diameter: "",
    casing_outer_diameter: "",
    casing_inner_diameter: "",
    casing_grade: "H40",
    casing_weight: "",
    connection: "",
    description: "",
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [imageUrl, setImageUrl] = useState(null);
  const [showWellCasing, setShowWellCasing] = useState({
    names: [],
    top_depths: [],
    bottom_depths: [],
    diameters: [],
  });

  useEffect(() => {
    if (data) {
      setTableWellCasing(data);
      updateShowWellCasing(data);
    }
  }, [data]);

  useEffect(() => {
    setWellCasing((prevData) => ({
      ...prevData,
      unit_type: unittype,
    }));
  }, [unittype]);

  const updateShowWellCasing = useCallback((casingData) => {
    setShowWellCasing({
      names: casingData.map((entry) => entry.description),
      top_depths: casingData.map((entry) => entry.depth - entry.length),
      bottom_depths: casingData.map((entry) => entry.depth),
      diameters: casingData.map((entry) => entry.casing_outer_diameter),
    });
  }, []);

  const handleInputChangeWellCasing = useCallback((e) => {
    const { name, value, type } = e.target;
    let processedValue =
      type === "number" && value !== "" ? parseFloat(value) : value;
    setWellCasing((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));
  }, []);

  const validateWellCasing = useCallback((data) => {
    const errors = [];

    if (!data.depth || data.depth <= 0) {
      errors.push("Depth harus diisi dan lebih besar dari 0");
    }

    if (!data.length || data.length <= 0) {
      errors.push("Length harus diisi dan lebih besar dari 0");
    }

    if (!data.hole_diameter || data.hole_diameter <= 0) {
      errors.push("Hole Diameter harus diisi dan lebih besar dari 0");
    }

    if (!data.casing_outer_diameter || data.casing_outer_diameter <= 0) {
      errors.push("Casing Outer Diameter harus diisi dan lebih besar dari 0");
    }

    if (!data.casing_inner_diameter || data.casing_inner_diameter <= 0) {
      errors.push("Casing Inner Diameter harus diisi dan lebih besar dari 0");
    }

    if (
      parseFloat(data.casing_outer_diameter) >= parseFloat(data.hole_diameter)
    ) {
      errors.push("Casing Outer Diameter harus lebih kecil dari Hole Diameter");
    }

    if (
      parseFloat(data.casing_inner_diameter) >=
      parseFloat(data.casing_outer_diameter)
    ) {
      errors.push(
        "Casing Inner Diameter harus lebih kecil dari Outer Diameter",
      );
    }

    if (!data.casing_weight || data.casing_weight <= 0) {
      errors.push("Casing Weight harus diisi dan lebih besar dari 0");
    }

    if (!data.description || data.description.trim() === "") {
      errors.push("Description harus diisi");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const handleWellCasing = useCallback(() => {
    const { isValid, errors } = validateWellCasing(wellCasing);

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: (
          <Box>
            {errors.map((error, index) => (
              <Text key={index}>• {error}</Text>
            ))}
          </Box>
        ),
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      return;
    }

    const updatedTable = [...tableWellCasing, wellCasing];
    setTableWellCasing(updatedTable);
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: {
        ...state.initialOperationData,
        actual_job: {
          ...state.initialOperationData.actual_job,
          well: {
            ...state.initialOperationData.actual_job.well,
            well_casing: updatedTable.length == 0 ? null : updatedTable,
          },
        },
      },
    });
    updateShowWellCasing(updatedTable);
    resetForm();

    toast({
      title: "Success",
      description: "Data Well Casing berhasil ditambahkan",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  }, [
    wellCasing,
    tableWellCasing,
    validateWellCasing,
    dispatch,
    state.initialOperationData,
    updateShowWellCasing,
    toast,
  ]);

  const handleEditRow = useCallback(
    (index) => {
      setEditIndex(index);
      setEditFormData(tableWellCasing[index]);
    },
    [tableWellCasing],
  );

  const handleEditChange = useCallback((e) => {
    const { name, value, type } = e.target;
    let processedValue =
      type === "number" && value !== "" ? parseFloat(value) : value;
    setEditFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  }, []);

  const handleSaveEdit = useCallback(
    (index) => {
      const updatedTable = [...tableWellCasing];
      updatedTable[index] = editFormData;
      setTableWellCasing(updatedTable);
      setEditIndex(null);
      dispatch({
        type: UPDATE_OPERATION_DATA,
        payload: {
          ...state.initialOperationData,
          actual_job: {
            ...state.initialOperationData.actual_job,
            well: {
              ...state.initialOperationData.actual_job.well,
              well_casing: updatedTable.length == 0 ? null : updatedTable,
            },
          },
        },
      });
      updateShowWellCasing(updatedTable);
    },
    [
      tableWellCasing,
      editFormData,
      dispatch,
      state.initialOperationData,
      updateShowWellCasing,
    ],
  );

  const handleDeleteRow = useCallback(
    (index) => {
      const updatedTable = tableWellCasing.filter((_, i) => i !== index);
      setTableWellCasing(updatedTable);
      // dispatch({
      //   type: UPDATE_OPERATION_DATA,
      //   payload: {
      //     ...state.initialOperationData,
      //     actual_job: {
      //       ...state.initialOperationData.actual_job,
      //       well: {
      //         ...state.initialOperationData.actual_job.well,
      //         well_casing: updatedTable,
      //       },
      //     },
      //   },
      // });
      updateShowWellCasing(updatedTable);
      toast({
        title: "Success",
        description: "Data berhasil dihapus",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    },
    [
      tableWellCasing,
      dispatch,
      state.initialOperationData,
      updateShowWellCasing,
      toast,
    ],
  );

  const resetForm = () => {
    setWellCasing({
      unit_type: unittype,
      depth_datum: "RT",
      casing_type: "CONDUCTOR PIPE",
      depth: "",
      length: "",
      hole_diameter: "",
      casing_outer_diameter: "",
      casing_inner_diameter: "",
      casing_grade: "H40",
      casing_weight: "",
      connection: "",
      description: "",
    });
  };

  const optionCasingType = ["CONDUCTOR PIPE", "Surface Casing"];

  const clickShowCasing = useCallback(async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_URL}/visualize/temporary/casing`,
        showWellCasing,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        },
      );
      if (response) {
        const blob = response.data;
        const imageUrl = URL.createObjectURL(blob);
        setImageUrl(imageUrl);
      }
    } catch (error) {
      console.error("Error generating visualization", error);
    }
  }, [showWellCasing]);

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={4} mt={4} height="700px">
      <Box borderWidth="1px" borderRadius="lg" p={6} height="100%">
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Flex alignItems="center">
            <Icon as={IconCylinder} boxSize={12} color="gray.800" mr={3} />
            <Flex flexDirection="column">
              <Text fontSize="xl" fontWeight="bold" color="gray.700">
                Well Casing
              </Text>
              <Text fontSize="md" color="gray.600">
                subtitle
              </Text>
            </Flex>
          </Flex>
          <Select
            width="auto"
            value={wellCasing.depth_datum}
            onChange={(e) =>
              handleInputChangeWellCasing({
                target: { name: "depth_datum", value: e.target.value },
              })
            }
          >
            <option value="RT">RT</option>
            <option value="KB">KB</option>
            <option value="MSL">MSL</option>
          </Select>
        </Flex>

        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            <FormControl>
              <FormLabel>Depth</FormLabel>
              <InputGroup>
                <Input
                  name="depth"
                  type="number"
                  value={wellCasing.depth}
                  onChange={handleInputChangeWellCasing}
                />
                <InputRightAddon>
                  {wellCasing.unit_type === "METRICS" ? "m" : "ft"}
                </InputRightAddon>
              </InputGroup>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Length</FormLabel>
              <InputGroup>
                <Input
                  name="length"
                  type="number"
                  value={wellCasing.length}
                  onChange={handleInputChangeWellCasing}
                />
                <InputRightAddon>
                  {wellCasing.unit_type === "METRICS" ? "m" : "ft"}
                </InputRightAddon>
              </InputGroup>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel>Hole Diameter</FormLabel>
              <InputGroup>
                <Input
                  name="hole_diameter"
                  type="number"
                  value={wellCasing.hole_diameter}
                  onChange={handleInputChangeWellCasing}
                />
                <InputRightAddon>INCH</InputRightAddon>
              </InputGroup>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Casing Outer Diameter</FormLabel>
              <InputGroup>
                <Input
                  name="casing_outer_diameter"
                  type="number"
                  value={wellCasing.casing_outer_diameter}
                  onChange={handleInputChangeWellCasing}
                />
                <InputRightAddon>INCH</InputRightAddon>
              </InputGroup>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel>Casing Inner Diameter</FormLabel>
              <InputGroup>
                <Input
                  name="casing_inner_diameter"
                  type="number"
                  value={wellCasing.casing_inner_diameter}
                  onChange={handleInputChangeWellCasing}
                />
                <InputRightAddon>INCH</InputRightAddon>
              </InputGroup>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Casing Grade</FormLabel>
              <Select
                name="casing_grade"
                value={wellCasing.casing_grade}
                onChange={handleInputChangeWellCasing}
              >
                <option value="H40">H40</option>
                <option value="K55">K55</option>
                <option value="J55">J55</option>
                <option value="N80">N80</option>
                <option value="C95">C95</option>
                <option value="P10">P10</option>
                <option value="S125">S125</option>
              </Select>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl>
              <FormLabel>Casing Weight</FormLabel>
              <InputGroup>
                <Input
                  name="casing_weight"
                  type="number"
                  value={wellCasing.casing_weight}
                  onChange={handleInputChangeWellCasing}
                />
                <InputRightAddon>
                  {unittype === "METRICS" ? "kg/m3" : "ppf"}
                </InputRightAddon>
              </InputGroup>
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Connection</FormLabel>
              <Input
                name="connection"
                value={wellCasing.connection}
                onChange={handleInputChangeWellCasing}
              />
            </FormControl>
          </GridItem>

          <GridItem colSpan={2}>
            <FormControl>
              <FormLabel>Description</FormLabel>
              <Input
                name="description"
                value={wellCasing.description}
                onChange={handleInputChangeWellCasing}
              />
            </FormControl>
          </GridItem>

          <GridItem colSpan={2}>
            <FormControl>
              <FormLabel>Casing Type</FormLabel>
              <Select
                name="casing_type"
                value={wellCasing.casing_type}
                onChange={handleInputChangeWellCasing}
              >
                {optionCasingType.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Select>
            </FormControl>
          </GridItem>
        </Grid>

        <Flex justifyContent="flex-end" mt={4}>
          <Button colorScheme="blue" onClick={handleWellCasing}>
            {editIndex !== null ? "Update Data" : "Add Data"}
          </Button>
        </Flex>
      </Box>

      <Box borderWidth="1px" borderRadius="lg" height="100%" overflow="hidden">
        <Tabs height="100%">
          <TabList>
            <Tab>Table</Tab>
            <Tab>Casing</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <Box height="100%" overflowY="auto">
                {tableWellCasing.length > 0 ? (
                  <Table variant="simple">
                    <Thead position="sticky" top={0} bg="white" zIndex={1}>
                      <Tr>
                        <Th>Depth</Th>
                        <Th>Length</Th>
                        <Th>Hole Diameter</Th>
                        <Th>Casing Outer</Th>
                        <Th>Casing Inner</Th>
                        <Th>Casing Grade</Th>
                        <Th>Casing Weight</Th>
                        <Th>Casing Type</Th>
                        <Th>Description</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {tableWellCasing.map((row, index) => (
                        <Tr key={index}>
                          {editIndex === index ? (
                            <>
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
                                  name="length"
                                  type="number"
                                  value={editFormData.length}
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
                                  name="casing_inner_diameter"
                                  type="number"
                                  value={editFormData.casing_inner_diameter}
                                  onChange={handleEditChange}
                                />
                              </Td>
                              <Td>
                                <Select
                                  value={editFormData.casing_grade}
                                  onChange={(e) =>
                                    handleEditChange({
                                      target: {
                                        name: "casing_grade",
                                        value: e.target.value,
                                      },
                                    })
                                  }
                                >
                                  <option value="H40">H40</option>
                                  <option value="K55">K55</option>
                                  <option value="J55">J55</option>
                                  <option value="N80">N80</option>
                                  <option value="C95">C95</option>
                                  <option value="P10">P10</option>
                                  <option value="S125">S125</option>
                                </Select>
                              </Td>
                              <Td>
                                <Input
                                  name="casing_weight"
                                  type="number"
                                  value={editFormData.casing_weight}
                                  onChange={handleEditChange}
                                />
                              </Td>
                              <Td>
                                <Select
                                  value={editFormData.casing_type}
                                  onChange={(e) =>
                                    handleEditChange({
                                      target: {
                                        name: "casing_type",
                                        value: e.target.value,
                                      },
                                    })
                                  }
                                >
                                  {optionCasingType.map((option) => (
                                    <option key={option} value={option}>
                                      {option}
                                    </option>
                                  ))}
                                </Select>
                              </Td>
                              <Td>
                                <Input
                                  name="description"
                                  value={editFormData.description}
                                  onChange={handleEditChange}
                                />
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={<IconCheck />}
                                    colorScheme="green"
                                    size="sm"
                                    onClick={() => handleSaveEdit(index)}
                                    aria-label="Save"
                                  />
                                  <IconButton
                                    icon={<IconX />}
                                    colorScheme="red"
                                    size="sm"
                                    onClick={() => setEditIndex(null)}
                                    aria-label="Cancel"
                                  />
                                </HStack>
                              </Td>
                            </>
                          ) : (
                            <>
                              <Td>{row.depth}</Td>
                              <Td>{row.length}</Td>
                              <Td>{row.hole_diameter}</Td>
                              <Td>{row.casing_outer_diameter}</Td>
                              <Td>{row.casing_inner_diameter}</Td>
                              <Td>{row.casing_grade}</Td>
                              <Td>{row.casing_weight}</Td>
                              <Td>{row.casing_type}</Td>
                              <Td>{row.description}</Td>
                              <Td>
                                <HStack spacing={2}>
                                  <IconButton
                                    icon={<IconEdit />}
                                    colorScheme="blue"
                                    size="sm"
                                    onClick={() => handleEditRow(index)}
                                    aria-label="Edit"
                                  />
                                  <IconButton
                                    icon={<IconTrash />}
                                    colorScheme="red"
                                    size="sm"
                                    onClick={() => handleDeleteRow(index)}
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
                    alignItems="center"
                    height="100%"
                    flexDirection="column"
                  >
                    <Heading>Tidak Ada Data</Heading>
                  </Flex>
                )}
              </Box>
            </TabPanel>

            <TabPanel>
              <VStack spacing={4} align="stretch">
                <Button colorScheme="blue" onClick={clickShowCasing}>
                  Show Casing
                </Button>
                {imageUrl && (
                  <Box overflow="auto">
                    <Image
                      src={imageUrl}
                      alt="Casing Visualization"
                      maxW="100%"
                    />
                  </Box>
                )}
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Grid>
  );
};

export default WellCasing;
