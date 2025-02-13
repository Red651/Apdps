import React from "react";
import { Box, Flex, Text, Icon, Skeleton } from "@chakra-ui/react";
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
    <Box
      bg="white"
      borderRadius="2xl"
      p={6}
      w="100%"
      borderWidth="1px"
      borderColor={"gray.200"}
    >
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
          {number === null ? (
            <Skeleton height="3.8rem" width="10rem" />
          ) : (
            <Text
              fontSize={48}
              fontFamily={"Mulish"}
              color="gray.600"
              fontWeight="semibold"
              lineHeight="shorter"
            >
              {number}
            </Text>
          )}
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
