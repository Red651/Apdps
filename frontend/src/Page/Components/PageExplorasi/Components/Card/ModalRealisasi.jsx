import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  IconButton,
  Box,
  Flex,
  Text,
} from '@chakra-ui/react';
import { FiClock } from 'react-icons/fi';
import { AiOutlineLink } from 'react-icons/ai';
import Plot from 'react-plotly.js';

const ModalRealisasi = ({ isOpen, onClose, link, title, date, chartsData }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <ModalOverlay />
      <ModalContent borderRadius="lg" p={4}>
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <Flex align="center">
              <FiClock size={20} />
              <Box ml={3}>
                <Text fontSize="lg" fontWeight="bold">
                  {title}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {date}
                </Text>
              </Box>
            </Flex>
            <IconButton
              as="a"
              href={link}
              target="_blank"
              icon={<AiOutlineLink />}
              aria-label="Open Link"
              variant="ghost"
            />
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Flex direction="column" gap={6}>
            {chartsData.map((chart, index) => (
              <Plot
                key={index}
                data={chart.data}
                layout={chart.layout}
                style={{ width: '100%', height: 'auto' }}
              />
            ))}
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ModalRealisasi;
