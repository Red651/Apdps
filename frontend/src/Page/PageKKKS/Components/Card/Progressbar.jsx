import React from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  Progress,
} from '@chakra-ui/react';
import { InfoIcon } from '@chakra-ui/icons';

const data = [
  { id: 'KKK501', exploration: 30, development: 50, workover: 70, wellService: 100 },
  { id: 'KKK501', exploration: 30, development: 50, workover: 70, wellService: 100 },
  { id: 'KKK501', exploration: 30, development: 50, workover: 70, wellService: 100 },
  { id: 'KKK501', exploration: 30, development: 50, workover: 70, wellService: 100 },
  { id: 'KKK501', exploration: 30, development: 50, workover: 70, wellService: 100 },
  { id: 'KKK501', exploration: 30, development: 50, workover: 70, wellService: 100 },
  { id: 'KKK501', exploration: 30, development: 50, workover: 70, wellService: 100 },
  { id: 'KKK501', exploration: 30, development: 50, workover: 70, wellService: 100 },
  { id: 'KKK501', exploration: 30, development: 50, workover: 70, wellService: 100 },
  { id: 'KKK501', exploration: 30, development: 50, workover: 70, wellService: 100 },
];

const ProgressBar = ({ value, color }) => (
  <Box w="100%" bg="gray.100">
    <Progress value={value} size="sm" bg="gray.100" sx={{
      '& > div': {
        background: color,
      }
    }} />
    <Text fontSize="xs" textAlign="center" color="gray.600">{value}%</Text>
  </Box>
);

const ProgressTable = () => {
  return (
    <Box overflowX="auto" borderWidth={1} borderColor="gray.200">
      <Table variant="simple" size="sm">
        <Thead>
          <Tr bg="gray.50">
            <Th colSpan={2} textAlign="center">INFO</Th>
            <Th width="20%" p={2} textAlign="center">EXPLORATION</Th>
            <Th width="20%" p={2} textAlign="center">DEVELOPMENT</Th>
            <Th width="20%" p={2} textAlign="center">WORKOVER</Th>
            <Th width="20%" p={2} textAlign="center">WELL SERVICE</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, index) => (
            <Tr key={index}>
              <Td width="5%" p={2} textAlign="center">
                <InfoIcon color="gray.400" />
              </Td>
              <Td width="15%" p={2}>{row.id}</Td>
              <Td p={1}>
                <ProgressBar value={row.exploration} color="#FF5959" />
              </Td>
              <Td p={1}>
                <ProgressBar value={row.development} color="#FFA726" />
              </Td>
              <Td p={1}>
                <ProgressBar value={row.workover} color="#FFD740" />
              </Td>
              <Td p={1}>
                <ProgressBar value={row.wellService} color="#26C6DA" />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default ProgressTable;