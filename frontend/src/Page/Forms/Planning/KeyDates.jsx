import {
  Box,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Input,
  Text,
  VStack,
  FormErrorMessage,
} from "@chakra-ui/react";
import { IconCalendarDue } from "@tabler/icons-react";
import React from "react";
import { JobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN_WELL } from "../../../Reducer/reducer";
import { useParams } from "react-router-dom";
import HeaderForm from "../../Components/Form/LabelForm";

const KeyDates = ({ errorForms = {},initialData=null,TypeSubmit="create" }) => {
  const { state, dispatch } = React.useContext(JobContext);
  const jobPlanExpDev = state?.jobPlanExpDev?.job_plan?.well || {};
  const initialStartDate = state?.jobPlanExpDev?.job_plan || {};
  //
  const { job_id } = useParams();
  //
  const [formData, setFormData] = React.useState({
    spud_date: initialStartDate.start_date || null,
    final_drill_date: null,
    completion_date: null,
    // additional fields
    abandonment_date: null,
    rig_on_site_date: null,
    rig_release_date: null,
  });

  React.useEffect(() => {
    if (TypeSubmit === "update") {
      setFormData({
        spud_date: initialData.spud_date || null,
        final_drill_date: initialData.final_drill_date || null,
        completion_date: initialData.completion_date || null,
        // additional fields
        abandonment_date: initialData.abandonment_date || null,
        rig_on_site_date: initialData.rig_on_site_date || null,
        rig_release_date: initialData.rig_release_date || null,
      });
    }
  }, [TypeSubmit]);

  React.useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      spud_date: initialStartDate.start_date || null,
      final_drill_date: initialStartDate.end_date || null,
    }));
  }, [initialStartDate.start_date, initialStartDate.end_date]);
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let values;
    if (type === "number") {
      values = value.includes(".")
        ? parseFloat(value)
        : parseInt(value, 10) || 0;
    } else if (type === "text") {
      values = value;
    } else {
      values = value;
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: values,
    }));
  };

  React.useEffect(() => {
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: formData,
    });
  }, [formData]);

  return (
    <VStack spacing={6} align="stretch" fontFamily={"Mulish"} mt={5}>
      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <Flex alignItems="center">
          <Icon as={IconCalendarDue} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              {"Key Dates"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {"subtitle"}
            </Text>
          </Flex>
        </Flex>
        <VStack spacing={4} align="stretch" mt={5}>
          <HStack spacing={4}>
            <FormControl isInvalid={!!errorForms["spud_date"]}>
              <HeaderForm
                title={"Spud Date"}
                desc={
                  "Date the drilling operations commenced on the well. The first day hole is made."
                }
              />
              <Input
                name="spud_date"
                type="date"
                placeholder="Spud Date"
                value={formData.spud_date}
                onChange={handleChange}
              />
              {errorForms["spud_date"] && (
                <FormErrorMessage>
                  Rotary Table Elevation is required
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl
              isInvalid={!!errorForms["final_drill_date"]}
            >
              <HeaderForm
                title={"Final Drill Date"}
                desc={
                  "Date the drilling operations for the well were finalized."
                }
              />
              <Input
                name="final_drill_date"
                type="date"
                value={formData.final_drill_date}
                onChange={handleChange}
                min={formData.spud_date}
                isDisabled={!formData.spud_date}
                placeholder="Final Drill Date"
              />
              {errorForms["final_drill_date"] && (
                <FormErrorMessage>
                  Final Drill Date is required
                </FormErrorMessage>
              )}
            </FormControl>
          </HStack>
          <HStack spacing={4}>
            <FormControl
              isInvalid={!!errorForms["completion_date"]}
            >
              <HeaderForm
                title={"Completion Date"}
                desc={
                  "Date on the official filing or completion report indicating the well is established as ready to produce, inject or abandon."
                }
              />
              <Input
                type="date"
                value={formData.completion_date}
                name="completion_date"
                placeholder="Completion Date"
                onChange={handleChange}
              />
              {errorForms["completion_date"] && (
                <FormErrorMessage>Completion Date is required</FormErrorMessage>
              )}
            </FormControl>
            <FormControl
              isInvalid={!!errorForms["abandonment_date"]}
            >
              <HeaderForm
                title={"Abandonment Date"}
                desc={"Date the well was plugged and permanently abandoned."}
              />
              <Input
                name="abandonment_date"
                type="date"
                placeholder="Abandonment Date"
                value={formData.abandonment_date}
                onChange={handleChange}
              />
              {errorForms["abandonment_date"] && (
                <FormErrorMessage>
                  Abandonment Date is required
                </FormErrorMessage>
              )}
            </FormControl>
          </HStack>
          <HStack>
            <FormControl
              isInvalid={!!errorForms["rig_on_site_date"]}
            >
              <HeaderForm
                title={"Rig On Site Date"}
                desc={
                  "The date that the drilling rig is moved onto the well site."
                }
              />
              <Input
                name="rig_on_site_date"
                type="date"
                placeholder="Rig On Site Date"
                value={formData.rig_on_site_date}
                onChange={handleChange}
              />
              {errorForms["rig_on_site_date"] && (
                <FormErrorMessage>
                  {" "}
                  Rig On Site Date is required
                </FormErrorMessage>
              )}
            </FormControl>
            <FormControl
              isInvalid={!!errorForms["rig_release_date"]}
            >
              <HeaderForm
                title={"Rig Release Date"}
                desc={
                  "Date the drilling rig can be released from operations and moved from the well site as specified in the contract."
                }
              />
              <Input
                name="rig_release_date"
                type="date"
                placeholder="Rig Off Site Date"
                value={formData.rig_release_date}
                onChange={handleChange}
              />
              {errorForms["rig_release_date"] && (
                <FormErrorMessage>
                  Rig Off Site Date is required
                </FormErrorMessage>
              )}
            </FormControl>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
};

export default KeyDates;
