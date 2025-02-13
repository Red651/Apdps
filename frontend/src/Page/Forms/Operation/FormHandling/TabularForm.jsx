import React, { useState } from "react";
import { AgGridReact } from "ag-grid-react";
import { Box } from "@chakra-ui/react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

const DynamicRowGrid = () => {
  const key_names = [
    "test_type",
    "run_num",
    "test_num",
    "active_ind",
    "base_depth",
    "base_depth_ouom",
    // Tambahkan key lainnya di sini...
  ];

  const [rowData, setRowData] = useState([
    Object.fromEntries(key_names.map((key) => [key, ""])),
    Object.fromEntries(key_names.map((key) => [key, ""])),
  ]);

  const columnDefs = key_names.map((key) => ({
    headerName: key,
    field: key,
    editable: true,
    onCellValueChanged: handleCellValueChange,
  }));

  // Handler untuk menambahkan baris baru jika baris terakhir telah diisi
  function handleCellValueChange(params) {
    const rowIndex = params.node.rowIndex;
    const isLastRow = rowIndex === rowData.length - 1;

    // Cek apakah baris terakhir telah diisi
    if (isLastRow) {
      const allFilled = key_names.some(
        (key) => params.data[key] !== null && params.data[key] !== ""
      );

      if (allFilled) {
        setRowData((prevRowData) => [
          ...prevRowData,
          Object.fromEntries(key_names.map((key) => [key, ""])),
        ]);
      }
    }
  }

  return (
    <Box className="ag-theme-alpine" w="100%" h="500px">
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        defaultColDef={{
          flex: 1,
          resizable: true,
          sortable: true,
        }}
        stopEditingWhenCellsLoseFocus={true}
      />
    </Box>
  );
};

export default DynamicRowGrid;
