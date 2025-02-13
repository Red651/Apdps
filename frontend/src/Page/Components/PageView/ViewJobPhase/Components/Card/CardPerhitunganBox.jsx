import React from "react";
import { Box, Flex, Text, Icon } from "@chakra-ui/react";
import { FaFileAlt } from "react-icons/fa";

const PerhitunganCard = ({
  percentage,
  number,
  label,
  subLabel,
  icon = FaFileAlt,
  bgIcon = "blue.100",
  iconColor = "blue.500",
}) => {
  return (
    <Box bg="white" boxShadow="md" borderRadius="2xl" p={4} width={"100%"} fontFamily={"Mulish"}>
      <Flex alignItems="center" mb={2} gap={5}>
        <Flex borderRadius="full" bg={bgIcon} p={6} mr={2}>
          <Icon as={icon} boxSize={16} color={iconColor} />
        </Flex>
        <Flex flexDirection={"column"}>
          <Text
            fontSize="2.5rem"
            color={"gray.600"}
            fontWeight="bold"
            lineHeight="1"
          >
            {number}
          </Text>
          <Text fontSize="1.5rem" fontWeight="600" textTransform={"uppercase"} color="gray.500">
            {label}
          </Text>
          <Text fontSize="md" color="gray.500">
        {subLabel}
      </Text>
        </Flex>
      </Flex>
      <Flex gap={4}>
      {percentage}
      </Flex>
    </Box>
  );
};

export default PerhitunganCard;
