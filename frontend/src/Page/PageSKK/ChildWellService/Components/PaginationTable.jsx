import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  CircularProgress,
  Flex,
  Select,
  Text,
  Box,
  Icon,
} from "@chakra-ui/react";
import { IconBriefcase } from "@tabler/icons-react";

const PaginatedTable = ({
  jobs,
  loading,
  page,
  perPage,
  perPageOptions,
  totalData,
  onNextPage,
  onPreviousPage,
  onPerPageChange,
  title,
  subtitle,
  actionButton,
  actionButtons,
  excludeColumns = [],
}) => {
  const isCloseoutPage = window.location.pathname.includes("/closeout");

  const headers =
    jobs.length > 0
      ? Object.keys(jobs[0]).filter(
          (header) => !excludeColumns.includes(header)
        )
      : [];

  return (
    <Box my={6} overflowX="auto">
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Flex alignItems="center">
          <Icon as={IconBriefcase} boxSize={12} color="gray.600" mr={3} />
          <Box>
            <Text
              fontSize="xl"
              fontWeight="bold"
              fontFamily={"Mulish"}
              color="gray.600"
            >
              {title}
            </Text>
            <Text fontSize="sm" color="gray.600" fontFamily={"Mulish"}>
              {subtitle}
            </Text>
          </Box>
        </Flex>
        {actionButton}
      </Flex>

      <Flex my={4} justifyContent="space-between" alignItems="center">
        <Text>Show per page:</Text>
        <Select
          value={perPage}
          onChange={onPerPageChange}
          width="100px"
          borderColor="gray.300"
        >
          {perPageOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      </Flex>

      {loading ? (
        <CircularProgress isIndeterminate color="blue.300" />
      ) : (
        <Table variant="simple">
          <Thead>
            <Tr>
              {headers.map((header, index) => (
                <Th key={index}>{header}</Th>
              ))}
              {!isCloseoutPage && <Th>Aksi</Th>}{" "}
            </Tr>
          </Thead>
          <Tbody>
            {jobs.length > 0 ? (
              jobs.map((job) => (
                <Tr key={job.job_id}>
                  {headers.map((header, index) => (
                    <Td key={index}>{job[header]}</Td>
                  ))}
                  {!isCloseoutPage && (
                    <Td>{actionButtons && actionButtons(job)} </Td>
                  )}
                </Tr>
              ))
            ) : (
              <Tr>
                <Td
                  colSpan={headers.length + (isCloseoutPage ? 0 : 1)}
                  textAlign="center"
                >
                  No data available
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      )}

      <Flex justifyContent="space-between" mt={4}>
        <Button
          onClick={onPreviousPage}
          disabled={page === 1}
          colorScheme="blue"
        >
          Previous
        </Button>
        <Text>
          Page {page} of {Math.ceil(totalData / perPage)}
        </Text>
        <Button
          onClick={onNextPage}
          disabled={page === Math.ceil(totalData / perPage)}
          colorScheme="blue"
        >
          Next
        </Button>
      </Flex>
    </Box>
  );
};

export default PaginatedTable;
