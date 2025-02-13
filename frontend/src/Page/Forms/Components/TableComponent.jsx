import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
const TableComponent = ({ 
  data = [{}], 
  headers = [{}], 
  headerKey = "Header",
  maxHeight = "800px",  // Default maksimal tinggi
  minHeight = "500px",   // Default minimal tinggi
}) => {
  return (
    <TableContainer 
      maxHeight={maxHeight}
      minHeight={minHeight}
      overflowY="auto"
      border="1px solid"
      borderColor="gray.200"
      borderRadius={"md"}
    >
      <Table variant="simple" colorScheme="gray">
        <Thead 
          position="sticky" 
          top={0} 
          bg="white" 
          zIndex={1}
          backgroundColor={"gray.100"}
        >
          <Tr>
            <Th>#</Th>
            {headers.map((column, index) => (
              <Th key={index}>{column[headerKey]}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, rowIndex) => (
            <Tr key={rowIndex}>
              <Td>{rowIndex + 1}</Td>
              {headers.map((column, colIndex) => (
                <Td key={colIndex}>
                  {column.render ? column.render(row) : row[column.accessor]}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
export default TableComponent;
