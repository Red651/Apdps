import React, { useMemo, useCallback, memo } from "react";
import { AgGridReact } from "ag-grid-react";
import "../../../assets/css/grid-style.css";
// import "../../../assets/css/ag-grid-theme-builder.css";
import "@ag-grid-community/styles/ag-theme-material.css";

import {
  CircularProgress,
  Flex,
  Text,
  Box,
  Icon,
  Tooltip,
  Skeleton,
} from "@chakra-ui/react";
import { IconBriefcase } from "@tabler/icons-react";

const getColorByValue = (value) => {
  if (value <= 30) return "#F05252";
  if (value <= 70) return "#FF9500";
  if (value <= 99) return "#FFCC00";
  return "#31C48D";
};

const formatHeaderName = (key) => {
  return key
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const DataTable = memo(
  ({
    jobs,
    loading,
    title,
    subtitle,
    actionButton,
    actionButtons,
    actionHeader = "Aksi", // If actionHeader is null, action column will not be displayed
    actionHeaderWidth = 130,
    rowWidth = 48,
    ShowActionButton = true,
    excludeColumns = [],
    excludeColorColumns = [],
    icon = IconBriefcase,
  }) => {
    const columnDefs = useMemo(() => {
      if (!Array.isArray(jobs) || jobs.length === 0) return [];

      const cols = [
        {
          headerName: "No",
          valueGetter: (params) => {
            return params.node.rowIndex + 1;
          },
          maxWidth: 70,
          flex: 0,
          headerTooltip: "Nomor",
          tooltipShowDelay: 0,
          cellStyle: {
            fontFamily: "Mulish",
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          },
        },
        ...Object.keys(jobs[0])
          .filter((key) => !excludeColumns.includes(key))
          .map((key) => ({
            field: key,
            headerName: formatHeaderName(key),
            headerTooltip: formatHeaderName(key),
            tooltipShowDelay: 0,
            flex: 1,
            filter: true,
            valueFormatter: (params) => {
              if (
                typeof params.value === "number" &&
                !excludeColorColumns.includes(key)
              ) {
                return `${params.value}%`;
              }
              if (params.value === null && !excludeColorColumns.includes(key)) {
                return "-";
              }
              return params.value;
            },
            cellStyle: (params) => {
              if (
                typeof params.value === "number" &&
                !excludeColorColumns.includes(key)
              ) {
                return {
                  backgroundColor: getColorByValue(params.value),
                  fontFamily: "Mulish",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "start",
                };
              }
              if (params.value === null && !excludeColorColumns.includes(key)) {
                return {
                  backgroundColor: getColorByValue(0),
                  fontFamily: "Mulish",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "start",
                };
              }
              return {
                fontFamily: "Mulish",
                display: "flex",
                alignItems: "center",
                justifyContent: "start",
              };
            },
            minWidth: rowWidth,
            // Adding CSS styles to wrap text in headers
            headerClass: "wrap-text-header",
          })),
      ];

      if (ShowActionButton && actionHeader !== null) {
        cols.push({
          headerName: actionHeader,
          headerTooltip: actionHeader,
          tooltipShowDelay: 0,
          cellRenderer: (params) =>
            actionButtons ? actionButtons(params.data) : null,
          width: actionHeaderWidth,
          flex: 0,
          minWidth: 48,
          cellStyle: {
            display: "flex",
            alignItems: "center",
            justifyContent: "start",
          },
        });
      }

      return cols;
    }, [
      jobs,
      excludeColumns,
      ShowActionButton,
      actionButtons,
      actionHeader,
      excludeColorColumns,
      actionHeaderWidth,
    ]);

    const defaultColDef = useMemo(
      () => ({
        sortable: true,
        resizable: true,
        minWidth: 48,
        tooltipShowDelay: 0,
        cellStyle: {
          fontFamily: "Mulish",
          display: "flex",
          alignItems: "start",
          justifyContent: "start",
        },
      }),
      [],
    );

    const onGridReady = useCallback((params) => {
      params.api.sizeColumnsToFit();
    }, []);

    const memoizedRowData = useMemo(() => {
      if (!Array.isArray(jobs)) return [];
      return jobs;
    }, [jobs]);

    const memoizedHeader = useMemo(
      () => (
        <Flex
          justifyContent="space-between"
          alignItems="center"
          mb={4}
          w={"100%"}
        >
          <Flex alignItems="center">
            <Icon as={icon} boxSize={12} color="gray.600" mr={3} />
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
          <Flex gap={2}>{actionButton}</Flex>
        </Flex>
      ),
      [title, subtitle, actionButton, icon],
    );

    return (
      <Flex
        direction="column"
        w={"full"}
        backgroundColor={"white"}
        p={6}
        borderWidth={"1px"}
        borderColor={"gray.200"}
        borderRadius="2xl"
      >
        {memoizedHeader}

        <Box
          className="ag-theme-material"
          sx={{
            width: "100%",
            position: "relative",
            minHeight: "400px",
            ".ag-header-viewport": {
              overflow: "auto !important",
            },
            ".ag-header-container": {
              minWidth: "100% !important",
            },
          }}
        >
          {/* Skeleton loader for table rows (11 columns) */}
          {loading ? (
            <Box>
              {[...Array(10)].map((_, rowIndex) => (
                <Flex key={rowIndex} mb={3}>
                  {[...Array(11)].map((_, colIndex) => (
                    <Skeleton
                      key={colIndex}
                      height="2rem"
                      width="100%"
                      mr={3}
                    />
                  ))}
                </Flex>
              ))}
            </Box>
          ) : (
            <AgGridReact
              rowData={memoizedRowData}
              columnDefs={columnDefs}
              defaultColDef={{
                ...defaultColDef,
                minWidth: 120,
                resizable: true,
              }}
              onGridReady={onGridReady}
              domLayout="autoHeight"
              rowHeight={60}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[
                10, 20, 50, 100, 250, 1000, 9999999999,
              ]}
            />
          )}
        </Box>
      </Flex>
    );
  },
);

export default DataTable;
