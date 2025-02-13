import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  Table,
  Tbody,
  Text,
  Th,
  Thead,
  Tr,
  Td,
  Select,
  Icon,
  useToast,
  FormErrorMessage,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import {
  IconTrash,
  IconEdit,
  IconCheck,
  IconBriefcase,
} from "@tabler/icons-react";
import { JobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN } from "../../../Reducer/reducer";
import { useParams } from "react-router-dom";

const WorkBreakdownForm = ({ onAddItem, unitType = "METRICS" }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    phase: "",
    depth_in: "",
    depth_out: "",
    unit_type: unitType,
    operation_days: "",
    depth_datum: "RT",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validasi field tidak boleh kosong
    if (!formData.phase.trim()) {
      newErrors.phase = "Phase is required";
    }

    if (!formData.depth_in) {
      newErrors.depth_in = "Depth In is required";
    } else if (parseFloat(formData.depth_in) < 0) {
      newErrors.depth_in = "Depth In cannot be negative";
    }

    if (!formData.depth_out) {
      newErrors.depth_out = "Depth Out is required";
    } else if (parseFloat(formData.depth_out) < 0) {
      newErrors.depth_out = "Depth Out cannot be negative";
    }

    if (!formData.operation_days) {
      newErrors.operation_days = "Operation Days is required";
    } else if (parseFloat(formData.operation_days) <= 0) {
      newErrors.operation_days = "Operation Days must be greater than 0";
    }

    // Validasi tambahan untuk memastikan depth_out lebih besar dari depth_in
    if (
      formData.depth_in &&
      formData.depth_out &&
      parseFloat(formData.depth_out) <= parseFloat(formData.depth_in)
    ) {
      newErrors.depth_out = "Depth Out must be greater than Depth In";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" && value !== "" ? value : value;
    setFormData((prevData) => ({ ...prevData, [name]: processedValue }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleAdd = () => {
    if (validateForm()) {
      // Convert string values to numbers for numeric fields
      const processedData = {
        ...formData,
        depth_in: parseFloat(formData.depth_in),
        depth_out: parseFloat(formData.depth_out),
        operation_days: parseFloat(formData.operation_days),
      };

      onAddItem(processedData);
      setFormData({
        phase: "",
        depth_in: "",
        depth_out: "",
        unit_type: unitType,
        operation_days: "",
        depth_datum: "RT",
      });
      setErrors({});
    }
  };

  return (
    <Box borderWidth="1px" fontFamily={"Mulish"} borderRadius="lg" p={4} mb={4} width="100%">
      <Flex alignItems="center" justifyContent="space-between" mb={6}>
        <Flex alignItems="center">
          <Icon as={IconBriefcase} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection="column">
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              Job Operation Days
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              Add new job operation details
            </Text>
          </Flex>
        </Flex>
        <FormControl maxW="150px">
          <Select
            name="depth_datum"
            w="auto"
            value={formData.depth_datum}
            onChange={handleInputChange}
          >
            <option value="RT">RT</option>
            <option value="KB">KB</option>
            <option value="MSL">MSL</option>
          </Select>
        </FormControl>
      </Flex>

      <FormControl mt={4} isInvalid={errors.phase}>
        <FormLabel>
          Phase{" "}
          <Text as="span" color="red">
            *
          </Text>
        </FormLabel>
        <Input
          name="phase"
          value={formData.phase}
          onChange={handleInputChange}
          placeholder="Enter phase name"
        />
        <FormErrorMessage>{errors.phase}</FormErrorMessage>
      </FormControl>

      <FormControl mt={4} isInvalid={errors.depth_in}>
        <FormLabel>
          Depth In{" "}
          <Text as="span" color="red">
            *
          </Text>
        </FormLabel>
        <InputGroup>
          <Input
            name="depth_in"
            type="number"
            placeholder="Enter depth in"
            value={formData.depth_in}
            onChange={handleInputChange}
          />
          <InputRightAddon>
            {unitType === "METRICS" ? "M" : "FEET"}
          </InputRightAddon>
        </InputGroup>
        <FormErrorMessage>{errors.depth_in}</FormErrorMessage>
      </FormControl>

      <FormControl mt={4} isInvalid={errors.depth_out}>
        <FormLabel>
          Depth Out{" "}
          <Text as="span" color="red">
            *
          </Text>
        </FormLabel>
        <InputGroup>
          <Input
            name="depth_out"
            type="number"
            placeholder="Enter depth out"
            value={formData.depth_out}
            onChange={handleInputChange}
          />
          <InputRightAddon>
            {unitType === "METRICS" ? "M" : "FEET"}
          </InputRightAddon>
        </InputGroup>
        <FormErrorMessage>{errors.depth_out}</FormErrorMessage>
      </FormControl>

      <FormControl mt={4} isInvalid={errors.operation_days}>
        <FormLabel>
          Operation Days{" "}
          <Text as="span" color="red">
            *
          </Text>
        </FormLabel>
        <InputGroup>
          <Input
            name="operation_days"
            type="number"
            placeholder="Enter operation days"
            value={formData.operation_days}
            onChange={handleInputChange}
          />
          <InputRightAddon>DAYS</InputRightAddon>
        </InputGroup>
        <FormErrorMessage>{errors.operation_days}</FormErrorMessage>
      </FormControl>

      <Button
        onClick={handleAdd}
        colorScheme="blue"
        mt={6}
        width="full"
        size="lg"
      >
        Add Operation
      </Button>
    </Box>
  );
};

const JobOperationDays = ({
  handleChangeJobPlan = (e) => console.log(e),
  ondata,
  unitType = "METRICS", 
  initialData = null,
  TypeSubmit = "create",
}) => {
  const { job_id } = useParams();
  const { state, dispatch } = React.useContext(JobContext);
  const [items, setItems] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);
  const [editFormData, setEditFormData] = useState({});
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = React.useRef();
  const toast = useToast();
  const initialDataJobDays =
    state.jobPlanExpDev?.job_plan?.job_operation_days || [];
  // 
//  
  React.useEffect(() => {
    (TypeSubmit === "update" && initialData)
      ? setItems((prev) => [...prev, ...initialData.job_plan.job_operation_days])
      : setItems((prev) => []);
  }, [TypeSubmit]);

  const handleAddItem = (newItem) => {
    setItems((prevItems) => [...prevItems, newItem]);
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditFormData({ ...items[index] });
  };

  const validateEditForm = (data) => {
    const errors = {};

    if (!data.phase?.trim()) {
      errors.phase = "Phase is required";
    }

    if (!data.depth_in) {
      errors.depth_in = "Depth In is required";
    } else if (parseFloat(data.depth_in) < 0) {
      errors.depth_in = "Depth In cannot be negative";
    }

    if (!data.depth_out) {
      errors.depth_out = "Depth Out is required";
    } else if (parseFloat(data.depth_out) < 0) {
      errors.depth_out = "Depth Out cannot be negative";
    }

    if (parseFloat(data.depth_out) <= parseFloat(data.depth_in)) {
      errors.depth_out = "Depth Out must be greater than Depth In";
    }

    if (!data.operation_days) {
      errors.operation_days = "Operation Days is required";
    } else if (parseFloat(data.operation_days) <= 0) {
      errors.operation_days = "Operation Days must be greater than 0";
    }

    return errors;
  };

  const handleSave = (index) => {
    const validationErrors = validateEditForm(editFormData);

    if (Object.keys(validationErrors).length === 0) {
      const updatedItems = [...items];
      updatedItems[index] = {
        ...editFormData,
        depth_in: parseFloat(editFormData.depth_in),
        depth_out: parseFloat(editFormData.depth_out),
        operation_days: parseFloat(editFormData.operation_days),
      };
      setItems(updatedItems);
      setEditIndex(-1);
    } else {
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    const processedValue = type === "number" ? value : value;
    setEditFormData((prev) => ({ ...prev, [name]: processedValue }));
  };

  const handleDeleteConfirm = () => {};

  const handleDeleteItem = (deleteIndex) => {
    setItems((prevItems) => prevItems.filter((_, idx) => idx !== deleteIndex));

    // toast({
    //   title: "Success",
    //   description: "Data has been deleted successfully",
    //   status: "success",
    //   duration: 3000,
    //   isClosable: true,
    //   position: "top-right",
    // });
  };
  // 
  useEffect(() => {
    // handleChangeJobPlan(items);
    const jobOperationDays = items.length === 0 ? null : items;

    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN,
      payload: {
        job_operation_days: jobOperationDays,
      },
    });
  }, [items]);

  return (
    <Flex direction="column" mt={4}>
      <Flex>
        <Box flex={1} mr={4}>
          <WorkBreakdownForm onAddItem={handleAddItem} unitType={unitType} />
        </Box>
        <Box
          flex={1}
          maxHeight="600px"
          overflowY="auto"
          borderWidth="1px"
          borderRadius="lg"
          p={4}
          boxShadow="sm"
        >
          <Table variant="simple">
            <Thead position="sticky" top={0} bg="white">
              <Tr>
                <Th>Phase</Th>
                <Th>Depth In ({unitType === "METRICS" ? "M" : "FEET"})</Th>
                <Th>Depth Out ({unitType === "METRICS" ? "M" : "FEET"})</Th>
                <Th>Operation Days</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.length === 0 ? (
                <Tr>
                  <Td colSpan={5} textAlign="center" py={4}>
                    No operations added yet
                  </Td>
                </Tr>
              ) : (
                items.map((item, index) => (
                  <Tr key={index}>
                    {editIndex === index ? (
                      <>
                        <Td>
                          <Input
                            name="phase"
                            value={editFormData.phase}
                            onChange={handleEditChange}
                          />
                        </Td>
                        <Td>
                          <Input
                            name="depth_in"
                            type="number"
                            value={editFormData.depth_in}
                            onChange={handleEditChange}
                          />
                        </Td>
                        <Td>
                          <Input
                            name="depth_out"
                            type="number"
                            value={editFormData.depth_out}
                            onChange={handleEditChange}
                          />
                        </Td>
                        <Td>
                          <Input
                            name="operation_days"
                            type="number"
                            value={editFormData.operation_days}
                            onChange={handleEditChange}
                          />
                        </Td>
                        <Td>
                          <Button
                            onClick={() => handleSave(index)}
                            colorScheme="green"
                            size="sm"
                          >
                            <Icon as={IconCheck} />
                          </Button>
                        </Td>
                      </>
                    ) : (
                      <>
                        <Td>{item.phase}</Td>
                        <Td>{item.depth_in}</Td>
                        <Td>{item.depth_out}</Td>
                        <Td>{item.operation_days}</Td>
                        <Td>
                          <Button
                            onClick={() => handleEdit(index)}
                            colorScheme="blue"
                            mr={2}
                            size="sm"
                          >
                            <Icon as={IconEdit} />
                          </Button>
                          <Button
                            onClick={() => handleDeleteItem(index)}
                            colorScheme="red"
                            size="sm"
                          >
                            <Icon as={IconTrash} />
                          </Button>
                        </Td>
                      </>
                    )}
                  </Tr>
                ))
              )}
            </Tbody>
          </Table>
        </Box>
      </Flex>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Operation
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this operation? This action cannot
              be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeleteIndex(null);
                }}
              >
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteConfirm} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
};

export default JobOperationDays;
