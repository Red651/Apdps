import React from "react";
import { Box, Text, Flex, Grid, GridItem } from "@chakra-ui/react";
import { AiOutlineClockCircle } from "react-icons/ai";

const HeaderTitle = ({ icon, title, subtitle,children }) => {
  
  return (
    <div>
      <Box bg="white" mb={4} p={4} borderRadius="md" boxShadow="md">
        <Grid mb={4} templateColumns="repeat(2, 1fr)" gap={4}>
          <Flex alignItems="center">
            <Flex mx={3}>
              <AiOutlineClockCircle size={40}  color="gray.500" />
            </Flex>
            <Flex flexDirection={"column"}>
              <Text ml={2} fontWeight="bold" fontSize="24px">
                {title}
              </Text>
              <Text ml={2} color="gray.800" fontSize="20px">
                {subtitle}
              </Text>
            </Flex>
          </Flex>
        </Grid>
        {children}
      </Box>
    </div>
  );
};

export default HeaderTitle;
