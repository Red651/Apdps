import { Box, Flex, Icon, Text } from "@chakra-ui/react";
import React from "react";
import { FaRegClock } from "react-icons/fa";

const HeaderCard = ({children, title ,subtitle, icon}) => {
  return (
    <Box bg="white" p={6} w={'100%'} borderRadius="2xl" boxShadow= '0px 1px 2px rgba(0, 0, 0, 0.10)'>
      <Flex alignItems="center" justifyContent="space-between" mb={4}>
        <Flex alignItems="center">
          <Icon as={icon} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text fontSize="xl" fontWeight="bold" color="gray.700" fontFamily={"Mulish"}>
              {title}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
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
