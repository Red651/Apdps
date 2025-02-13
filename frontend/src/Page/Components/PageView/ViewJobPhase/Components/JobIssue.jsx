import { useEffect, useState } from "react";
import {
  Flex,
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";

const WellData = ({ data, title, subTitle }) => {
  const [wellData, setWellData] = useState([]);

  useEffect(() => {
    const fetchWellData = async () => {
      if (!data) return;
      try {
        setWellData([data][0]);
      } catch (error) {
        console.error("Error fetching well Data data:", error);
      }
    };
    fetchWellData();
  }, [data]);

  const getTableHeadersData = () => {
    if (wellData.length > 0) {
      return Object.keys(wellData[0]);
    }
    return [];
  };

  const formatValue = (value) => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "boolean") return value ? "True" : "False";
    return value;
  };

  return (
      <CardFormK3 title={title} padding="36px 28px" subtitle={subTitle} maxWidth="71vw">
      <TableContainer>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>No</Th>
              {getTableHeadersData().map((header, index) => (
                <Th key={index}>{header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {wellData.map((item, index) => (
              <Tr key={index}>
                <Td>{index + 1}</Td>
                {Object.values(item).map((value, idx) => (
                  <Td key={idx}>{formatValue(value)}</Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      </CardFormK3>
  );
};

export default WellData;
