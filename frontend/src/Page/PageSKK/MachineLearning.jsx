import React, { useState } from 'react';
import { Box, Spinner, Flex, Text } from '@chakra-ui/react';
import BreadcrumbCard from '../Components/Card/Breadcrumb';

const Map = () => {
  const [isLoading, setIsLoading] = useState(true); // State untuk loading

  const handleLoad = () => {
    setIsLoading(false); // Ubah status loading setelah iframe selesai dimuat
  };

  return (
    <Flex direction="column" gap={6} position="relative" width="100%" height="87vh">
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        Data Analytics & Machine Learning
      </Text>
      <BreadcrumbCard />
      {isLoading && (
        <Flex
          justify="center"
          align="center"
          position="absolute"
          top="0"
          left="0"
          width="100%"
          height="100%"
          background="rgba(255, 255, 255, 0.8)" // Membuat background semi-transparan
          zIndex="1"
        >
          <Spinner size="xl" speed="0.65s" thickness="4px" color="blue.500" /> {/* Animasi loading */}
        </Flex>
      )}
      <Box
        as="iframe"
        src={import.meta.env.VITE_ML_URL} // Ganti dengan URL yang ingin ditampilkan
        width="100%"
        height="87vh"
        border="none"
        onLoad={handleLoad} // Panggil handleLoad setelah iframe selesai dimuat
      />
    </Flex>
  );
};

export default Map;
