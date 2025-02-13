import React, { useEffect } from "react";
import CardFormK3 from "../../Components/CardFormK3";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Radio,
  RadioGroup,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import FormControlCard from "../../Components/FormControl";
import TableComponent from "../../Components/TableComponent";
import { SelectComponent, SelectOption } from "../../Components/SelectOption";
import { GetCodeTimeBreakDown } from "../../../API/APIKKKS";

const TimeBreakdown = ({ handleChange, initialData = null }) => {
  const [codeTime, setCodeTime] = React.useState([]);
  const [tableData, setTableData] = React.useState([]);
  const [errors, setErrors] = React.useState({});
  const [radio, setRadio] = React.useState("");
  const [formData, setFormData] = React.useState({
    start_time: "",
    end_time: "",
    start_measured_depth: "",
    end_measured_depth: "",
    category: "",
    p: "",
    npt: "",
    code: "",
    operation: "",
  });
  React.useEffect(() => {
    if (initialData && initialData.length > 0) {
      setTableData(initialData);
    }
  }, [initialData]);
  React.useEffect(() => {
    GetCodeTimeBreakDown().then((res) => {
      setCodeTime(res);
    });
  }, []);

  React.useEffect(() => {
    handleChange(tableData);
  }, [tableData]);

  const enumCategory = [
    { label: "Drilling", value: "DRILLING" },
    { label: "Completion", value: "COMPLETION" },
    { label: "Work Over", value: "WORKOVER" },
  ];

  const headers = [
    { Header: "Start Time", accessor: "start_time" },
    { Header: "End Time", accessor: "end_time" },
    { Header: "Start Measured Depth", accessor: "start_measured_depth" },
    { Header: "End Measured Depth", accessor: "end_measured_depth" },
    { Header: "Category", accessor: "category" },
    { Header: "P", accessor: "p" },
    { Header: "NPT", accessor: "npt" },
    { Header: "Code", accessor: "code" },
    { Header: "Operation", accessor: "operation" },
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

  const handleChangeData = (name) => (e) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: e.target.value,
    }));
  };

  useEffect(() => {
    if (radio === "Productive") {
      setFormData((prevData) => ({
        ...prevData,
        p: "Y",
        npt: "P",
      }));
    } else if (radio === "Non_Productive") {
      setFormData((prevData) => ({
        ...prevData,
        p: "N",
        npt: "NP",
      }));
    }
  }, [radio]);

  const validateFormData = () => {
    let tempErrors = {};
    if (!formData.start_time) tempErrors.start_time = "Start Time is required";
    if (!formData.end_time) tempErrors.end_time = "End Time is required";
    if (!formData.start_measured_depth)
      tempErrors.start_measured_depth = "Start Measured Depth is required";
    if (!formData.end_measured_depth)
      tempErrors.end_measured_depth = "End Measured Depth is required";
    if (!formData.category) tempErrors.category = "Category is required";
    if (!formData.code) tempErrors.code = "Code is required";
    if (!formData.operation) tempErrors.operation = "Operation is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // Returns true if no errors
  };

  const handleAddData = () => {
    if (validateFormData()) {
      setTableData((prevTableData) => [...prevTableData, formData]);
      setRadio("");
      setFormData({
        start_time: "",
        end_time: "",
        start_measured_depth: "",
        end_measured_depth: "",
        category: "",
        p: "",
        npt: "",
        code: "",
        operation: "",
      }); // Reset form
    }
  };

  const handleDelete = (row) => {
    setTableData((prevTableData) =>
      prevTableData.filter((data) => data !== row)
    );
  };

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={4} fontFamily={"Mulish"}>
      {/* Grid Item pertama */}
      <GridItem>
        <CardFormK3 title="Time Breakdown" padding="18px 8px" subtitle="time">
          <Flex gap={2}>
            <FormControlCard
              labelForm="Start Time"
              placeholder="Start Time"
              type="time"
              max="999"
              min="0"
              step="1"
              value={formData.start_time}
              handleChange={handleChangeData("start_time")}
              isInvalid={!!errors.start_time}
              errorMessage={errors.start_time}
            />
            <FormControlCard
              labelForm="End Time"
              placeholder="End Time"
              type="time"
              max="999"
              min="0"
              step="1"
              value={formData.end_time}
              isDisabled={!formData.start_time}
              handleChange={handleChangeData("end_time")}
              isInvalid={!!errors.end_time}
              errorMessage={errors.end_time}
            />
          </Flex>
          <Flex gap={2}>
            <FormControlCard
              labelForm="Start Depth"
              placeholder="Depth"
              type="number"
              value={formData.start_measured_depth}
              handleChange={handleChangeData("start_measured_depth")}
              isInvalid={!!errors.start_measured_depth}
              errorMessage={errors.start_measured_depth}
            />
            <FormControlCard
              labelForm="End Depth"
              placeholder="Depth"
              type="number"
              value={formData.end_measured_depth}
              handleChange={handleChangeData("end_measured_depth")}
              isInvalid={!!errors.end_measured_depth}
              errorMessage={errors.end_measured_depth}
            />
          </Flex>
          <Flex>
            <RadioGroup value={radio} onChange={setRadio}>
              <VStack>
                <Flex flexDirection={"column"} gap={2}>
                  <Radio value="Productive">Productive</Radio>
                  <Radio value="Non_Productive">Non Productive</Radio>
                </Flex>
              </VStack>
            </RadioGroup>
          </Flex>
          <Flex gap={2}>
            <SelectComponent
              onChange={handleChangeData("code")}
              label="Code"
              value={formData.code}
              placeholder="Select Code"
              isInvalid={!!errors.code}
              errorMessage={errors.code}
            >
              {codeTime.map((data, index) => (
                <SelectOption
                  label={data.name}
                  value={data.value}
                  key={index}
                />
              ))}
            </SelectComponent>
            <SelectComponent
              onChange={handleChangeData("category")}
              label="Category"
              placeholder="Select Category"
              value={formData.category}
              isInvalid={!!errors.category}
              errorMessage={errors.category}
            >
              {enumCategory.map((data, index) => (
                <SelectOption
                  label={data.label}
                  value={data.value}
                  key={index}
                />
              ))}
            </SelectComponent>
          </Flex>
          <Flex gap={2}>
            <FormControlCard
              labelForm="Operation"
              placeholder="Operation"
              value={formData.operation}
              handleChange={handleChangeData("operation")}
              isInvalid={!!errors.operation}
              errorMessage={errors.operation}
            />
          </Flex>
          <Flex>
            <Button colorScheme="blue" variant="solid" onClick={handleAddData}>
              Add
            </Button>
          </Flex>
        </CardFormK3>
      </GridItem>

      {/* Grid Item kedua */}
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

export default TimeBreakdown;
