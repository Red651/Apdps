import React, { useState, useEffect } from "react";
import {
  Grid,
  GridItem,
  Box,
  Flex,
  Heading,
  VStack,
  Select,
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
  Icon,
  Text,
  HStack,
  IconButton,
} from "@chakra-ui/react";
import {
  IconLayersSubtract,
  IconEdit,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { GetDataStratigraphy } from "../../API/APISKK";
import { useJobContext } from "../../../Context/JobContext";
import { useParams } from "react-router-dom";

const Stratigraphy = ({
  setWellStratigraphy,
  unittype,
  errorForms,
  codeAreaId,
  onData,
}) => {
  const { state, dispatch } = useJobContext();
  const { job_id } = useParams();
  const jobPlanExpDev =
    state.jobPlanExpDev?.job_plan?.well?.well_stratigraphy || [];
  const [stratInfo, setStratInfo] = useState(null);
  const [WellStratigraphy, setLocalWellStratigraphy] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [formData, setFormData] = useState({
    unit_type: unittype,
    depth_datum: "RT",
    depth: 0,
    stratigraphy_id: "",
    stratigraphy_name: "", // To store the human-readable stratigraphy name
  });
  const [editFormData, setEditFormData] = useState({
    unit_type: unittype,
    depth_datum: "RT",
    depth: 0,
    stratigraphy_id: "",
    stratigraphy_name: "",
  });

  useEffect(() => {
    job_id
      ? setWellStratigraphy((prev) => [...prev, ...jobPlanExpDev])
      : setWellStratigraphy([]);
  }, [job_id]);

  useEffect(() => {
    // onData(WellStratigraphy);
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: {
        well_stratigraphy: WellStratigraphy,
      },
    });
  }, [WellStratigraphy]);

  const selectType = [
    { name: "RT", value: "RT" },
    { name: "KB", value: "KB" },
    { name: "MSL", value: "MSL" },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "depth" ? parseFloat(value) : value,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: name === "depth" ? parseFloat(value) : value,
    }));
  };

  const handleAddStratigraphy = () => {
    if (!formData.stratigraphy_id || formData.depth === "") {
      alert("Please fill in all fields.");
      return;
    }

    const selectedStratInfo = stratInfo.find(
      (item) => item.id === formData.stratigraphy_id
    );

    // Add stratigraphy with the corresponding name (strat_unit_info)
    setLocalWellStratigraphy((prev) => [
      ...prev,
      {
        ...formData,
        stratigraphy_name: selectedStratInfo?.strat_unit_info || "",
        depth: parseFloat(formData.depth),
      },
    ]);

    // Reset form data after adding
    setFormData({ ...formData, stratigraphy_id: "", depth: 0 });
  };

  const handleEditRow = (index) => {
    setEditIndex(index);
    setEditFormData({ ...WellStratigraphy[index] });
  };

  const handleSaveEdit = () => {
    const selectedStratInfo = stratInfo.find(
      (item) => item.id === editFormData.stratigraphy_id
    );

    // Update stratigraphy with the new stratigraphy_name
    const updatedTable = [...WellStratigraphy];
    updatedTable[editIndex] = {
      ...editFormData,
      stratigraphy_name: selectedStratInfo?.strat_unit_info || "",
    };

    setLocalWellStratigraphy(updatedTable);
    setEditIndex(null);
  };

  const handleCancelEdit = () => {
    setEditIndex(null);
  };

  const handleDelete = (index) => {
    const updatedStratigraphy = WellStratigraphy.filter((_, i) => i !== index);
    setLocalWellStratigraphy(updatedStratigraphy);
  };

  // useEffect(() => {
  //   GetDataStratigraphy(codeAreaId).then((res) => {
  //     setStratInfo(res);
  //   });
  // }, [codeAreaId]);

  return (
    <Grid
      templateColumns="repeat(2, 1fr)"
      gap={3}
      mt={7}
      fontFamily={"Mulish"}
    >
      <GridItem colSpan={1} height="100%">
        <Box borderWidth="1px" borderRadius="lg" p={6}>
          <Flex justifyContent="space-between" alignItems="center" mb={6}>
            <Flex alignItems="center">
              <Icon
                as={IconLayersSubtract}
                boxSize={12}
                color="gray.800"
                mr={3}
              />
              <Flex flexDirection="column">
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  color="gray.700"
                  fontFamily={"Mulish"}
                >
                  Stratigraphy
                </Text>
                <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
                  Select Area First
                </Text>
              </Flex>
            </Flex>
            <Select
              width="auto"
              value={formData.depth_datum}
              onChange={(e) =>
                setFormData({ ...formData, depth_datum: e.target.value })
              }
            >
              {selectType.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.name}
                </option>
              ))}
            </Select>
          </Flex>
          <VStack spacing={4} align="stretch">
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem gap={2} colSpan={2}>
                <FormControl>
                  <FormLabel>Stratigraphy</FormLabel>
                  <Select
                    name="stratigraphy_id"
                    value={formData.stratigraphy_id}
                    onChange={handleInputChange}
                    placeholder="Select Area ID First"
                    isDisabled={codeAreaId === "" ? true : false}
                  >
                    {stratInfo?.map((item, index) => (
                      <option key={index} value={item.id}>
                        {item.strat_unit_info}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </GridItem>
              <GridItem colSpan={2}>
                <FormControl>
                  <FormLabel>Depth</FormLabel>
                  <InputGroup>
                    <Input
                      name="depth"
                      type="number"
                      value={formData.depth}
                      onChange={handleInputChange}
                      placeholder="Depth"
                      isDisabled={codeAreaId === "" ? true : false}
                    />
                    <InputRightAddon>
                      {unittype === "METRICS" ? "METER" : "FEET"}
                    </InputRightAddon>
                  </InputGroup>
                </FormControl>
              </GridItem>
            </Grid>
            <Flex justifyContent="flex-end">
              <Button colorScheme="blue" onClick={handleAddStratigraphy}>
                Add
              </Button>
            </Flex>
          </VStack>
        </Box>
      </GridItem>
      <Box borderWidth="1px" height="325px" borderRadius="lg" p={6}>
        <GridItem height="100%">
          {WellStratigraphy.length > 0 ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Depth</Th>
                  <Th>Stratigraphy Name</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {WellStratigraphy.map((row, index) => (
                  <Tr key={index}>
                    {editIndex === index ? (
                      <>
                        <Td>
                          <Input
                            name="depth"
                            type="number"
                            step="0.01"
                            value={editFormData.depth}
                            onChange={handleEditChange}
                          />
                        </Td>
                        <Td>
                          <Select
                            name="stratigraphy_id"
                            value={editFormData.stratigraphy_id}
                            onChange={(e) => {
                              const { name, value } = e.target;
                              const selectedStratInfo = stratInfo.find(
                                (item) => item.id === value
                              );
                              setEditFormData({
                                ...editFormData,
                                [name]: value,
                                stratigraphy_name:
                                  selectedStratInfo?.strat_unit_info || "",
                              });
                            }}
                          >
                            {stratInfo?.map((item, index) => (
                              <option key={index} value={item.id}>
                                {item.strat_unit_info}
                              </option>
                            ))}
                          </Select>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              icon={<Icon as={IconCheck} />}
                              colorScheme="green"
                              size="sm"
                              onClick={handleSaveEdit}
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
                        <Td>{row.depth}</Td>
                        <Td>{row.stratigraphy_name}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              icon={<Icon as={IconEdit} />}
                              colorScheme="blue"
                              size="sm"
                              onClick={() => handleEditRow(index)}
                              aria-label="Edit row"
                            />
                            <Button
                              colorScheme="red"
                              size="sm"
                              onClick={() => handleDelete(index)}
                            >
                              Delete
                            </Button>
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
              flexDirection="column"
              alignItems="center"
              height="100%"
            >
              <Heading fontFamily={"Mulish"}>Tidak Ada Data</Heading>
              {!!errorForms["job_plan.well.well_stratigraphy"] && (
                <Text color="red.500" fontSize="sm" mt={2}>
                  Well Stratigraphy cannot be empty.
                </Text>
              )}
            </Flex>
          )}
        </GridItem>
      </Box>
    </Grid>
  );
};

export default Stratigraphy;
