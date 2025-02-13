// REPORT SRC/PAGE/PAGESKK/REPORT.JSX
import React, { useState } from 'react';
import { Box, Spinner, Flex } from '@chakra-ui/react';

const Report = ({ url }) => {
  const [isLoading, setIsLoading] = useState(true); // State for loading

  const handleLoad = () => {
    setIsLoading(false); // Change loading status after iframe finishes loading
  };

  return (
    <Box position="relative" width="100%" height="87vh">
      {isLoading && (
        <Flex
          justify="center"
          align="center"
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          background="rgba(255, 255, 255, 0.8)" // Create semi-transparent background
          zIndex="1"
        >
          <Spinner size="xl" speed="0.65s" thickness="4px" color="blue.500" /> {/* Loading animation */}
        </Flex>
      )}
      <Box
        as="iframe"
        src={url} // Use the passed url prop
        width="100%"
        height="87vh"
        border="none"
        onLoad={handleLoad} // Call handleLoad after iframe finishes loading
      />
    </Box>
  );
};

export default Report;