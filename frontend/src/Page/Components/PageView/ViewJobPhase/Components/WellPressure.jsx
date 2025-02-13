import React from "react";
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Flex,
  Icon,
  Heading,
} from "@chakra-ui/react";
import { IconBriefcase } from "@tabler/icons-react";

import CardFormK3 from "../../../../Forms/Components/CardFormK3";

const WellPressureViewer = ({ datas, title, subTitle }) => {
  if (!datas || !Array.isArray(datas) || datas.length === 0) {
    return <Text>No Well Pressure Data Available</Text>;
  }

  return (
    <CardFormK3
      title={title}
      padding="36px 28px"
      w={"71vw"}
      subtitle={subTitle}
    >
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th backgroundColor={"gray.50"}>Field</Th>
            <Th backgroundColor={"gray.50"}>Value</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(datas[0]).map(([field, value]) => (
            <Tr key={field}>
              <Td backgroundColor={"gray.50"}>{field}</Td>
              <Td>{value !== null ? value : "N/A"}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </CardFormK3>
  );
};

export default WellPressureViewer;
