import React, { useState, useEffect } from "react";
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
  Divider,
} from "@chakra-ui/react";
import { set } from "lodash";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import TableComponent from "../../Components/TableComponent";
import { SelectComponent, SelectOption } from "../../Components/SelectOption";
import { JobContext } from "../../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN_WELL } from "../../../../Reducer/reducer";
import { useParams } from "react-router-dom";

const WellSummaryForm = ({ data, onChange, unittype }) => {
  const datas = data?.data;
  // 

  const { state, dispatch } = React.useContext(JobContext);
  const jobPlanExpDev = state.jobPlanExpDev?.job_plan?.well?.well_summary || [];
  const {job_id} = useParams();

  React.useEffect(() => {
    if (unittype) {
      setFormData({
        ...formData,
        unit_type: unittype,
      });
    }
  }, [unittype]);
  // State untuk menampung data dari form dan tabel
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState({
    unit_type: "METRICS",
    section_name: "",
    depth_datum: "RT",
    top_depth: 0,
    bottom_depth: 0,
    hole_diameter: 0,
    bit: "",
    casing_outer_diameter: 0,
    logging: "",
    mud_type: "",
    mud_weight: 0,
    mud_viscosity: 0,
    mud_ph_level: 0,
    slurry_volume: 0,
    slurry_mix: 0,
    bottom_hole_temperature: 0,
    rate_of_penetration: 0,
    weight_on_bit: 0,
    rotary_speed: 0,
    remarks: "",
  });

  // Mengisi tabel ketika menerima data dari parent
  // useEffect(() => {
  //   if (data?.well?.well_summary) {
  //     setTableData(data.well.well_summary); // Isi tabel jika ada data well_summary
  //   }
  // }, [data]);

  useEffect(() => {
    if(job_id){
        setTableData((prev)=>([...prev,...jobPlanExpDev]))
    }
  }, [tableData]);

  // 

  // Handle perubahan pada form
  const handleChangeData = (name, type) => (e) => {
    let value = e.target.value;

    if (type === "number") {
      value = value.includes(".") ? parseFloat(value) : parseInt(value, 10);
      if (isNaN(value)) value = ""; // Jika parsing gagal, set nilai menjadi string kosong
    } else if (type === "text") {
      value = String(value);
    }

    // Set data form lokal
    setFormData((prevData) => {
      const newData = { ...prevData };
      set(newData, name, value);
      return newData;
    });
  };

  // 
  // 
  // React.useEffect(() => {
  //   setTableData([formData]);
  // }, [formData]);

  // Handle menambah data ke tabel
  const handleAddData = () => {
    const updatedTableData = [...tableData, formData]; // Tambah data baru ke tabel
    setTableData(updatedTableData);

    // Reset form setelah menambahkan data
    setFormData({
      unit_type: "METRICS",
      section_name: "",
      depth_datum: "RT",
      top_depth: 0,
      bottom_depth: 0,
      hole_diameter: 0,
      bit: "",
      casing_outer_diameter: 0,
      logging: "",
      mud_type: "WATER BASED MUD",
      mud_weight: 0,
      mud_viscosity: 0,
      mud_ph_level: 0,
      slurry_volume: 0,
      slurry_mix: 0,
      bottom_hole_temperature: 0,
      rate_of_penetration: 0,
      weight_on_bit: 0,
      rotary_speed: 0,
      remarks: "",
    });

    // Kirim perubahan ke parent untuk `well_summary` di `datas.job_plan.well`
    // onChange("well.well_summary", updatedTableData);
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: {
        well_summary: updatedTableData,
      },
    });
  };

  const options = ["MSL", "RT", "RKB"];

  const handleDelete = (row) => {
    const updatedTableData = tableData.filter((item) => item !== row);
    setTableData(updatedTableData);

    // Kirim perubahan ke parent setelah menghapus data
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: {
        well_summary: updatedTableData,
      },
    });
  };

  const headers = [
    { Header: "Depth Datum", accessor: "depth_datum" },
    { Header: "Top Depth", accessor: "top_depth" },
    { Header: "Bottom Depth", accessor: "bottom_depth" },
    { Header: "Hole Diameter", accessor: "hole_diameter" },
    { Header: "Bit", accessor: "bit" },
    { Header: "Casing Outer Diameter", accessor: "casing_outer_diameter" },
    { Header: "Logging", accessor: "logging" },
    { Header: "Mud Type", accessor: "mud_type" },
    { Header: "Mud Weight", accessor: "mud_weight" },
    { Header: "Mud Viscosity", accessor: "mud_viscosity" },
    { Header: "Mud pH Level", accessor: "mud_ph_level" },
    { Header: "Cement Slurry Volume", accessor: "slurry_volume" },
    { Header: "Cement Slurry Mix", accessor: "slurry_mix" },
    { Header: "Bottom Hole Temperature", accessor: "bottom_hole_temperature" },
    { Header: "Rate of Penetration", accessor: "rate_of_penetration" },
    { Header: "Weight on Bit", accessor: "weight_on_bit" },
    { Header: "Rotary Speed", accessor: "rotary_speed" },
    { Header: "Remarks", accessor: "remarks" },
    {
      Header: "Action",
      accessor: "actions",
      render: (rowData) => (
        <Button
          colorScheme="red"
          variant="solid"
          onClick={() => handleDelete(rowData)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={4} fontFamily={"Mulish"}>
      {/* Grid Item pertama */}
      <GridItem>
        <CardFormK3
          title="Well Summary"
          padding="36px 28px"
          subtitle="Well Details"
          OptionDepth={options}
          OptionValue={(e) =>
            setFormData((prev) => ({ ...prev, depth_datum: e }))
          }
        >
          <Flex gap={2}>
            <FormControlCard
              labelForm="Depth"
              placeholder="Depth"
              type="number"
              value={formData.depth}
              handleChange={handleChangeData("depth", "number")}
            />
            <FormControlCard
              labelForm="Hole Diameter"
              placeholder="Hole Diameter"
              type="number"
              value={formData.hole_diameter}
              handleChange={handleChangeData("hole_diameter", "number")}
            />
          </Flex>
          <Flex gap={2}>
            <FormControlCard
              labelForm="Casing Outer Diameter"
              placeholder="Casing Outer Diameter"
              type="number"
              value={formData.casing_outer_diameter}
              handleChange={handleChangeData("casing_outer_diameter", "number")}
            />
          </Flex>
          <Flex gap={2}>
            <FormControlCard
              labelForm="Top Depth"
              placeholder="Top Depth"
              type="number"
              value={formData.top_depth}
              handleChange={handleChangeData("top_depth", "number")}
            />
            <FormControlCard
              labelForm="Bottom Depth"
              placeholder="Bottom Depth"
              type="number"
              value={formData.bottom_depth}
              handleChange={handleChangeData("bottom_depth", "number")}
            />
          </Flex>
          <Divider
            orientation="horizontal"
            colorScheme="black"
            variant={"solid"}
          />

          {/* <FormControlCard
            labelForm="Mud Type"
            placeholder="Mud Type"
            type="text"
            value={formData.mud_type}
            handleChange={handleChangeData("mud_type", "text")}
          /> */}
          <Grid templateColumns="repeat(2, 1fr)" gap={2}>
            <GridItem>
              <SelectComponent
                label="Mud Type"
                value={formData.mud_type}
                onChange={handleChangeData("mud_type", "text")}
              >
                <SelectOption
                  value={"WATER BASED MUD"}
                  label={"WATER BASED MUD"}
                />
                <SelectOption value={"OIL BASED MUD"} label={"OIL BASED MUD"} />
              </SelectComponent>

              <FormControlCard
                labelForm="Weight"
                placeholder="Weight"
                type="number"
                value={formData.mud_weight}
                handleChange={handleChangeData("mud_weight", "number")}
              />
            </GridItem>
            <GridItem>
              <FormControlCard
                labelForm="Viscosity"
                placeholder="Viscosity"
                type="number"
                value={formData.mud_viscosity}
                handleChange={handleChangeData("mud_viscosity", "number")}
              />
              <FormControlCard
                labelForm="PH Level"
                placeholder="PH Level"
                type="number"
                value={formData.mud_ph_level}
                handleChange={handleChangeData("mud_ph_level", "number")}
              />
            </GridItem>
            {/* <Divider
              orientation="horizontal"
              colorScheme="black"
              variant={"solid"}
            /> */}
            <GridItem>
              <FormControlCard
                labelForm="Slurry Volume"
                placeholder="Slurry Volume"
                type="number"
                value={formData.slurry_volume}
                handleChange={handleChangeData("slurry_volume", "number")}
              />
              <FormControlCard
                labelForm="Slurry Mix"
                placeholder="Slurry Mix"
                type="text"
                value={formData.slurry_mix}
                handleChange={handleChangeData("slurry_mix", "text")}
              />
            </GridItem>
            {/* <Divider
              orientation="horizontal"
              colorScheme="black"
              variant={"solid"}
            /> */}
            <GridItem>
              <FormControlCard
                labelForm="Bit"
                placeholder="Bit"
                type="text"
                value={formData.bit}
                handleChange={handleChangeData("bit", "text")}
              />
              <FormControlCard
                labelForm="Logging Program"
                placeholder="Logging Program"
                type="number"
                value={formData.logging_program}
                handleChange={handleChangeData("logging_program", "number")}
              />
            </GridItem>
            <GridItem colSpan={2}>
              <FormControlCard
                labelForm="Bottom Hole Temperature"
                placeholder="Bottom Hole Temperature"
                type="number"
                value={formData.bottom_hole_temperature}
                handleChange={handleChangeData(
                  "bottom_hole_temperature",
                  "number"
                )}
              />
            </GridItem>
            <GridItem>
              <FormControlCard
                labelForm="Rate of Penetration"
                placeholder="Rate of Penetration"
                type="number"
                value={formData.rate_of_penetration}
                handleChange={handleChangeData("rate_of_penetration", "number")}
              />
            </GridItem>

            <FormControlCard
              labelForm="Weight On Bit"
              placeholder="Weight On Bit"
              type="number"
              value={formData.weight_on_bit}
              handleChange={handleChangeData("weight_on_bit", "number")}
            />
            <FormControlCard
              labelForm="Rotary Speed"
              placeholder="Rotary Speed"
              type="number"
              value={formData.rotary_speed}
              handleChange={handleChangeData("rotary_speed", "number")}
              inputRightOn={"RPM"}
            />
            <GridItem>
              <FormControlCard
                labelForm="Remarks"
                placeholder="Remarks"
                type="text"
                isTextArea
                value={formData.remarks}
                handleChange={handleChangeData("remarks", "text")}
              />
            </GridItem>
          </Grid>

          <Flex mt={4}>
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

export default WellSummaryForm;
