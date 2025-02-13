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

const MudAdditive = ({ handleChangeOfData }) => {
  const [tableData, setTableData] = React.useState([]);
  const [radio, setRadio] = React.useState("");
  const [formData, setFormData] = React.useState({
    mud_additive_type: "",
    amount: 0,
  });

  React.useEffect(() => {
    handleChangeOfData(tableData);
  }, [tableData]);

  const headers = [
    // {
    //   Header: "Daily Operations Report ID",
    //   accessor: "daily_operations_report_id",
    // },
    { Header: "Mud Additive Type", accessor: "mud_additive_type" },
    { Header: "Amount", accessor: "amount" },
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

  const handleChangeData = React.useCallback(
    (name, type) => (e) => {
      let value = e.target.value;

      // Jika tipe input adalah number, kita periksa apakah itu float atau integer
      if (type === "number") {
        // Konversi nilai ke number, dan pastikan menerima angka integer dan float
        value = value.includes(".") ? parseFloat(value) : parseInt(value, 10);

        // Jika nilai yang dikonversi tidak valid (misalnya NaN), set nilai menjadi string kosong
        if (isNaN(value)) {
          value = "";
        }
      }

      // Set formData dengan nilai yang baru
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    },
    []
  );

  const handleAddData = () => {
    setTableData((prevTableData) => [...prevTableData, formData]);
    setFormData({
      mud_additive_type: "",
      amount: 0,
    }); // Reset form
  };

  const handleDelete = (row) => {
    setTableData((prevTableData) =>
      prevTableData.filter((data) => data !== row)
    );
  };

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={4} fontFamily={"Mulish"}>
      <GridItem>
        <CardFormK3 title="Mud Additive" padding="18px 8px" subtitle="Mud">
          {/* <FormControlCard
            labelForm="Daily Operations Report ID"
            placeholder="Enter Daily Operations Report ID"
            type="text"
            value={formData.daily_operations_report_id}
            handleChange={handleChangeData("daily_operations_report_id")}
          /> */}
          <FormControlCard
            labelForm="Mud Additive Type"
            placeholder="Enter Mud Additive Type"
            type="text"
            value={formData.mud_additive_type}
            handleChange={handleChangeData("mud_additive_type")}
          />
          <FormControlCard
            labelForm="Amount"
            placeholder="Enter Amount"
            type="number"
            value={formData.amount}
            handleChange={handleChangeData("amount")}
          />
          <Button colorScheme="blue" variant="solid" onClick={handleAddData}>
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

export default MudAdditive;
