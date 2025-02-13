import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import { FaFacebookF, FaTwitter } from 'react-icons/fa';

const Footer = () => {
  return (
    <Flex
      as="footer"
      width="100%"
      justifyContent="space-between"
      alignItems="center"
      p={35}
      bg="white"
      borderRadius="2xl"
      boxShadow="0 -2px 10px rgba(0, 0, 0, 0.1)"
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
