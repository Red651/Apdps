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

const Personel = ({ handleChangeOfData, initialData = null }) => {
  // formData untuk company dan people
  const [tableData, setTableData] = React.useState([]);
  const [formData, setFormData] = React.useState({
    company: "", // Nama perusahaan
    people: 0, // Jumlah orang
  });

  React.useEffect(() => {
    initialData && setTableData(initialData);
  }, [initialData]);

  React.useEffect(() => {
    handleChangeOfData(tableData);
  }, [tableData]);

  // Header untuk table
  const headers = [
    { Header: "Company", accessor: "company" },
    { Header: "People", accessor: "people" },
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

  // Fungsi untuk mengubah formData saat ada input perubahan
  const handleChangeData = (name) => (e) => {
    const { value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  // Menambahkan data ke dalam table
  const handleAddData = () => {
    setTableData((prevTableData) => [...prevTableData, formData]);
    setFormData({
      company: "",
      people: 0,
    }); // Reset form setelah menambahkan data
  };

  // Menghapus baris data dari tabel
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
        <CardFormK3 title="Personnel" padding="18px 8px" subtitle="Person">
          <FormControlCard
            labelForm="Company"
            placeholder="Enter Company"
            type="text"
            value={formData.company}
            handleChange={handleChangeData("company")}
          />
          <FormControlCard
            labelForm="People"
            placeholder="Enter Number of People"
            type="number"
            value={formData.people}
            handleChange={handleChangeData("people")}
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
        <Box rounded="lg" overflowX="auto" overflowY="auto" borderWidth="1px">
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

export default Personel;
