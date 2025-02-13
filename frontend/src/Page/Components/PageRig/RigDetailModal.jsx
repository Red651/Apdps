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
  Text,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { GetViewRig } from "../../API/APISKK";

export default function RigDetailModal({ isOpen, onClose, rig_id }) {
  const [rigData, setRigData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchRigData = async () => {
      if (!rig_id) return;
      setLoading(true);
      try {
        const response = await GetViewRig(rig_id);
        setRigData(response.data);
      } catch (err) {
        console.error("Error:", err.response || err.message);
        setError(err.response?.data?.message || "Gagal mengambil data Rig.");
      } finally {
        setLoading(false);
      }
    };

    fetchRigData();
  }, [rig_id]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" fontFamily={"Mulish"}>
      <ModalOverlay />
      <ModalContent fontFamily={"Mulish"}>
        <ModalHeader>Detail Rig</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center">
              <Spinner size="xl" color="blue.500" />
            </Box>
          ) : error ? (
            <Alert status="error" borderRadius="md" mt="4">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <Box bg={bgColor} p={4} borderWidth={1} borderColor={borderColor}>
              <VStack spacing={6} align="stretch">
                <DetailItem
                  label="Rig Name"
                  value={rigData?.rig_name || "N/A"}
                />
                <DetailItem
                  label="Rig Type"
                  value={rigData?.rig_type || "N/A"}
                />
                <DetailItem
                  label="Rig Horse Power"
                  value={`${rigData?.rig_horse_power || "N/A"} HP`}
                />
              </VStack>
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

function DetailItem({ label, value }) {
  return (
    <Box>
      <Text fontWeight="bold" fontSize="lg" color="gray.600" mb={1}>
        {label}:
      </Text>
      <Text fontSize="md" bg="gray.100" p={2} borderRadius="md">
        {value}
      </Text>
    </Box>
  );
}
