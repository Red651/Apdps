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

const MaterialForm = ({handleChangeOfData,initialData}) => {
  const [tableData, setTableData] = React.useState([]);
  const [formData, setFormData] = React.useState({
    material_type: "",
    material_name: "",
    material_uom: "",
    received: 0,
    consumed: 0,
    returned: 0,
    adjust: 0,
    ending: 0,
  });
 React.useEffect(()=> {
  initialData && setTableData(initialData)
 },[initialData])

  React.useEffect(() => {
    handleChangeOfData(tableData);
  }, [tableData]);
  const [errors, setErrors] = React.useState({});

  const headers = [
    { Header: "Material Type", accessor: "material_type" },
    { Header: "Material Name", accessor: "material_name" },
    { Header: "Material UOM", accessor: "material_uom" },
    { Header: "Received", accessor: "received" },
    { Header: "Consumed", accessor: "consumed" },
    { Header: "Returned", accessor: "returned" },
    { Header: "Adjust", accessor: "adjust" },
    { Header: "Ending", accessor: "ending" },
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
    if (!formData.material_type) tempErrors.material_type = "Material Type is required";
    if (!formData.material_name) tempErrors.material_name = "Material Name is required";
    if (!formData.material_uom) tempErrors.material_uom = "Material UOM is required";
    if (formData.received === null) tempErrors.received = "Received amount is required";
    if (formData.consumed === null) tempErrors.consumed = "Consumed amount is required";
    if (formData.returned === null) tempErrors.returned = "Returned amount is required";
    if (formData.adjust === null) tempErrors.adjust = "Adjust amount is required";
    if (formData.ending === null) tempErrors.ending = "Ending amount is required";

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0; // Returns true if no errors
  };

  const handleAddData = () => {
    if (validateFormData()) {
      setTableData((prevTableData) => [...prevTableData, formData]);
      setFormData({
        material_type: "",
        material_name: "",
        material_uom: "",
        received: 0,
        consumed: 0,
        returned: 0,
        adjust: 0,
        ending: 0,
      });
      setErrors({}); // Clear errors after successful addition
    }
  };

  const handleDelete = (row) => {
    setTableData((prevTableData) =>
      prevTableData.filter((data) => data !== row)
    );
  };

  return (
    <Grid templateColumns="repeat(1, 1fr)" gap={4} fontFamily={"Mulish"}>
      <GridItem>
        <CardFormK3
          title="Bulk Material"
          padding="18px 8px"
          subtitle="Material"
        >
          <FormControlCard
            labelForm="Material Type"
            placeholder="Enter Material Type"
            type="text"
            value={formData.material_type}
            handleChange={handleChangeData("material_type")}
            isInvalid={!!errors.material_type}
            errorMessage={errors.material_type}
          />
          <FormControlCard
            labelForm="Material Name"
            placeholder="Enter Material Name"
            type="text"
            value={formData.material_name}
            handleChange={handleChangeData("material_name")}
            isInvalid={!!errors.material_name}
            errorMessage={errors.material_name}
          />
          <FormControlCard
            labelForm="Material UOM"
            placeholder="Enter Material UOM"
            type="text"
            value={formData.material_uom}
            handleChange={handleChangeData("material_uom")}
            isInvalid={!!errors.material_uom}
            errorMessage={errors.material_uom}
          />
          <FormControlCard
            labelForm="Received"
            placeholder="Enter Received Amount"
            type="number"
            value={formData.received}
            handleChange={handleChangeData("received")}
            isInvalid={!!errors.received}
            errorMessage={errors.received}
          />
          <FormControlCard
            labelForm="Consumed"
            placeholder="Enter Consumed Amount"
            type="number"
            value={formData.consumed}
            handleChange={handleChangeData("consumed")}
            isInvalid={!!errors.consumed}
            errorMessage={errors.consumed}
          />
          <FormControlCard
            labelForm="Returned"
            placeholder="Enter Returned Amount"
            type="number"
            value={formData.returned}
            handleChange={handleChangeData("returned")}
            isInvalid={!!errors.returned}
            errorMessage={errors.returned}
          />
          <FormControlCard
            labelForm="Adjust"
            placeholder="Enter Adjustment"
            type="number"
            value={formData.adjust}
            handleChange={handleChangeData("adjust")}
            isInvalid={!!errors.adjust}
            errorMessage={errors.adjust}
          />
          <FormControlCard
            labelForm="Ending"
            placeholder="Enter Ending Amount"
            type="number"
            value={formData.ending}
            handleChange={handleChangeData("ending")}
            isInvalid={!!errors.ending}
            errorMessage={errors.ending}
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
      <GridItem>
        <Box
          rounded="lg"
          overflowX="auto"
          overflowY="auto"
          borderWidth="1px"
          p={0}
        >
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
        </Box>
      </GridItem>
    </Grid>
  );
};

export default MaterialForm;
