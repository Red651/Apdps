"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Text,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  VStack,
  Container,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom";
import { GetViewRig } from "../../../API/APISKK";

export default function RigDetailView() {
  const { rig_id } = useParams();
  const [rigData, setRigData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  useEffect(() => {
    const fetchRigData = async () => {
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

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Spinner size="xl" color="blue.500" thickness="4px" speed="0.65s" />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxW="container.md" centerContent>
        <Alert status="error" borderRadius="md" mt="4">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.md" centerContent>
      <Box
        w="full"
        bg={bgColor}
        boxShadow="lg"
        borderRadius="xl"
        p={8}
        mt={10}
        borderWidth={1}
        borderColor={borderColor}
      >
        <VStack spacing={6} align="stretch">
          <Heading as="h2" size="xl" textAlign="center" color="blue.600">
            Detail Rig
          </Heading>
          <Divider />
          {rigData ? (
            <>
              <DetailItem label="Nama Rig" value={rigData.rig_name} />
              <DetailItem label="Tipe Rig" value={rigData.rig_type} />
              <DetailItem
                label="Rig Horse Power"
                value={`${rigData.rig_horse_power} HP`}
              />
            </>
          ) : (
            <Text fontSize="lg" textAlign="center" color="gray.500">
              Data rig tidak ditemukan.
            </Text>
          )}
        </VStack>
      </Box>
    </Container>
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
