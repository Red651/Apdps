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
} from "@chakra-ui/react";
import {IconWorldUpload} from '@tabler/icons-react';
const Seismic = ({handleChange, formData}) => {
  return (
    <VStack spacing={6} align="stretch" fontFamily={"Mulish"} mt={5}>
      <Box borderWidth="1px" borderRadius="lg" p={6}>
        <Flex alignItems="center">
          <Icon as={IconWorldUpload} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              {"Seismic"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {"subtitle"}
            </Text>
          </Flex>
        </Flex>
        <VStack spacing={4} align="stretch" mt={5}>
          <HStack spacing={4}>
            <FormControl>
              <FormLabel>Seismic Line Name</FormLabel>
              <Input
                name="seismic_line_name"
                placeholder="Seismic Line Name"
              />
            </FormControl>
          </HStack>
        </VStack>
      </Box>

    </VStack>
  );
};

export default Seismic;
