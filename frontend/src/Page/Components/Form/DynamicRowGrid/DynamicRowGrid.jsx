import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";
import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  Box,
  Button,
  Text,
  Flex,
  Icon,
  useToast,
  IconButton,
  Input,
} from "@chakra-ui/react";
import { AgGridReact } from "ag-grid-react";
import { IconTrash, IconPlus } from "@tabler/icons-react";
import { createColumnConfig } from "./ColumnConfig";
import FileCellRenderer from "./FileCellRenderer";
import _debounce from "lodash/debounce";
import { IconInfoCircle, IconUpload } from "@tabler/icons-react";
import * as XLSX from "xlsx";

const DynamicRowGrid = ({
  title = "Form Table",
  columnConfig = [],
  objectName,
  onDataChange,
  initialData = [],
}) => {
  const toast = useToast();
  // const [rowData, setRowData] = useState(
  //   () =>
  //     initialData || [
  //       Object.fromEntries(columnConfig.map(({ key }) => [key, null])),
  //     ]
  // );
  const [rowData, setRowData] = useState(
    () => initialData || []  // Langsung set ke array kosong jika tidak ada initialData
  );

  const [numRowsToAdd, setNumRowsToAdd] = useState(1);
  const fileInputRef = useRef(null);
  const [gridApi, setGridApi] = useState(null);

  const [fileName, setFileName] = useState("");

  const columnHeaders = useMemo(
    () => createColumnConfig(columnConfig),
    [columnConfig]
  );

  // Optimize data change handler to prevent infinite loop
  const handleDataChange = useCallback(() => {
    const safeObjectName = objectName || 'defaultObjectName';  // memberikan fallback nilai default
    if (onDataChange) {
      onDataChange(safeObjectName, rowData);
    }
  }, [rowData, onDataChange, objectName]);

  useEffect(() => {
    handleDataChange();
  }, [handleDataChange]); // Only trigger on rowData change

  // Optimized handleCellValueChange with debounce
  const handleCellValueChange = useCallback(
    _debounce((params) => {
      const { colDef, value, data } = params;
       
      const columnKey = colDef.field;
      const columnConfig = columnHeaders.find((col) => col.key === columnKey);

      if (!columnConfig) return;

      let transformedValue = columnConfig.transform(value);

      // Jika tipe adalah date, pastikan kita mengonversinya ke format yang sesuai
      if (colDef.type === "date" && value) {
        const dateValue = new Date(value);
        transformedValue = dateValue.toISOString();
      }

      if (colDef.type === "dateOnly" && value) {
        // Pastikan value dikonversi ke format yang benar
        const transformedValue = columnConfig.transform(value);
        params.node.setDataValue(columnKey, transformedValue);
      }

      if (
        transformedValue === null &&
        value !== null &&
        value !== "" &&
        value !== 0
      ) {
        toast({
          title: "Input Converted",
          description: `${columnConfig.headerName} value was converted to null`,
          status: "info",
          duration: 2000,
          isClosable: true,
        });
      }

      // Apply transformation directly without debounce
      params.node.setDataValue(columnKey, transformedValue);
    }, 100), // Reduced debounce to 100ms for faster response
    [columnHeaders, toast]
  );

 const handleDeleteRow = useCallback(
  (rowIndex) => {
    setRowData((prev) => prev.filter((_, index) => index !== rowIndex));
  },
  []  // Hapus dependensi rowData.length
);

  const columnDefs = useMemo(
    () => [
      {
        headerName: "No",
        valueGetter: "node.rowIndex + 1",
        width: 70,
        pinned: "left",
        suppressSizeToFit: true,
      },
      ...columnConfig.map(({ key, headerName, type, required, select }) => ({
        headerName,
        field: key,
        editable: true,
        width: 200,
        cellEditor:
          type === "select"
            ? "agSelectCellEditor"
            : type === "date"
            ? "agDateCellEditor"
            : type === "file"
            ? "agFileCellEditor"
            : type === "string"
            ? "agTextCellEditor"
            : "agTextCellEditor",
        cellEditorParams:
          type === "select"
            ? { values: select.map((option) => option.value) }
            : undefined,
        cellStyle: (params) => ({
          backgroundColor: required ? "#fff4e5" : "white",
        }),
        cellRenderer: (params) => {
          if (type === "select") {
            const option = select.find((opt) => opt.value === params.value);
            return option ? option.name : "";
          }

          if (type === "date") {
            return (
              <Input
                type="datetime-local"
                value={
                  params.value
                    ? new Date(params.value).toISOString().slice(0, 16)
                    : ""
                }
                onChange={(e) => {
                  const dateValue = e.target.value
                    ? new Date(e.target.value).toISOString()
                    : null;
                  params.node.setDataValue(key, dateValue);
                }}
                size="sm"
              />
            );
          }
          if (type === "dateOnly") {
            return (
              <Input
                type="date"
                value={
                  params.value
                    ? (() => {
                        // Konversi dari format DD/MM/YYYY ke YYYY-MM-DD
                        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(params.value)) {
                          const [day, month, year] = params.value.split("/");
                          return `${year}-${month.padStart(
                            2,
                            "0"
                          )}-${day.padStart(2, "0")}`;
                        }

                        // Jika sudah dalam format YYYY-MM-DD, gunakan langsung
                        if (/^\d{4}-\d{2}-\d{2}$/.test(params.value)) {
                          return params.value;
                        }

                        return "";
                      })()
                    : ""
                }
                onChange={(e) => {
                  const inputValue = e.target.value;
                  if (inputValue) {
                    // Konversi dari YYYY-MM-DD ke YYYY-MM-DD (format API)
                    params.node.setDataValue(key, inputValue);
                  } else {
                    params.node.setDataValue(key, null);
                  }
                }}
                size="sm"
              />
            );
          }
          if (type === "file") {
            return (
              <FileCellRenderer
                value={params.value}
                onUpload={(fileInfo) => {
                  params.node.setDataValue(key, fileInfo);
                }}
              />
            );
          }
          return params.value;
        },
      })),
      {
        headerName: "Actions",
        pinned: "right",
        width: 100,
        cellRenderer: (params) => (
          <IconButton
            colorScheme="red"
            size="sm"
            onClick={() => handleDeleteRow(params.node.rowIndex)}
            borderRadius="full"
            icon={<Icon as={IconTrash} />}
          />
        ),
        editable: false,
      },
    ],
    [columnConfig, handleDeleteRow]
  );

  const handleAddRows = () => {
    const newRows = Array.from({ length: numRowsToAdd }, () =>
      Object.fromEntries(columnHeaders.map(({ key }) => [key, null]))
    );
    setRowData((prev) => [...prev, ...newRows]);
  };

  // Optimized handleCellEditingStopped with transaction
  const handleCellEditingStopped = _debounce((event) => {
    const { colDef, value, data } = event;
    const columnKey = colDef.field;
     

    // Pastikan nilai tanggal yang sudah diubah diterapkan dengan benar
    if (colDef.type === "date" && value) {
      data[columnKey] = new Date(value); // Perbarui nilai tanggal di data row
    }

    if (colDef.type === "dateOnly" && value) {
      // Pastikan value dikonversi ke format yang benar
      const transformedValue = columnConfig.transform(value);
      params.node.setDataValue(columnKey, transformedValue);
    }

    const updatedRow = { ...data, [columnKey]: value };

    // Apply transaction update for better performance
    gridApi.applyTransaction({ update: [updatedRow] });

    //  
  }, 100); // Reduced debounce delay for faster update

  const onGridReady = (params) => {
    setGridApi(params.api); // Store gridApi for transactions
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    setFileName(file.name);
  
  
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  
        const uploadedHeaders = jsonData[0];
        const expectedHeaders = columnConfig.map((col) => col.key);
  
  
        const rows = jsonData.slice(1).map((row) => {
          return expectedHeaders.reduce((obj, header) => {
            const index = uploadedHeaders.indexOf(header);
            const columnConfig = columnHeaders.find(
              (col) => col.key === header
            );
            
            if (index !== -1 && columnConfig) {
              const rawValue = row[index];
              
              // Fungsi untuk mendeteksi dan menangani tipe data
              const processValue = (value) => {
                // Jika null atau undefined, kembalikan null
                if (value === null || value === undefined) {
                  return null;
                }
  
  
                // Cek konfigurasi kolom untuk tipe data spesifik
                const columnType = columnConfig.type;
  
  
                // Khusus untuk tipe number
                if (columnType === 'number') {
                  // Konversi ke number, dengan penanganan khusus
                  const numValue = Number(value);
                  return !isNaN(numValue) ? numValue : null;
                }
  
  
                // Untuk tipe date
                if (columnType === 'date' || columnType === 'dateOnly') {
                  // Konversi ke format tanggal
                  const dateValue = new Date(value);
                  return !isNaN(dateValue) 
                    ? columnType === 'dateOnly' 
                      ? dateValue.toISOString().split('T')[0]  // Hanya tanggal
                      : dateValue.toISOString()  // Tanggal dan waktu
                    : null;
                }
  
  
                // Untuk tipe string atau tipe lainnya
                if (typeof value === 'number') {
                  return String(value);
                }
  
  
                if (typeof value === 'boolean') {
                  return String(value);
                }
  
  
                if (typeof value === 'object') {
                  return JSON.stringify(value);
                }
  
  
                // Untuk string, gunakan trim
                return value !== null && value !== undefined 
                  ? String(value).trim() 
                  : null;
              };
  
  
              // Proses nilai dengan transform opsional
              obj[header] = columnConfig.transform 
                ? columnConfig.transform(processValue(rawValue))
                : processValue(rawValue);
            } else {
              obj[header] = null;
            }
            return obj;
          }, {});
        });
  
  
        // Proses batch update seperti sebelumnya
        const batchSize = 1000;
        const updateRowData = (startIndex) => {
          const endIndex = Math.min(startIndex + batchSize, rows.length);
          setRowData((prevRows) => [
            ...prevRows,
            ...rows.slice(startIndex, endIndex),
          ]);
  
  
          if (endIndex < rows.length) {
            setTimeout(() => updateRowData(endIndex), 0);
          } else {
            toast({
              title: "Upload Successful",
              description: "File uploaded and processed successfully",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          }
        };
  
  
        updateRowData(0);
      } catch (error) {
        console.error("Upload error:", error);
        toast({
          title: "Error",
          description: "Failed to parse the uploaded file",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    };
  
  
    reader.readAsArrayBuffer(file);
  };

  return (
    <Flex
      direction="column"
      gap={4}
      width="100%"
      padding={6}
      borderWidth="1px"
      borderRadius="lg"
    >
      <Flex justifyContent="space-between">
        <Flex alignItems="center">
          <Icon as={IconInfoCircle} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection="column">
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily="Mulish"
            >
              {title}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily="Mulish">
              {`Enter ${title}`}
            </Text>
          </Flex>
        </Flex>
        <Flex alignItems="center" gap={4}>
          {fileName}
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileUpload}
            accept=".csv,.xlsx,.xls"
          />
          <Button
            colorScheme="blue"
            variant="outline"
            borderRadius="full"
            leftIcon={<Icon as={IconUpload} />}
            onClick={() => fileInputRef.current.click()}
            size="md"
          >
            Select File
          </Button>
        </Flex>
      </Flex>

      <Box
        className="ag-theme-quartz"
        width="100%"
        height="500px"
        borderWidth="1px"
        borderRadius="lg"
      >
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            resizable: true,
            editable: true,
            // singleClickEdit: true,
            cellDataType: 'text',
          }}
          onCellValueChanged={handleCellValueChange}
          rowSelection="multiple" // or "single"
          pagination={true}
          paginationPageSize={20}
          gridOptions={{ suppressAggFuncInHeader: true }}
          stopEditingWhenCellsLoseFocus={true}
          onCellEditingStopped={handleCellEditingStopped}
          onGridReady={onGridReady}
          cacheBlockSize={100}
          maxBlocksInCache={10}
        />
      </Box>

      <Flex justifyContent="space-between" alignItems="start">
        <Text color="gray.500" fontSize="sm">
          * Columns with required fields will be highlighted in orange.
        </Text>
        <Box
          display="flex"
          alignItems="center"
          mt={2}
          justifyContent="flex-end"
        >
          <Text mr={2}>Rows:</Text>
          <Input
            value={numRowsToAdd}
            onChange={(e) =>
              setNumRowsToAdd(Math.max(1, parseInt(e.target.value) || 1))
            }
            size="sm"
            width="100px"
          />
          <Button
            colorScheme="blue"
            borderRadius="full"
            size="sm"
            onClick={handleAddRows}
            ml={2}
            leftIcon={<Icon as={IconPlus} />}
          >
            Add Rows
          </Button>
        </Box>
      </Flex>
    </Flex>
  );
};

export default DynamicRowGrid;
