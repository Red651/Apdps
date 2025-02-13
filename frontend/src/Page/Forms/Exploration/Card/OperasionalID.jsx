import React, { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Divider,
  InputRightAddon,
  InputGroup,
  Icon,
  Flex,
  Text,
} from "@chakra-ui/react";
import { IconBriefcase } from "@tabler/icons-react";

const ProposedJob = ({ onData }) => {
  const [formData, setFormData] = useState({
    area_id: "",
    field_id: "",
    contract_type: "COST-RECOVERY",
    afe_number: "",
    wpb_year: 0,
    job_plan: {
      start_date: "",
      end_date: "",
      total_budget: 0,
      rig_name: null,
      rig_type: null,
      rig_horse_power: 0,
    },
  });

  // Send formData to parent component whenever formData changes
  useEffect(() => {
    onData(formData);
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    let processedValue;

    // Periksa tipe input
    if (type === "number") {
      // Jika input tipe number, periksa apakah ada titik desimal untuk menentukan apakah itu float
      processedValue = value.includes(".")
        ? parseFloat(value)
        : parseInt(value, 10);

      // Jika value tidak valid atau kosong, default ke 0
      if (isNaN(processedValue)) {
        processedValue = 0;
      }
    } else {
      // Jika tipe selain number, anggap sebagai string
      processedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleRig = (e) => {
    const { name, value, type } = e.target;

    let processedValue;

    // Periksa tipe input
    if (type === "number") {
      // Jika input tipe number, periksa apakah ada titik desimal untuk menentukan apakah itu float
      processedValue = value.includes(".")
        ? parseFloat(value)
        : parseInt(value, 10);

      // Jika value tidak valid atau kosong, default ke 0
      if (isNaN(processedValue)) {
        processedValue = 0;
      }
    } else {
      // Jika tipe selain number, anggap sebagai string
      processedValue = value;
    }

    setFormData((prev) => ({
      ...prev,
      job_plan: {
        ...prev.job_plan,
        [name]: processedValue,
      },
    }));
  };
  const handleDateChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      job_plan: {
        ...prev.job_plan,
        [name]: value,
      },
    }));
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={6} fontFamily={"Mulish"}>
      <Flex alignItems="center" mb={6}>
        <Icon as={IconBriefcase} boxSize={12} color="gray.800" mr={3} />
        <Flex flexDirection={"column"}>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="gray.700"
            fontFamily={"Mulish"}
          >
            {"Proposed Job"}
          </Text>
          <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
            {"subtitle"}
          </Text>
        </Flex>
      </Flex>
      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Area</FormLabel>
            <Select placeholder="Select Area"></Select>
          </FormControl>
          <FormControl>
            <FormLabel>Field</FormLabel>
            <Select placeholder="Select Field"></Select>
          </FormControl>
        </HStack>
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Contract Type</FormLabel>
            <Select
              name="contract_type"
              value={formData.contract_type}
              onChange={handleChange}
            >
              <option value="COST-RECOVERY">COST-RECOVERY</option>
              <option value="GROSS-SPLIT">GROSS-SPLIT</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>AFE Number</FormLabel>
            <Input
              name="afe_number"
              value={formData.afe_number}
              onChange={handleChange}
              placeholder="AFE Number"
            />
          </FormControl>
        </HStack>
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>WPB Year</FormLabel>
            <InputGroup>
              <Input
                name="wpb_year"
                type="number"
                value={formData.wpb_year}
                onChange={handleChange}
                placeholder="WPB Year"
              />
              <InputRightAddon>m</InputRightAddon>
            </InputGroup>
          </FormControl>
        </HStack>
      </VStack>
      <Divider my={10} borderWidth="1px" borderColor={"gray.200"} />

      <VStack spacing={4} align="stretch">
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Start Date</FormLabel>
            <Input
              name="start_date"
              type="date"
              value={formData.job_plan.start_date}
              onChange={handleDateChange}
              placeholder="Start Date"
            />
          </FormControl>
          <FormControl>
            <FormLabel>End Date</FormLabel>
            <Input
              name="end_date"
              type="date"
              min={formData.job_plan.start_date}
              value={formData.job_plan.end_date}
              disabled={formData.job_plan.start_date ? false : true}
              onChange={handleDateChange}
              placeholder="End Date"
            />
          </FormControl>
        </HStack>
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Rig Type</FormLabel>
            <Select
              name="rig_type"
              value={formData.job_plan.rig_type}
              onChange={handleRig}
            >
              <option value="JACK-UP">JACK-UP</option>
              <option value="GROSS-SPLIT">GROSS-SPLIT</option>
              <option value="FLOATER">FLOATER</option>
              <option value="SEMI-SUBMERSIBLE">SEMI-SUBMERSIBLE</option>
              <option value="DRILLSHIP">DRILLSHIP</option>
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Rig Name</FormLabel>
            <Input
              name="rig_name"
              type="text"
              value={formData.job_plan.rig_name}
              onChange={handleRig}
              placeholder="Rig Name"
            />
          </FormControl>
        </HStack>
        <HStack spacing={4}>
          <FormControl>
            <FormLabel>Rig Horse Power</FormLabel>
            <InputGroup>
              <Input
                name="rig_horse_power"
                type="number"
                value={formData.job_plan.rig_horse_power}
                onChange={handleRig}
                placeholder="Rig Horse Power"
              />
              <InputRightAddon>m</InputRightAddon>
            </InputGroup>
          </FormControl>
        </HStack>
      </VStack>
    </Box>
  );
};

export default ProposedJob;
