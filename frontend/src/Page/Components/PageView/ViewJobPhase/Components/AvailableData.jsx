// AvailableData.jsx
import {
  Box,
  Flex,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Badge,
} from "@chakra-ui/react";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";

const AvailableData = ({ title, data, subtitle }) => {
  if (!data) {
    return <Text>No data available</Text>;
  }

  return (
    <CardFormK3 title={title} subtitle={subtitle} padding="36px 28px" flex="1">
      <TableContainer>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>Data Type</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {Object.entries(data).map(([key, value], index) => (
              <Tr key={index}>
                <Td>{key}</Td>
                <Td><Badge p={1} colorScheme={value == "Available" ? 'blue' : "red"}>{value}</Badge></Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </CardFormK3>
  );
};

export default AvailableData;
