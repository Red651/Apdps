import React from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "@chakra-ui/react";

const dataheader = [
  {
    headers: "Make2",
    accessor: "make2",
    editable: true,
    type: "text",
  },
  {
    headers: "Make4",
    accessor: "make4",
    type: "text",
    editable: true,
  },
  {
    headers: "Make6",
    accessor: "make6",
    editable: true,
    type: "select",
    options: [{
      name: "2",
      label: "1"
    }],
    
  },
];

const AgGridTableCreate = ({
  onChange = () => {},
  columnDefine = dataheader,
  rowDatas = [],
}) => {
  //  
  const [rowData, setRowData] = React.useState(rowDatas);
  //   
  const accessorData = columnDefine.map((item) => {
    return {
      [item.accessor]: "",
    };
  });
   

  const columnDefs = columnDefine.map((item) => {
    if (columnDefine.length === 0) return;
    return {
      headerName: item.headers,
      field: item.accessor,
      editable: item?.editable || false,
      cellEditor: item?.type === "select" ? "agSelectCellEditor" : null,
      cellEditorParams:
        item?.type === "select"
          ? {
              values: item.options.map((item) => item.name),
              valueLabels: "label",
              
               
            }
          : null,
    };
  });

  //  

  //  
  const addNewRow = () => {
    if (rowData.length === 0) {
      setRowData(accessorData);
    } else {
      setRowData([...rowData, accessorData]);
    }
  };
  const onCellValueChanged = (params) => {
    const updatedRowData = [...rowData];
    //  
    //  
    // const { data, newValue } = params;
    // const index = updatedRowData.findIndex((row) => row.make === data.make);
    // updatedRowData[index] = { ...data, price: newValue };
    setRowData(updatedRowData);
  };
  return (
    <div className="ag-theme-alpine" style={{ height: 300, width: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={columnDefs}
        onCellValueChanged={onCellValueChanged}
        cellEditor={columnDefs?.cellEditor}
        cellEditorParams={columnDefs?.cellEditorParams}
        defaultColDef={{
          flex: 1,
          minWidth: 200,
        }}
      />
      <Button onClick={addNewRow}>Add New Row</Button>
    </div>
  );
};

export default AgGridTableCreate;
