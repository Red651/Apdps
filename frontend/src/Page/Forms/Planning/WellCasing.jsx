import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Grid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Select,
  InputGroup,
  InputRightAddon,
  Icon,
  Text,
  Heading,
  HStack,
  IconButton,
  SimpleGrid,
  GridItem,
} from "@chakra-ui/react";
import axios from "axios";
import {
  IconCylinder,
  IconEdit,
  IconTrash,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { JobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN_WELL } from "../../../Reducer/reducer";
import { useParams } from "react-router-dom";
import { updateWith } from "lodash";
import TableDataForm from "../Components/TableDataForm";
import FormControlCard from "../Components/FormControl";
import { SelectComponent, SelectOption } from "../Components/SelectOption";
import {
  SelectComponentV2,
  SelectOptionV2,
} from "../Components/SelectOptionV2";

const WellCasing = ({
  dataWellCasing,
  errorForms = false,
  initialData = null,
  TypeSubmit = "create",
  unittype = "METRICS",
}) => {
  const { state, dispatch } = React.useContext(JobContext);
  const { job_id } = useParams();
  const jobPlanExpDev = state.jobPlanExpDev?.job_plan?.well || null;

  const [showWellCasing, setShowWellCasing] = useState({
    names: [],
    top_depths: [],
    bottom_depths: [],
    diameters: [],
  });
  React.useEffect(() => {
    if (TypeSubmit === "update" && initialData) {
      if (initialData?.well_casing && initialData.well_casing.length > 0) {
        setTableWellCasing((prev) => [...prev, ...initialData.well_casing]);
        updateShowWellCasing(initialData.well_casing);
      } else {
        setTableWellCasing([]); // Set ke null jika well_casing tidak ada
      }
    }
  }, [TypeSubmit]);
  const [imageUrl, setImageUrl] = useState(null);
  const [tableWellCasing, setTableWellCasing] = useState([]);
  const [wellCasing, setWellCasing] = useState({
    top_depth: null,
    top_depth_ouom: "m",
    base_depth: null,
    base_depth_ouom: "m",
    hole_size: null,
    hole_size_ouom: "m",
    inside_diameter: null,
    inside_diameter_ouom: "m",
    outside_diameter: null,
    outside_diameter_ouom: "m",
    cement_type: null,
    cement_amount: null,
    cement_amount_uom: "m",
    remark: null,
  });
  const [editIndex, setEditIndex] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  const handleWellCasing = () => {
    const newEntry = { ...wellCasing };
    const updatedTable = [...tableWellCasing, newEntry];
    setTableWellCasing(updatedTable);
    updateShowWellCasing(updatedTable);

    // const dataNull = updatedTable.length === 0 ? null : updatedTable;

    resetWellCasing();
  };

  const headers = React.useMemo(
    () => [
      {
        Header: "Top Depth",
        accessor: "top_depth",
        type: "number",
      },
      {
        Header: "Base Depth",
        accessor: "base_depth",
        type: "number",
      },
      {
        Header: "Hole Size",
        accessor: "hole_size",
        type: "number",
      },
      {
        Header: "Inside Diameter",
        accessor: "inside_diameter",
        type: "number",
      },
      {
        Header: "Outside Diameter",
        accessor: "outside_diameter",
        type: "number",
      },
      {
        Header: "Cement Type",
        accessor: "cement_type",
        type: "text",
      },
      {
        Header: "Cement Amount",
        accessor: "cement_amount",
        type: "number",
      },
      {
        Header: "Remark",
        accessor: "remark",
        type: "text",
      },
    ],
    [wellCasing]
  );

  const handleInputChangeWellCasing = (e) => {
    const { name, value, type } = e.target;
    let processedValue =
      type === "number" && value !== "" ? parseFloat(value) : value;
    setWellCasing((prevData) => ({
      ...prevData,
      [name]: processedValue,
    }));
  };

  const handleEditChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue =
      type === "number" && value !== "" ? parseFloat(value) : value;
    setEditFormData((prev) => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const resetWellCasing = () => {
    setWellCasing({
      top_depth: "",
      top_depth_ouom: "m",
      base_depth: "",
      base_depth_ouom: "m",
      hole_size: "",
      hole_size_ouom: "m",
      inside_diameter: "",
      inside_diameter_ouom: "m",
      outside_diameter: "",
      outside_diameter_ouom: "m",
      cement_type: "",
      cement_amount: "",
      cement_amount_uom: "m",
      remark: "",
    });
  };

  const fieldFormWellCasing = [
    {
      name: "top_depth",
      label: "Top Depth",
      type: "number",
      colspan: 2,
    },
    {
      name: "top_depth_ouom",
      label: "Unit",
      type: "select",
      colspan: 1,
      options: [
        { value: "m", label: "m" },
        { value: "ft", label: "ft" },
      ],
    },
    {
      name: "base_depth",
      label: "Depth",
      type: "number",
      colspan: 2,
    },
    {
      name: "base_depth_ouom",
      label: "Unit",
      type: "select",
      colspan: 1,
      options: [
        { value: "m", label: "m" },
        { value: "ft", label: "ft" },
      ],
    },
    {
      name: "hole_size",
      label: "Hole Size",
      type: "number",
      colspan: 2,
    },
    {
      name: "hole_size_ouom",
      label: "Hole Unit",
      type: "select",
      colspan: 1,
      options: [
        { value: "m", label: "m" },
        { value: "ft", label: "ft" },
      ],
    },
    {
      name: "inside_diameter",
      label: "Inside Diameter",
      type: "number",
      colspan: 2,
    },
    {
      name: "inside_diameter_ouom",
      label: "Inside Unit",
      colspan: 1,
      type: "select",
      options: [
        { value: "m", label: "m" },
        { value: "ft", label: "ft" },
      ],
    },
    {
      name: "outside_diameter",
      label: "Outside Diameter",
      colspan: 2,
      type: "number",
    },
    {
      name: "outside_diameter_ouom",
      label: "Outside Unit",
      colspan: 1,
      type: "select",
      options: [
        { value: "m", label: "m" },
        { value: "ft", label: "ft" },
      ],
    },
    {
      name: "cement_type",
      label: "Cement Type",
      type: "text",
      colspan: 3,
    },
    {
      name: "cement_amount",
      label: "Cement Amount",
      colspan: 3,
      type: "number",
    },
    {
      name: "cement_amount_uom",
      label: "Cement Amount Unit",
      type: "select",
      colspan: 3,
      options: [
        { value: "m3", label: "M3" },
        { value: "kg", label: "Kg" },
      ],
    },
    {
      name: "remark",
      label: "Remark",
      colspan: 6,
      type: "text",
      isTextArea: true,
    },
  ];

  const headersTable = [
    {
      Header: "Top Depth",
      accessor: "top_depth",
      type: "number",
    },
    {
      Header: "Base Depth",
      accessor: "base_depth",
      type: "number",
    },
    {
      Header: "Hole Size",
      accessor: "hole_size",
      type: "number",
    },
    {
      Header: "Inside Diameter",
      accessor: "inside_diameter",
      type: "number",
    },
    {
      Header: "Outside Diameter",
      accessor: "outside_diameter",
      type: "number",
    },
    {
      Header: "Cement Type",
      accessor: "cement_type",
    },
    {
      Header: "Cement Amount",
      accessor: "cement_amount",
      type: "number",
    },
    {
      Header: "Remark",
      accessor: "remark",
      type: "text",
    },
  ];

  const clickShowCasing = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_APP_URL}/visualize/temporary/casing`,
        showWellCasing,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          responseType: "blob",
        }
      );
      if (response) {
        {
          //
          const blob = response.data;
          const imageUrl = URL.createObjectURL(blob);
          setImageUrl(imageUrl);
        }
      }

      // if (response) {
      //   const sessionId = response.data.data.session_id;
      //   try {
      //     const visualizationResponse = await axios.get(
      //       `${
      //         import.meta.env.VITE_APP_URL
      //       }/visualize/casing-visualization/${sessionId}`,
      //       {
      //         headers: {
      //           "Content-Type": "application/json",
      //           Authorization: `Bearer ${localStorage.getItem("token")}`,
      //         },
      //         responseType: "blob",
      //       }
      //     );

      //     const blob = visualizationResponse.data;
      //     const imageUrl = URL.createObjectURL(blob);
      //     setImageUrl(imageUrl);
      //   } catch (error) {
      //     console.error("Error getting Data Table", error);
      //   }
      // }
    } catch (error) {
      console.error("Error get Data Table", error);
    }
  };

  const updateShowWellCasing = (casingData) => {
    if (!casingData) return;
    setShowWellCasing({
      names: casingData.map((entry) => entry.description),
      top_depths: casingData.map((entry) => entry.depth - entry.length),
      bottom_depths: casingData.map((entry) => entry.depth),
      diameters: casingData.map((entry) => entry.casing_outer_diameter),
    });
  };

  const optionsWellCasing = [
    { name: "RT", value: "RT" },
    { name: "KB", value: "KB" },
    { name: "MSL", value: "MSL" },
  ];

  //  
  // console.table(tableWellCasing)
  const optionCasingType = [
    "Conductor Pipe",
    "Surface Casing",
    "Intermediate Casing",
    "Production Casing",
    "Production Liner",
  ];

  // useEffect(() => {
  //   setWellCasing((prevData) => ({
  //     ...prevData,
  //     unit_type: unittype,
  //   }));
  // }, [unittype]);

  React.useEffect(() => {
    const isNull = tableWellCasing?.length === 0 ? null : tableWellCasing;
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: {
        well_casing: isNull,
      },
    });
  }, [tableWellCasing]);

  return (
    <Grid
      templateColumns="repeat(2, 1fr)"
      gap={4}
      mt={4}
      height="700px"
      fontFamily={"Mulish"}
    >
      <Box borderWidth="1px" borderRadius="lg" p={6} height="100%">
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Flex alignItems="center" flexDirection={"row"}>
            <Icon as={IconCylinder} boxSize={12} color="gray.800" mr={3} />
            <Flex flexDirection="column">
              <Text
                fontSize="xl"
                fontWeight="bold"
                color="gray.700"
                fontFamily={"Mulish"}
              >
                Well Casing
              </Text>
              <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
                subtitle
              </Text>
            </Flex>
          </Flex>
          <Select
            width="auto"
            onChange={(e) =>
              setWellCasing({ ...wellCasing, depth_datum: e.target.value })
            }
          >
            {optionsWellCasing.map((option) => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </Select>
        </Flex>

        <Grid templateColumns="repeat(6, 1fr)" gap={4}>
          {fieldFormWellCasing.map((field, index) =>
            field.type === "select" ? (
              <GridItem colSpan={field.colspan} key={index}>
                <SelectComponentV2
                  name={field.name}
                  onChange={handleInputChangeWellCasing}
                  value={wellCasing[field.name]}
                  label={field.label}
                >
                  {field.options.map((option, index) => (
                    <SelectOptionV2
                      key={index}
                      value={option.value}
                      label={option.label}
                    />
                  ))}
                </SelectComponentV2>
              </GridItem>
            ) : (
              <GridItem colSpan={field.colspan} key={index}>
                <FormControlCard
                  key={index}
                  labelForm={field.label}
                  name={field.name}
                  type={field.type}
                  value={wellCasing?.[field.name]}
                  isTextArea={field.isTextArea}
                  onChange={handleInputChangeWellCasing}
                />
              </GridItem>
            )
          )}
        </Grid>
        <Button mt={2} colorScheme="blue" onClick={handleWellCasing} w={"full"}>
          Add
        </Button>
      </Box>
      <Box
        borderWidth="1px"
        borderRadius="lg"
        boxShadow="md"
        height="100%"
        display="flex"
        flexDirection="column"
        overflow="hidden"
      >
        <Tabs display="flex" flexDirection="column" height="100%">
          <TabList position="sticky" top={0} bg="white" zIndex={1}>
            <Tab>Table</Tab>
            {/* <Tab>Casing</Tab> */}
          </TabList>

          <TabPanels flex={1} overflowY="auto">
            <TabPanel height="100%" p={0}>
              <Box overflowX="auto" height="100%">
                {tableWellCasing.length > 0 ? (
                  <TableDataForm
                    headers={headers}
                    onDataChange={setTableWellCasing}
                    data={tableWellCasing}
                  />
                ) : (
                  <Flex
                    justifyContent="center"
                    flexDirection={"column"}
                    alignItems="center"
                    height="100%"
                  >
                    <Heading fontFamily={"Mulish"}>Tidak Ada Data</Heading>
                    {!!errorForms["job_plan.well.well_casing"] && (
                      <Text color="red.500" fontSize="sm" mt={2}>
                        Well Casing cannot be empty.
                      </Text>
                    )}
                  </Flex>
                )}
              </Box>
            </TabPanel>
            {/* <TabPanel>
              <Button colorScheme="blue" onClick={clickShowCasing}>
                Show Casing
              </Button>
              {imageUrl && <img src={imageUrl} alt="Casing Visualization" />}
            </TabPanel> */}
          </TabPanels>
        </Tabs>
      </Box>
    </Grid>
  );
};

export default WellCasing;
