import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import { useJobContext } from "../../../../Context/JobContext";
import { ADD_WELL_MASTER } from "../../../../Reducer/reducer";
import { IconTrash, IconEdit, IconPlus, IconX, IconTable } from "@tabler/icons-react";
const TableComponent = ({ data, headers, onEdit }) => {
  return (
    <TableContainer>
      <Table variant="simple" colorScheme="gray">
        <Thead>
          <Tr backgroundColor={"gray.100"}>
            {headers.map((column, index) => (
              <Th key={index}>{column.Header}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, rowIndex) => (
            <Tr key={rowIndex}>
              {headers.map((column, colIndex) => (
                <Td key={colIndex}>
                  {column.render
                    ? column.render(row, rowIndex)
                    : row[column.accessor]}
                </Td>
              ))}
              {/* <Td>
                <Button onClick={() => onEdit(rowIndex)}>Edit</Button>
              </Td> */}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
const WellStratigraphyForm = () => {
  const { state, dispatch } = useJobContext();
  const toast = useToast();
  const data = state?.wellMaster?.well_stratigraphy;
  const unittype = state?.wellMaster?.unit_type || "METRICS";
  const depthDatum = state?.wellMaster?.depth_datum || "RT";
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState({});
  // State untuk mode edit
  const [editIndex, setEditIndex] = useState(null);
  useEffect(() => {
    if (data) {
      setTableData(data);
    }
  }, [data]);
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      unit_type: unittype,
    }));
  }, [unittype]);
  const validateFormData = useCallback((data) => {
    const errors = [];
    if (data.top_depth >= data.bottom_depth) {
      errors.push("Top depth harus lebih kecil dari bottom depth");
    }
    if (!data.formation_name.trim()) {
      errors.push("Formation name harus diisi");
    }
    if (!data.lithology.trim()) {
      errors.push("Lithology harus diisi");
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);
  const handleChangeData = useCallback(
    (name, type) => (e) => {
      let value = e.target.value;
      if (type === "number") {
        value = value.includes(".") ? parseFloat(value) : parseInt(value, 10);
        if (isNaN(value)) value = null;
      } else if (type === "text") {
        value = String(value);
      }
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    },
    []
  );
  const handleAddData = useCallback(() => {
    const { isValid, errors } = validateFormData(formData);
    if (!isValid) {
      toast({
        title: "Validation Error",
        description: errors.join("\n"),
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      return;
    }
    let updatedTableData;
    if (editIndex !== null) {
      // Mode Edit
      updatedTableData = tableData.map((item, index) =>
        index === editIndex ? formData : item
      );
      setEditIndex(null);
    } else {
      // Mode Tambah
      updatedTableData = [...tableData, { ...formData }];
    }
    setTableData(updatedTableData);
    const dataNull = updatedTableData.length === 0 ? null : updatedTableData;
    dispatch({
      type: ADD_WELL_MASTER,
      payload: {
            ...state.wellMaster,
            well_stratigraphy: dataNull,
          },
    });
    // Reset form
    setFormData({
      unit_type: unittype,
      depth_datum: depthDatum,
      top_depth: 0,
      bottom_depth: 0,
      formation_name: "",
      lithology: "",
    });
    toast({
      title: "Success",
      description:
        editIndex !== null
          ? "Data stratigraphy berhasil diubah"
          : "Data stratigraphy berhasil ditambahkan",
      status: "success",
      duration: 3000,
      isClosable: true,
      position: "top",
    });
  }, [
    formData,
    tableData,
    dispatch,
    state.wellMaster,
    unittype,
    validateFormData,
    toast,
    editIndex,
    depthDatum,
  ]);
  const handleEdit = useCallback(
    (index) => {
      const selectedItem = tableData[index];
      setFormData(selectedItem);
      setEditIndex(index);
    },
    [tableData]
  );
  const handleCancelEdit = useCallback(() => {
    // Reset form dan mode edit
    setFormData({
      unit_type: unittype,
      depth_datum: depthDatum,
      top_depth: "",
      bottom_depth: "",
      formation_name: "",
      lithology: "",
    });
    setEditIndex(null);
  }, [unittype, depthDatum]);
  const handleDelete = useCallback(
    (index) => {
      const updatedTableData = tableData.filter((_, idx) => idx !== index);
      setTableData(updatedTableData);
      const dataNull = updatedTableData.length === 0 ? null : updatedTableData;
      dispatch({
        type: ADD_WELL_MASTER,
        payload: {
              ...state.wellMaster,
              well_stratigraphy: dataNull,
        },
      });
      toast({
        title: "Success",
        description: "Data berhasil dihapus",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    },
    [tableData, dispatch, state.wellMaster, toast]
  );
  const headers = [
    { Header: "Top Depth", accessor: "top_depth" },
    { Header: "Bottom Depth", accessor: "bottom_depth" },
    { Header: "Depth Datum", accessor: "depth_datum" },
    { Header: "Formation Name", accessor: "formation_name" },
    { Header: "Lithology", accessor: "lithology" },
    {
      Header: "Action",
      accessor: "actions",
      render: (row, rowIndex) => (
        <Flex gap={2}>
          <IconButton
            colorScheme="yellow"
            variant="solid"
            onClick={() => handleEdit(rowIndex)}
            icon={<Icon as={IconEdit} />}
            borderRadius={"full"}
            size="sm"
          />
          <IconButton
            colorScheme="red"
            variant="solid"
            onClick={() => handleDelete(rowIndex)}
            icon={<Icon as={IconTrash} />}
            borderRadius={"full"}
            size="sm"
          />
        </Flex>
      ),
    },
  ];
  return (
    <Grid templateColumns="repeat(2, 1fr)" mt={6} gap={4} fontFamily={"Mulish"}>
      <GridItem>
        <CardFormK3
          title="Well Stratigraphy"
          subtitle="Stratigraphy Details"
          OptionDepth={["MSL", "KB", "RT"]}
          value={formData.depth_datum}
          OptionValue={(e) =>
            setFormData((prev) => ({ ...prev, depth_datum: e }))
          }
        >
          <Flex gap={2}>
            <FormControlCard
              labelForm="Top Depth"
              placeholder="Enter Top Depth"
              type="number"
              inputRightOn={
                unittype === "IMPERIAL"
                  ? "ft"
                  : unittype === "METRICS"
                  ? "m"
                  : null
              }
              value={formData.top_depth}
              handleChange={handleChangeData("top_depth", "number")}
            />
            <FormControlCard
              labelForm="Bottom Depth"
              placeholder="Enter Bottom Depth"
              type="number"
              inputRightOn={
                unittype === "IMPERIAL"
                  ? "ft"
                  : unittype === "METRICS"
                  ? "m"
                  : null
              }
              value={formData.bottom_depth}
              handleChange={handleChangeData("bottom_depth", "number")}
            />
          </Flex>
          <Flex gap={2}>
            <FormControlCard
              labelForm="Formation Name"
              placeholder="Enter Formation Name"
              type="text"
              value={formData.formation_name}
              handleChange={handleChangeData("formation_name", "text")}
            />
            <FormControlCard
              labelForm="Lithology"
              placeholder="Enter Lithology"
              type="text"
              value={formData.lithology}
              handleChange={handleChangeData("lithology", "text")}
            />
          </Flex>
          <Flex mt={4} gap={2} justifyContent="flex-end">
            <Button
              colorScheme={editIndex !== null ? "yellow" : "blue"}
              variant="solid"
              onClick={handleAddData}
              leftIcon={<Icon as={editIndex !== null ? IconEdit : IconPlus} />}
              borderRadius={"full"}
            >
              {editIndex !== null ? "Update" : "Add"}
            </Button>
            {editIndex !== null && (
              <Button
                colorScheme="gray"
                variant="solid"
                onClick={handleCancelEdit}
                leftIcon={<Icon as={IconX} />}
                borderRadius={"full"}
              >
                Cancel
              </Button>
            )}
          </Flex>
        </CardFormK3>
      </GridItem>

      <GridItem>
        <CardFormK3 title="Well Stratigraphy Table" icon={IconTable}>
          <TableComponent
            data={tableData}
            headers={headers}
            onEdit={handleEdit}
          />
        </CardFormK3>
      </GridItem>
    </Grid>
  );
};
export default WellStratigraphyForm;
