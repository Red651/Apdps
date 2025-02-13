import React from "react";
import { IconInfoCircle, IconCheck } from "@tabler/icons-react";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  ListItem,
  Text,
  UnorderedList,
  useToast,
  Button,
  Spinner,
  VStack,
  Select,
  Textarea,
} from "@chakra-ui/react";
import FormControlCard from "../../Components/FormControl";
import { useParams } from "react-router-dom";
import useFetchFinishOperations from "../FormHandling/Utils/useFetchFinishOperations";
import { getWellStatus } from "../../../API/APIKKKS"; // Import API untuk well_status
import { PatchFinishOperation } from "../../../API/PostKkks";

const FinishOperation = () => {
  const toast = useToast();
  const { job_id } = useParams();

  // Custom Hook untuk Fetch Data
  const { listFinishOperations = [], fetchError, isLoading } = useFetchFinishOperations(job_id); // Tambahkan default nilai []

  // State untuk Form Input
  const [formData, setFormData] = React.useState({
    date_finished: "",
    well_status: "",
    remarks: "",
  });

  // State untuk Well Status (Select Option)
  const [wellStatusOptions, setWellStatusOptions] = React.useState([]);
  const [isFetchingStatus, setIsFetchingStatus] = React.useState(true);

  // Fetch Well Status Options
  React.useEffect(() => {
    const fetchWellStatus = async () => {
      try {
        const response = await getWellStatus();
        setWellStatusOptions(response || []); // Pastikan data array diambil
      } catch (error) {
        console.error("Error fetching well status:", error);
      } finally {
        setIsFetchingStatus(false);
      }
    };

    fetchWellStatus();
  }, []);

  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmitFinish = async () => {
    setIsSubmitting(true);
    try {
      await PatchFinishOperation(job_id, formData);
      toast({
        title: "Finish Operation",
        description: "Operation finished successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to finish the operation.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDataEmpty = listFinishOperations.length === 0; // Tidak akan error karena ada default nilai []

  return (
    <Box p={6} minH="100vh">
      <VStack spacing={6} align="stretch">
        {/* Notifikasi */}
        <Box
          bg={isDataEmpty ? "green.100" : "red.100"}
          p={6}
          borderRadius="lg"
          shadow="md"
          borderLeft="4px solid"
          borderColor={isDataEmpty ? "green.500" : "red.500"}
        >
          <Flex alignItems="center" mb={4}>
            <Box color={isDataEmpty ? "green.500" : "red.500"} mr={3}>
              {isDataEmpty ? (
                <IconCheck size={24} />
              ) : (
                <IconInfoCircle size={24} />
              )}
            </Box>
            <Text
              fontSize="lg"
              fontWeight="bold"
              color={isDataEmpty ? "green.700" : "red.700"}
            >
              {isDataEmpty ? "All Data Added" : "Finish Operation"}
            </Text>
          </Flex>
          <Text mb={4}>
            {isDataEmpty
              ? "All required data have been successfully added!"
              : "These data are empty for now. You can add them later:"}
          </Text>
          {!isDataEmpty && isLoading ? (
            <Spinner color="red.500" />
          ) : fetchError ? (
            <Text color="red.500">Error fetching data.</Text>
          ) : (
            !isDataEmpty && (
              <UnorderedList>
                {listFinishOperations.map((item, index) => (
                  <ListItem key={index} color="gray.700">
                    {item}
                  </ListItem>
                ))}
              </UnorderedList>
            )
          )}
        </Box>

        {/* Form Input */}
        <Box bg="white" p={6} borderRadius="lg" shadow="sm">
          <Grid templateColumns="1fr auto" gap={4} alignItems="end">
            {/* Input Tanggal */}
            <GridItem colSpan={[2, 1]}>
              <FormControlCard
                labelForm="Date Finished"
                type="date"
                name="date_finished"
                value={formData.date_finished}
                handleChange={handleChange}
              />
            </GridItem>

            {/* Select Well Status */}
            <GridItem colSpan={[2, 1]}>
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Well Status
                </Text>
                {isFetchingStatus ? (
                  <Spinner color="teal.500" />
                ) : (
                  <Select
                    placeholder="Select Well Status"
                    name="well_status"
                    value={formData.well_status}
                    onChange={handleChange}
                  >
                    {wellStatusOptions.map((status, index) => (
                      <option key={index} value={status.value.toUpperCase()}>
                        {status.name}
                      </option>
                    ))}
                  </Select>
                )}
              </Box>
            </GridItem>

            {/* Input Remarks */}
            <GridItem colSpan={2}>
              <Box>
                <Text fontWeight="bold" mb={2}>
                  Remarks
                </Text>
                <Textarea
                  placeholder="Add any remarks here..."
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                  resize="vertical"
                />
              </Box>
            </GridItem>

            {/* Tombol Submit */}
            <GridItem>
              <Button
                onClick={handleSubmitFinish}
                colorScheme="teal"
                isDisabled={!formData.date_finished || !formData.well_status || isSubmitting}
                isLoading={isSubmitting}
                width="full"
              >
                Submit
              </Button>
            </GridItem>
          </Grid>
        </Box>
      </VStack>
    </Box>
  );
};

export default FinishOperation;
