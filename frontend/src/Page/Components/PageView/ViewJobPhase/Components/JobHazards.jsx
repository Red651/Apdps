import { useEffect, useState } from "react";
import {
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Heading,
  Text,
} from "@chakra-ui/react";
import { useLocation } from "react-router-dom";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";

const JobHazards = ({data, title, subtitle}) => {
  const location = useLocation();
  const isPppRoute = location.pathname.includes("/ppp");
  const isOperatingRoute = location.pathname.includes("/opera");
  const hazards =
    isPppRoute || isOperatingRoute
      ? data?.data?.potential_hazard?.plan
      : data?.data?.potential_hazard;


  return (
    <CardFormK3 title={title} padding="36px 28px" subtitle={subtitle}>
    <TableContainer>
      <Table variant="striped">
        <Thead>
          <Tr>
            <Th>No</Th>
            <Th>Hazard Type</Th>
            <Th>Hazard Description</Th>
            <Th>Hazard Severity</Th>
            <Th>Mitigation</Th>
            <Th>Remarks</Th>
          </Tr>
        </Thead>
        <Tbody>
          {hazards && Object.keys(hazards).length > 0 ? (
            Object.entries(hazards).map(([key, hazard], index) => (
              <Tr key={index}>
                <Td>{index + 1}</Td>
                <Td>{hazard?.["Hazard Type"] || "N/A"}</Td>
                <Td>{hazard.Description || "N/A"}</Td>
                <Td>{hazard.Severity || "N/A"}</Td>
                <Td>{hazard.Mitigation || "N/A"}</Td>
                <Td>{hazard.Remark || "N/A"}</Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={6} textAlign="center">
                No hazard data available
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </TableContainer>
    </CardFormK3>
  );
};

export default JobHazards;
