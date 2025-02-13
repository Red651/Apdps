import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Flex,
  Text,
  Spinner, // Import Spinner dari Chakra UI
} from '@chakra-ui/react';
import { getJobInfo } from "./../../../API/APISKK"; 
import BarChartComponent from "./3DBarchart";

const ModalRealisasi = ({ isOpen, onClose, job_type, title, date }) => {
  
  const jobType = (job_type?.toLowerCase() || '').replace(/\s+/g, '');
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedData = await getJobInfo(jobType);
        if (isMounted) {
          setData(fetchedData.data);
        }
      } catch (error) {
        if (isMounted) {
          setError("Error fetching data. Please try again.");
          console.error("Error fetching data:", error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    if (jobType) {
      fetchData();
    }

    return () => {
      isMounted = false;
    };
  }, [jobType]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside"> {/* Tambahkan scrollBehavior="inside" */}
      <ModalOverlay />
      <ModalContent borderRadius="lg" p={4}>
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <Box ml={3}>
              <Text fontSize="xl" fontWeight="bold" color="gray.700" fontFamily={"Mulish"}>
                {title}
              </Text>
              <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
                {date}
              </Text>
            </Box>
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody overflowY="auto"> {/* Membuat body scrollable */}
          {isLoading ? (
            <Flex justify="center" align="center" height="200px"> {/* Memposisikan animasi loading */}
              <Spinner size="xl" speed="0.65s" thickness="4px" color="blue.500" /> {/* Animasi loading */}
            </Flex>
          ) : error ? (
            <Text color="red.500" textAlign="center">{error}</Text>  // Pesan error
          ) : (
            <Flex direction="column" gap={6}>
              <BarChartComponent
                datas={data?.month?.data}
                layouts={{
                  ...data?.month?.layout,
                  autosize: true,
                  width: undefined, 
                  responsive: true, 
                }}
                style={{ width: "100%", height: "100" }}
                useResizeHandler={true} 
              />
              <BarChartComponent
                datas={data?.week?.data}
                layouts={{
                  ...data?.week?.layout,
                  autosize: true,
                  width: undefined, 
                  responsive: true, 
                }}
                style={{ width: "100%", height: "100" }}
                useResizeHandler={true} 
              />
            </Flex>
          )}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalRealisasi;
