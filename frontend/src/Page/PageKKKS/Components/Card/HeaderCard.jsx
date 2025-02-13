import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import React from "react";

import { FaRegClock } from "react-icons/fa";

const HeaderCard = ({ children, title, subtitle, icon }) => {
  return (
    <Box bg="white" p={6} w={"100%"} borderRadius="2xl" border={"1px solid"} borderColor={"gray.200"}>
      <Flex alignItems="center" justifyContent="space-between" mb={4}>
        <Flex alignItems="center">
          <Icon as={icon} w={12} h={12} color="gray.800" mr={3} />
          {/* {icon} */}
          <Flex flexDirection={"column"}>
            <Text fontSize="xl" fontWeight="bold" color="gray.700">
              {title}
            </Text>
            <Text fontSize="md" color="gray.600">
              {subtitle}
            </Text>
          </Flex>
        </Flex>
      </Flex>

      {children}
    </Box>
  );
};

export default HeaderCard;
