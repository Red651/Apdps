import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { FaFacebookF, FaTwitter } from 'react-icons/fa';


const Footer = () => {
  return (
    <Flex
      width="100%"  // Kurangi lebar sidebar
      justifyContent="space-between"
      alignItems="center"
      padding={"15px"}
      bg="white"
      border={"1px solid"}
      borderColor={"gray.200"}
      zIndex={1000}
      rounded={"2xl"}
      margin="0 auto"
    >
      <Text fontSize="sm" color="gray.500">
        © 2025 BPMA.
      </Text>
      <Flex gap={4}>
        <FaFacebookF color="gray" />
        <FaTwitter color="gray" />
      </Flex>
    </Flex>
  );
};


export default Footer;