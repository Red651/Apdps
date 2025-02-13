import React from "react";
import { Box, Flex, Text, Icon } from "@chakra-ui/react";
import { FaFileAlt } from "react-icons/fa";

const PerhitunganCard = ({
  number,
  label,
  subLabel,
  percentage,
  icon = FaFileAlt,
  bgIcon = "blue.100",
  iconColor = "blue.500",
}) => {
  return (
    <Box bg="white" boxShadow= '0px 1px 3px rgba(0, 0, 0, 0.10)' borderRadius="2xl" p={6} w="100%">
      <Flex alignItems="center" gap={6}>
        <Flex
          w={"100px"}
          height={"100px"}
          borderRadius="full"
          bg={bgIcon}
          justify="center"
          align="center"
        >
          <Icon as={icon} boxSize={10} color={iconColor} />
        </Flex>
        <Flex flexDirection="column" flex="1">
          <Text
            fontSize={48}
            fontFamily={"Mulish"}
            color="gray.600"
            fontWeight="semibold"
            lineHeight="shorter"
          >
            {number}
          </Text>
          <Text
            fontSize={20}
            fontFamily={"Mulish"}
            fontWeight="medium"
            textTransform="capitalize"
            color="gray.500"
          >
            {label}
          </Text>
          <Flex gap={2}>
            {percentage}
            <Text fontSize="m" color="gray.400" fontFamily={"Mulish"}>
              {subLabel}
            </Text>
          </Flex>
        </Flex>
      </Flex>
    </Box>
  );
};

export default PerhitunganCard;
