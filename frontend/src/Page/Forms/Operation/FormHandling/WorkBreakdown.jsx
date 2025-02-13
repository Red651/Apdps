import React, { useEffect } from "react";
import CardFormK3 from "../../Components/CardFormK3";
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
} from "@chakra-ui/react";
import FormControlCard from "../../Components/FormControl";
import TableComponent from "../../Components/TableComponent";

const WorkBreakdown = ({ data, onChange }) => {
  // Mengisi tableData dan formData dengan nilai dari data yang diterima dari parent
  const [tableData, setTableData] = React.useState([]);
  const [formData, setFormData] = React.useState({
    event: "",
    start_date: "",
    end_date: "",
    remarks: "",
  });
// 
  useEffect(() => {
    if (data?.job_plan?.work_breakdown_structure) {
      setTableData(data.job_plan.work_breakdown_structure);
    }
  }, [data]);

  const headers = [
    { Header: "Event", accessor: "event" },
    { Header: "Start Date", accessor: "start_date" },
    { Header: "End Date", accessor: "end_date" },
    { Header: "Remarks", accessor: "remarks" },
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
    const value = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleAddData = () => {
    const updatedTableData = [...tableData, formData];
    setTableData(updatedTableData);

    // Kirim perubahan ke parent
    onChange("job_plan.work_breakdown_structure", updatedTableData);

    // Reset form
    setFormData({ event: "", start_date: "", end_date: "", remarks: "" });
  };

  const handleDelete = (row) => {
    const updatedTableData = tableData.filter((data) => data !== row);
    setTableData(updatedTableData);

    // Kirim perubahan ke parent
    onChange("job_plan.work_breakdown_structure", updatedTableData);
  };

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={4}>
      {/* Grid Item pertama */}
      <GridItem>
        <CardFormK3 title="Work Breakdown Structure" subtitle="">
          <Flex>
            <FormControlCard
              labelForm="Event"
              placeholder="Event"
              type="text"
              value={formData.event}
              handleChange={handleChangeData("event")}
            />
          </Flex>
          <Flex gap={2}>
            <FormControlCard
              labelForm="Start Date"
              placeholder="Date"
              type="date"
              value={formData.start_date}
              handleChange={handleChangeData("start_date")}
            />
            <FormControlCard
              labelForm="End Date"
              placeholder="Date"
              type="date"
              min={formData.start_date}
              value={formData.end_date}
              isDisabled={!formData.start_date} // Disable if start_date is empty
              handleChange={handleChangeData("end_date")}
            />
          </Flex>
          <Flex>
            <FormControlCard
              labelForm="Remarks"
              placeholder="Remarks"
              isTextArea
              value={formData.remarks}
              handleChange={handleChangeData("remarks")}
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
      <Box rounded={"lg"} borderWidth={"1px"} p={0}>
        <GridItem>
          <Tabs>
            <TabList>
              <Tab>Table</Tab>
            </TabList>
            <TabPanel>
              {/* <TableComponent data={tableData} headers={headers} /> */}
            </TabPanel>
          </Tabs>
        </GridItem>
      </Box>
    </Grid>
  );
};

export default WorkBreakdown;
