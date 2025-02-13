import React, { useMemo } from "react";
import { Box, Flex, Text, Icon, Button } from "@chakra-ui/react";
import { FaEye, FaCheck } from "react-icons/fa";
import { AgGridReact } from "ag-grid-react";
import { IconBriefcase } from '@tabler/icons-react';
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import '../../../../assets/css/grid-style.css';

// Komponen StatusBadge untuk status
const StatusBadge = ({ value }) => {
  const colorScheme =
    value === "PROPOSED"
      ? "blue"
      : value === "APPROVED"
      ? "green"
      : value === "RETURNED"
      ? "red"
      : "gray";

  return (
    <span
      style={{
        backgroundColor: colorScheme,
        color: "white",
        padding: "4px 8px",
        borderRadius: "12px",
      }}
    >
      {value}
    </span>
  );
};

// Komponen untuk menampilkan nomor urut
const NumberRenderer = (props) => {
  // Render nomor baris (index) + 1
  return <span>{props.node.rowIndex + 1}</span>;
};

const ProposedWorkTable = ({ columnDefs, rowData, title, subtitle }) => {
  const defaultColDef = useMemo(() => ({
    flex: 1,
    minWidth: 150,
    sortable: true,
    filter: true,
    resizable: true,
  }), []);

  const extendedColumnDefs = useMemo(() => [
    { 
      headerName: "No", 
      // cellRendererFramework: NumberRenderer, // Gunakan komponen NumberRenderer
      valueGetter: "node.rowIndex + 1", 
      sortable: true,
      filter: true
    },
    ...columnDefs
  ], [columnDefs]);

  const gridOptions = useMemo(() => ({
    rowHeight: 70,
    headerHeight: 70,
    autoSizeStrategy: {
      type: 'fitCellContents'
  },
  }), []);

  return (
    <Box bg="white" borderRadius="lg" boxShadow="md" p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={4}>
        <Flex alignItems="center">
          <Icon as={IconBriefcase} boxSize={12} color="gray.600" mr={3} />
          <Box>
            <Text fontSize="xl" fontWeight="bold" fontFamily={'Montserrat'} color="gray.600">
              {title ? title : "Proposed Work"}
            </Text>
            <Text fontSize="sm" color="gray.600" fontFamily={'Montserrat'}>
              {subtitle ? subtitle : "List of Proposed Work"}
            </Text>
          </Box>
        </Flex>
        <Button
          hidden
          leftIcon={<Icon as={FaCheck} />}
          colorScheme="blue"
          size="md"
        >
          Ajukan Perencanaan
        </Button>
      </Flex>

      <div className="ag-theme-alpine" style={{ height: 600, width: "100%" }}>
        <AgGridReact
          columnDefs={extendedColumnDefs}
          rowData={rowData}
          defaultColDef={defaultColDef}
          gridOptions={gridOptions}
        />
      </div>
    </Box>
  );
};

export default ProposedWorkTable;
