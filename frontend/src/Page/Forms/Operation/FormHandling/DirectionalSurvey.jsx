import React from "react";
import CardFormK3 from "../../Components/CardFormK3";
import {
  Box,
  Button,
  Grid,
  GridItem,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "@chakra-ui/react";
import FormControlCard from "../../Components/FormControl";
import TableComponent from "../../Components/TableComponent";

const DirectionalSurvey = ({handleChangeOfData, initialData=null}) => {
  const [tableData, setTableData] = React.useState([]);
  const [formData, setFormData] = React.useState({
    measured_depth: "",
    inclination: "",
    azimuth: "",
  });

  React.useEffect(() => {
    initialData && setTableData(initialData)
  }, [initialData])

  React.useEffect(() => {
    handleChangeOfData(tableData)
  }, [tableData])

  const [errors, setErrors] = React.useState({});

  const headers = [
    { Header: "Measured Depth", accessor: "measured_depth" },
    { Header: "Inclination", accessor: "inclination" },
    { Header: "Azimuth", accessor: "azimuth" },
    {
      Header: "Action",
      render: (row) => (
        <Button
          colorScheme="red"
          variant="solid"
          onClick={() => handleDelete(row)}
        >
          Delete
        </Button>
      ),
    },
  ];

  const handleChangeData = (name) => (e) => {
    const { value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const validateFormData = () => {
    let tempErrors = {};
    if (!formData.measured_depth) tempErrors.measured_depth = "Measured Depth is required";
    if (!formData.inclination) tempErrors.inclination = "Inclination is required";
    if (!formData.azimuth) tempErrors.azimuth = "Azimuth is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleAddData = () => {
    if (validateFormData()) {
      setTableData((prevTableData) => [...prevTableData, formData]);
      setFormData({
        measured_depth: "",
        inclination: "",
        azimuth: "",
      });
      setErrors({});
    }
  };

  const handleDelete = (row) => {
    setTableData((prevTableData) =>
      prevTableData.filter((data) => data !== row)
    );
  };

  return (
    <Grid
      templateColumns="repeat(2, 1fr)"
      minW="100%"
      w="100%"
      h="100%"
      gap={4}
      fontFamily={"Mulish"}
    >
      <GridItem>
        <CardFormK3
          title="Directional Data"
          padding="18px 8px"
          subtitle="Measurements"
        >
          <FormControlCard
            labelForm="Measured Depth"
            placeholder="Enter Measured Depth"
            type="number"
            value={formData.measured_depth}
            handleChange={handleChangeData("measured_depth")}
            isInvalid={!!errors.measured_depth}
            errorMessage={errors.measured_depth}
          />
          <FormControlCard
            labelForm="Inclination"
            placeholder="Enter Inclination"
            type="number"
            value={formData.inclination}
            handleChange={handleChangeData("inclination")}
            isInvalid={!!errors.inclination}
            errorMessage={errors.inclination}
          />
          <FormControlCard
            labelForm="Azimuth"
            placeholder="Enter Azimuth"
            type="number"
            value={formData.azimuth}
            handleChange={handleChangeData("azimuth")}
            isInvalid={!!errors.azimuth}
            errorMessage={errors.azimuth}
          />
          <Button
            colorScheme="blue"
            variant="solid"
            onClick={handleAddData}
            mt={4}
          >
            Add
          </Button>
        </CardFormK3>
      </GridItem>
      <Box rounded="lg" overflowX="auto" overflowY="auto" borderWidth="1px">
        <GridItem>
          <Tabs>
            <TabList>
              <Tab>Table</Tab>
            </TabList>
            <TabPanel>
              <Box maxH="510px">
                <TableComponent data={tableData} headers={headers} />
              </Box>
            </TabPanel>
          </Tabs>
        </GridItem>
      </Box>
    </Grid>
  );
};

export default DirectionalSurvey;