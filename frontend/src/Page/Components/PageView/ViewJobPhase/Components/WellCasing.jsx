import {
  Box,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Td,
  Th,
  TableContainer,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getWellCasingBar } from "../../../../API/APISKK";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";

const WellCasing = (data) => {
  const wellCasingBar = data?.data?.plot?.plan?.path ?? data?.data.plot.path;
  const wellCasingBarActual = data?.data?.plot?.actual?.path ?? null;
  const wellCasingTable = data?.data?.table?.plan ?? [];
  const wellCasingTableActual = data?.data?.table?.actual ?? [];
  const [image, setImage] = useState(null);
  const [imageActual, setImageActual] = useState(null);

  useEffect(() => {
    const fetchDataWellcasing = async () => {
      if (!wellCasingBar) return;
      try {
        const response = await getWellCasingBar(wellCasingBar);
        if (response) {
          const imageUrl = URL.createObjectURL(response);
          setImage(imageUrl);
        }
      } catch (error) {
        console.error("Error fetching well casing image:", error);
      }
    };
    fetchDataWellcasing();
  }, [wellCasingBar]);

  useEffect(() => {
    const fetchDataWellcasing = async () => {
      if (!wellCasingBarActual) return;
      try {
        const response = await getWellCasingBar(wellCasingBarActual);
        if (response) {
          const imageUrl = URL.createObjectURL(response);
          setImageActual(imageUrl);
        }
      } catch (error) {
        console.error("Error fetching well casing image:", error);
      }
    };
    fetchDataWellcasing();
  }, [wellCasingBarActual]);

  const renderDynamicTable = (tableData) => {
    if (!tableData || tableData.length === 0) {
      return <Text color="gray.500">No data available</Text>;
    }

    // Extract unique columns dynamically from data keys
    const columns = Object.keys(tableData[0]);

    return (
      <TableContainer flex={8} mt={4} w={"71vw"}>
        <Table variant="striped">
          <Thead>
            <Tr>
              {columns.map((col, index) => (
                <Th key={index}>{col}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {tableData.map((row, rowIndex) => (
              <Tr key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <Td key={colIndex}>{row[col]}</Td>
                ))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      {wellCasingTable.length > 0 ? (
        <Flex flexDirection={"column"} gap={6} w={"71vw"}>
          <CardFormK3        
            background={"white"}
            borderRadius={"10px"}
            p={8}
            flex={1}
            title="Well Casing"
            subtitle="Well Casing Plan"
          >
            <Flex direction="column" align="center" gap={3}>
              {image ? (
                <img src={image} style={{ flex: 1 }} alt="Well Casing Plot" />
              ) : (
                <p>Loading image...</p>
              )}
              {renderDynamicTable(wellCasingTable)}
            </Flex>
          </CardFormK3>

          <CardFormK3
            background={"white"}
            borderRadius={"10px"}
            p={8}
            flex={1}
            title="Well Casing"
            subtitle="Well Casing Actual"
          >
            <Flex direction="column" align="center" gap={3}>
              {imageActual ? (
                <img
                  src={imageActual}
                  style={{ flex: 1 }}
                  alt="Well Casing Plot"
                />
              ) : (
                <p>Loading image...</p>
              )}
              {renderDynamicTable(wellCasingTableActual)}
            </Flex>
          </CardFormK3>
        </Flex>
      ) : (
        <CardFormK3
          borderRadius={"10px"}
          background={"white"}
          p={8}
            w={"71vw"}
            title="Well Casing"
            subtitle="Well Casing"
        >

          <Box m={3}>
            <Heading size="md">Well Casing</Heading>
            <Text fontSize="md" color="gray.600">
              Well Casing Data Available
            </Text>
          </Box>
          <Flex direction="wrap" align="center" w={"100%"} justifyContent={"center"}>
            {image ? (
              <img src={image} alt="Well Casing Plot" />
            ) : (
              <p>Loading image...</p>
            )}
          </Flex>
        </CardFormK3>
      )}
    </Box>
  );
};

export default WellCasing;