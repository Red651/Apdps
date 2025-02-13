import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { GetDatas } from "../../../../API/APISKK";
import Plot from "react-plotly.js";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";

const JobOperationDays = ({ data, actualPlan }) => {

  const plot = data?.plot?.path;
  const table = data?.data?.table ?? data?.table;

  const [curve, setCurve] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (plot) {
        const response = await GetDatas(plot);
        setCurve(response);
      }
    };
    fetchData();
  }, [plot]);

  return (
    <CardFormK3 title={"Job Operation Days"} maxWidth={"71vw"} padding="36px 28px" subtitle={"Time depth Curve"}>
      {actualPlan ? (
        <TableContainer
        >
          <Flex>
            <Box w={"full"}>
              <Plot 
                // {...curve}
                data = {curve?.data}
                layout = {
                  {
                    ...curve?.layout,
                    autosize: true,
                  }
                }
                useResizeHandler
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
          </Flex>
          <Flex gap={2} w={"100%"} overflowX={"scroll"}>
            <Table variant="striped" mt={4}>
              <Thead>
                <Tr>
                  <Th>Operasi Plan</Th>
                  <Th>Hari</Th>
                  <Th>Mulai</Th>
                  <Th>Selesai</Th>
                  <Th>Cost</Th>
                </Tr>
              </Thead>
              <Tbody>
                {table?.plan.map((row, index) => (
                  <Tr key={index}>
                    <Td>{row.Event}</Td>
                    <Td>{row.Days}</Td>
                    <Td>{row.Start}</Td>
                    <Td>{row.End}</Td>
                    <Td>{row.Cost}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
            <Table variant="striped" mt={4}>
              <Thead>
                <Tr>
                  <Th>Operasi Actual</Th>
                  <Th>Hari</Th>
                  <Th>Mulai</Th>
                  <Th>Selesai</Th>
                  <Th>Cost</Th>
                </Tr>
              </Thead>
              <Tbody>
                {table?.actual.map((row, index) => (
                  <Tr key={index}>
                    <Td>{row.Event}</Td>
                    <Td>{row.Days}</Td>
                    <Td>{row.Start}</Td>
                    <Td>{row.End}</Td>
                    <Td>{row.Cost}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Flex>
        </TableContainer>
      ) : (
        <TableContainer
        >
          <Flex justifyContent={"center"}>
            <Box w={"full"}>
            <Plot 
                // {...curve}
                data = {curve?.data}
                layout = {
                  {
                    ...curve?.layout,
                    autosize: true,
                  }
                }
                useResizeHandler
                style={{ width: '100%', height: '100%' }}
              />
            </Box>
          </Flex>
          <Table variant="striped" mt={4}>
            <Thead>
              <Tr>
                <Th>No</Th>
                <Th>Operasi</Th>
                <Th>Hari</Th>
                <Th>Mulai</Th>
                <Th>Selesai</Th>
                <Th>Cost</Th>
              </Tr>
            </Thead>
            <Tbody>
              {table.map((row, index) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>{row.Event}</Td>
                  <Td>{row.Days}</Td>
                  <Td>{row.Start}</Td>
                  <Td>{row.End}</Td>
                  <Td>{row.Cost}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </CardFormK3>
  );
};

export default JobOperationDays;
