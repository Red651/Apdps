import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";
import { getAreaID } from "../../../../API/APIKKKS";
import { useEffect, useState } from "react";

const formatValue = (value, filter) => {
  if (value === null || value === undefined) return "N/A";
  if (typeof value === "boolean") return value ? "True" : "False";
  if (typeof value === "object") {
    return (
      <>
        <Td>
          {value.plan !== undefined && value.plan !== null ? value.plan : "N/A"}
        </Td>
        <Td>
          {value.actual !== undefined && value.actual !== null
            ? value.actual
            : "N/A"}
        </Td>
      </>
    );
  }
  return <Td colSpan={2}>{value}</Td>;
};

const DataTable = ({ data, title, subTitle, icon, filter }) => {
  const hasObjectValues = Object.values(data || {}).some(
    (value) => typeof value === "object" && value !== null && filter === undefined
  );

  const [areaID, setAreaID] = useState([]);

  useEffect(() => {
    if (filter?.parent_well_id) {
      const GetAreaID = async () => {
        try {
          const response = await getAreaID();
          setAreaID(response);
        } catch (error) {
          console.error("Error get Area ID", error);
        }
      };

      GetAreaID();
    }
  }, [filter?.parent_well_id]);

  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th backgroundColor={"gray.50"} width="30%">
              Key
            </Th>
            {hasObjectValues ? (
              <>
                <Th backgroundColor={"gray.50"}>Plan</Th>
                <Th backgroundColor={"gray.50"}>Actual</Th>
              </>
            ) : (
              <Th backgroundColor={"gray.50"}>Value</Th>
            )}
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(data || {}).map(([key, value], index) => {
            if (filter && Array.isArray(filter) && !filter.includes(key)) {
              return null;
            }

            let valueToShow;
            if (filter?.parent_well_id && areaID.length > 0) {
              const areaFound = areaID.find((area) => area.id === value);
              valueToShow = areaFound ? areaFound.name : value;
            } else {
              valueToShow = value;
            }

            return (
              <Tr key={index}>
                <Td backgroundColor={"gray.50"}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                </Td>
                {hasObjectValues ? (
                  formatValue(value)
                ) : (
                  <Td>{valueToShow !== null && valueToShow !== undefined ? valueToShow : "N/A"}</Td>
                )}
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

export default DataTable;

