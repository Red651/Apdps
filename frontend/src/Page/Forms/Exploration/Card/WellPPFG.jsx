import React, { useState, useRef } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Text,
  InputRightAddon,
  InputGroup,
  Flex,
  Icon,
} from "@chakra-ui/react";

import {IconGraph} from "@tabler/icons-react";

const WellPorePressureForm = () => {
  const [formData, setFormData] = useState({
    depth: "",
    temperature: "",
    porosity: "",
    fluidDensity: "",
  });
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);
  const toast = useToast();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the data to a server or perform calculations
    
    
    toast({
      title: "Form Submitted",
      description:
        "Your well pore pressure prediction data and file have been submitted.",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
    // Reset form after submission
    setFormData({
      depth: "",
      temperature: "",
      porosity: "",
      fluidDensity: "",
    });
    setFileName("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Box margin="auto" mt={6} borderWidth="1px" borderRadius="lg" p={5} fontFamily={"Mulish"}>
      <Flex alignItems="center" mb={6}>
        <Icon as={IconGraph} boxSize={12} color="gray.800" mr={3} />
        <Flex flexDirection={"column"}>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="gray.700"
            fontFamily={"Mulish"}
          >
            {"Well Pore Pressure Prediction"}
          </Text>
          <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
            {"subtitle"}
          </Text>
        </Flex>
      </Flex>
      <form onSubmit={handleSubmit} >
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Depth (m)</FormLabel>
            <InputGroup>
              <Input
                type="number"
                name="depth"
                value={formData.depth}
                onChange={handleInputChange}
                placeholder="Enter depth"
              />
              <InputRightAddon>m</InputRightAddon>
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Temperature (°C)</FormLabel>
            <InputGroup>
              <Input
                type="number"
                name="temperature"
                value={formData.temperature}
                onChange={handleInputChange}
                placeholder="Enter temperature"
              />
              <InputRightAddon>°C</InputRightAddon>
            </InputGroup>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Porosity (%)</FormLabel>
            <InputGroup>
              <Input
                type="number"
                name="porosity"
                value={formData.porosity}
                onChange={handleInputChange}
                placeholder="Enter porosity"
              />
              <InputRightAddon>%</InputRightAddon>
            </InputGroup>
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Fluid Density (kg/m³)</FormLabel>
            <InputGroup>
              <Input
                type="number"
                name="fluidDensity"
                value={formData.fluidDensity}
                onChange={handleInputChange}
                placeholder="Enter fluid density"
              />
              <InputRightAddon>kg/m³</InputRightAddon>
            </InputGroup>
          </FormControl>
          <FormControl>
            <FormLabel>Upload File</FormLabel>
            <Input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".txt,.csv,.xlsx"
            />
            {fileName && <Text mt={2}>File selected: {fileName}</Text>}
          </FormControl>
          <Button type="submit" colorScheme="blue" width="full">
            Submit
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default WellPorePressureForm;
