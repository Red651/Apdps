// src/components/TableModalDetailK3S.js
import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Button } from '@chakra-ui/react';

const TableModalDetailK3S = ({ columns, data, onView }) => {
  return (
    <Table variant="striped" mt={4}>
      <Thead>
        <Tr fontFamily={"Mulish"} fontSize={"2xl"}>
          {columns.map((col, index) => (
            <Th key={index}>{col.header}</Th>
          ))}
          {/* <Th>Aksi</Th> */}
        </Tr>
      </Thead>
      <Tbody>
        {data.length > 0 ? (
          data.map((row, index) => (
            <Tr key={index} fontFamily={"Mulish"} fontSize={"sm"}>
              {columns.map((col, i) => (
                <Td key={i}>{row[col.accessor]}</Td>
              ))}
              {/* <Td>
                <Button size="sm" colorScheme="blue" onClick={() => onView(row)}>
                  View
                </Button>
              </Td> */}
            </Tr>
          ))
        ) : (
          <Tr>
            <Td colSpan={columns.length + 1}>No data available</Td>
          </Tr>
        )}
      </Tbody>
    </Table>
  );
};

export default TableModalDetailK3S;
