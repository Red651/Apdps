import React from "react";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Skeleton,
  Flex,
  Select,
  Text,
  Box,
  Icon,
} from "@chakra-ui/react";
import { IconTruck } from "@tabler/icons-react";
import HeaderCard from "./HeaderCard";

const defaultRanges = [
  { min: 0, max: 30, color: "#F05252" },
  { min: 30, max: 60, color: "#FF9500" },
  { min: 60, max: 80, color: "#FFCC00" },
  { min: 80, max: 100, color: "#31C48D" },
];

const getColorByValue = (value, ranges = defaultRanges) => {
  for (const range of ranges) {
    if (value >= range.min && value <= range.max) return range.color;
  }
  return "transparent";
};

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
  icon,
  actionButtons,
  excludeColumns = [],
  colorColumns = [],
  disableInfoColumn = false,
  enableRowNumbers = false,
  infoColumnFloatRight = false,
  infoColumnHeader = "Info",
}) => {
  const headers = jobs.length > 0
    ? Object.keys(jobs[0]).filter(header => !excludeColumns.includes(header))
    : [];

  const infoColumnIndex = disableInfoColumn ? -1 : infoColumnFloatRight ? headers.length : 0;
  
  return (
    <Box overflowX="auto" width="82.7vw">
      <HeaderCard
        icon={icon}
        title={title}
        subtitle={subtitle}
      >
        <Flex my={4} justifyContent="space-between" alignItems="center">
          <Text>Show per page:</Text>
          <Select
            value={perPage}
            onChange={onPerPageChange}
            width="100px"
            borderColor="gray.300"
          >
            {perPageOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
        </Flex>

        <Skeleton isLoaded={!loading} height="auto">
          <Box overflowX="auto" width="100%">
            <Table variant="simple" width="100%">
              <Thead>
                <Tr>
                  {enableRowNumbers && <Th minWidth="50px">No</Th>}
                  {infoColumnIndex === 0 && <Th minWidth="100px">{infoColumnHeader}</Th>}
                  {headers.map((header, index) => (
                    <Th key={index} minWidth="150px">
                      {header}
                    </Th>
                  ))}
                  {infoColumnIndex === headers.length && <Th minWidth="100px">{infoColumnHeader}</Th>}
                </Tr>
              </Thead>
              <Tbody>
                {jobs.length > 0 ? (
                  jobs.map((job, rowIndex) => (
                    <Tr key={job.job_id}>
                      {enableRowNumbers && (
                        <Td>{rowIndex + 1 + (page - 1) * perPage}</Td>
                      )}
                      {infoColumnIndex === 0 && (
                        <Td>
                          {actionButtons ? actionButtons(job) : null}
                        </Td>
                      )}
                      {headers.map((header, index) => (
                        <Td
                          key={index}
                          bg={
                            colorColumns.includes(header) && typeof job[header] === "number"
                              ? getColorByValue(job[header])
                              : "transparent"
                          }
                        >
                          {colorColumns.includes(header) && typeof job[header] === "number"
                            ? `${job[header]}%`
                            : job[header] || 0}
                        </Td>
                      ))}
                      {infoColumnIndex === headers.length && (
                        <Td>
                          {actionButtons ? actionButtons(job) : null}
                        </Td>
                      )}
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td
                      colSpan={
                        headers.length +
                        (enableRowNumbers ? 1 : 0) +
                        (!disableInfoColumn ? 1 : 0)
                      }
                      textAlign="center"
                    >
                      No data available
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Skeleton>

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
      </HeaderCard>
    </Box>
  );
};

export default PaginatedTable;