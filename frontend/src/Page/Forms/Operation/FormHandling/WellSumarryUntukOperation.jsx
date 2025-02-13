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
  Divider,
} from "@chakra-ui/react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import TableComponent from "../../Components/TableComponent";
import { SelectComponent, SelectOption } from "../../Components/SelectOption";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";

const WellSummaryForm = ({ unittype }) => {
  const { state, dispatch } = useJobContext();
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState({
    unit_type: unittype || "METRICS",
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

  useEffect(() => {
    if (state?.initialOperationData?.actual_job?.well?.well_summary) {
      setTableData(state.initialOperationData.actual_job.well.well_summary);
    }
  }, [state?.initialOperationData?.actual_job?.well?.well_summary]);

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      unit_type: unittype || "METRICS",
    }));
  }, [unittype]);

  const handleChangeData = useCallback(
    (name, type) => (e) => {
      const value = e.target?.value ?? e;
      let processedValue = value;

      if (type === "number") {
        processedValue = value === "" ? 0 : parseFloat(value);
      }

      setFormData((prevData) => ({
        ...prevData,
        [name]: processedValue,
      }));
    },
    []
  );

  const handleAddData = useCallback(() => {
    const updatedTableData = [...tableData, formData];
    setTableData(updatedTableData);

    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: {
        ...state.initialOperationData,
        actual_job: {
          ...state.initialOperationData?.actual_job,
          well: {
            ...state.initialOperationData?.actual_job?.well,
            well_summary: updatedTableData,
          },
        },
      },
    });

    setFormData({
      unit_type: unittype || "METRICS",
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
  }, [dispatch, formData, tableData, unittype, state.initialOperationData]);

  const handleDelete = useCallback(
    (row) => {
      const updatedTableData = tableData.filter((item) => item !== row);
      setTableData(updatedTableData);

      dispatch({
        type: UPDATE_OPERATION_DATA,
        payload: {
          ...state.initialOperationData,
          actual_job: {
            ...state.initialOperationData?.actual_job,
            well: {
              ...state.initialOperationData?.actual_job?.well,
              well_summary: updatedTableData,
            },
          },
        },
      });
    },
    [dispatch, tableData, state.initialOperationData]
  );

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
      <GridItem>
        <CardFormK3
          title="Well Summary"
          padding="36px 28px"
          subtitle="Well Details"
          OptionDepth={["MSL", "RT", "RKB"]}
          OptionValue={(e) =>
            setFormData((prevData) => ({ ...prevData, depth_datum: e }))
          }
        >
          <Flex gap={2}>
            <FormControlCard
              labelForm="Depth"
              placeholder="Depth"
              type="number"
              value={formData.top_depth}
              handleChange={handleChangeData("top_depth", "number")}
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
                labelForm="pH Level"
                placeholder="pH Level"
                type="number"
                value={formData.mud_ph_level}
                handleChange={handleChangeData("mud_ph_level", "number")}
              />
            </GridItem>
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
                type="text"
                value={formData.logging}
                handleChange={handleChangeData("logging", "text")}
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
