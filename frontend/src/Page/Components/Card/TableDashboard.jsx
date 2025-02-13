import { Table, Thead, Tbody, Tr, Th, TableContainer } from "@chakra-ui/react";

const TableDashboard = ({ datas, headers = [], children, props }) => {
  return (
    <TableContainer>
      <Table variant="simple" {...props} mt={2} size={"sm"}>
        <Thead bg={"gray.200"} fontWeight={"bold"} borderRadius="lg">
          <Tr>
            {headers.map((head, index) => (
              <Th
                key={index}
                backgroundColor={"white"}
                textTransform={"capitalize"}
                fontSize={"18px"}
                p={3}
                py={6}
                fontFamily={"Mulish"}
                fontWeight={"600"}
              >
                {head}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>{children}</Tbody>
      </Table>
    </TableContainer>
  );
};

export default TableDashboard;
