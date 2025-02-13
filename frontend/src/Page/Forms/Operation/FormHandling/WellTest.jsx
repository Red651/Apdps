import React, { useState, useEffect, useCallback } from "react";
import {
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Button,
  Box,
  Grid,
  GridItem,
  Flex,
  useToast,
} from "@chakra-ui/react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import TableComponent from "../../Components/TableComponent";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";

const WellTestForm = () => {
  const { state, dispatch } = useJobContext();
  const toast = useToast();
  const data = state?.initialOperationData?.actual_job?.well?.well_tests;
  const unittype = state?.initialOperationData?.actual_job?.well?.unit_type || "METRICS";

  const [tableData, setTableData] = useState([]);
  
  const [formData, setFormData] = useState({
    unit_type: unittype,
    depth_datum: "",
    zone_name: "",
    zone_top_depth: 0,
    zone_bottom_depth: 0,
    depth_uom: "",
  });

  useEffect(() => {
    if (data) {
      setTableData(data);
    }
  }, [data]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      unit_type: unittype
    }));
  }, [unittype]);

  const validateFormData = useCallback((data) => {
    const errors = [];

    if (!data.depth_datum) {
      errors.push("Depth datum harus diisi");
    }

    if (!data.zone_name.trim()) {
      errors.push("Zone name harus diisi");
    }

    if (data.zone_top_depth >= data.zone_bottom_depth) {
      errors.push("Zone top depth harus lebih kecil dari zone bottom depth");
    }

    if (!data.depth_uom.trim()) {
      errors.push("Depth UOM harus diisi");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  const handleChangeData = useCallback((name, type) => (e) => {
    let value = e.target.value;

    if (type === "number") {
      value = value.includes(".") ? parseFloat(value) : parseInt(value, 10);
      if (isNaN(value)) value = "";
    } else if (type === "text") {
      value = String(value);
    }

    setFormData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  }, []);

  const handleAddData = useCallback(() => {
    const { isValid, errors } = validateFormData(formData);

    if (!isValid) {
      toast({
        title: "Validation Error",
        description: errors.join('\n'),
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top"
      });
      return;
    }

    const updatedTableData = [...tableData, formData];
    setTableData(updatedTableData);
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: {
        ...state.initialOperationData,
        actual_job: {
          ...state.initialOperationData.actual_job,
          well: {
            ...state.initialOperationData.actual_job.well,
            well_test: updatedTableData,
          },
        },
      },
    });

    setFormData({
      unit_type: unittype,
      depth_datum: "",
      zone_name: "",
      zone_top_depth: 0,
      zone_bottom_depth: 0,
      depth_uom: "",
    });

    toast({
      title: "Success",
      description: "Data well test berhasil ditambahkan",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top"
    });
  }, [formData, tableData, dispatch, state.initialOperationData, unittype, validateFormData, toast]);

  const handleDelete = useCallback((row) => {
    const updatedTableData = tableData.filter((data) => data !== row);
    setTableData(updatedTableData);
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: {
        ...state.initialOperationData,
        actual_job: {
          ...state.initialOperationData.actual_job,
          well: {
            ...state.initialOperationData.actual_job.well,
            well_test: updatedTableData,
          },
        },
      },
    });

    toast({
      title: "Success",
      description: "Data berhasil dihapus",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top"
    });
  }, [tableData, dispatch, state.initialOperationData, toast]);

  const options = ["MSL", "KB", "GL"];

  const headers = [
    { Header: "Unit Type", accessor: "unit_type" },
    { Header: "Depth Datum", accessor: "depth_datum" },
    { Header: "Zone Name", accessor: "zone_name" },
    { Header: "Zone Top Depth", accessor: "zone_top_depth" },
    { Header: "Zone Bottom Depth", accessor: "zone_bottom_depth" },
    { Header: "Depth UOM", accessor: "depth_uom" },
    {
      Header: "Action",
      render: (row) => (
        <Button
          colorScheme="red"
          variant="solid"
          onClick={() => handleDelete(row)}
        >
          Hapus
        </Button>
      ),
    },
  ];

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={4} fontFamily={"Mulish"}>
      <GridItem>
        <CardFormK3
          title="Well Test"
          padding="36px 28px"
          subtitle="Well Test"
          OptionDepth={options}
          OptionValue={(e) =>
            setFormData((prev) => ({ ...prev, depth_datum: e }))
          }
        >
          <Flex gap={2}>
            <FormControlCard
              labelForm="Unit Type"
              placeholder="Unit Type"
              type="text"
              isDisabled
              value={formData.unit_type}
              handleChange={handleChangeData("unit_type", "text")}
            />
            <FormControlCard
              labelForm="Depth Datum"
              placeholder="Depth Datum"
              type="text"
              value={formData.depth_datum}
              handleChange={handleChangeData("depth_datum", "text")}
            />
          </Flex>
          <Flex gap={2}>
            <FormControlCard
              labelForm="Zone Name"
              placeholder="Zone Name"
              type="text"
              value={formData.zone_name}
              handleChange={handleChangeData("zone_name", "text")}
            />
            <FormControlCard
              labelForm="Zone Top Depth"
              placeholder="Zone Top Depth"
              type="number"
              value={formData.zone_top_depth}
              handleChange={handleChangeData("zone_top_depth", "number")}
            />
          </Flex>
          <Flex gap={2}>
            <FormControlCard
              labelForm="Zone Bottom Depth"
              placeholder="Zone Bottom Depth"
              type="number"
              value={formData.zone_bottom_depth}
              handleChange={handleChangeData("zone_bottom_depth", "number")}
            />
            <FormControlCard
              labelForm="Depth UOM"
              placeholder="Depth UOM"
              type="text"
              value={formData.depth_uom}
              handleChange={handleChangeData("depth_uom", "text")}
            />
          </Flex>
          <Flex mt={4}>
            <Button colorScheme="blue" variant="solid" onClick={handleAddData}> Add</Button>
          </Flex>
        </CardFormK3>
      </GridItem>

      <Box
        rounded={"lg"}
        overflowX="auto"
        overflowY={"auto"}
        borderWidth={"1px"}
        p={0}
      >
        <GridItem>
          <Tabs>
            <TabList>
              <Tab>Table</Tab>
            </TabList>
            <TabPanel>
              <Box maxH={"510px"}>
                <TableComponent data={tableData} headers={headers} />
              </Box>
            </TabPanel>
          </Tabs>
        </GridItem>
      </Box>
    </Grid>
  );
};

export default WellTestForm;