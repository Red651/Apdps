import {
  VStack,
  Text,
  Flex,
  Icon,
  Heading,
  Box,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightAddon,
  FormErrorMessage,
} from "@chakra-ui/react";
import { IconRuler2 } from "@tabler/icons-react";
import React from "react"; // Import Tabler Icons
import { JobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN_WELL } from "../../../Reducer/reducer";
import { useParams } from "react-router-dom";
import CardFormK3 from "../Components/CardFormK3";
import { SelectComponent, SelectOption } from "../Components/SelectOption";
import HeaderForm from "../../Components/Form/LabelForm";

const ElevationsAndDepths = ({
  unittype,
  errorForms = {},
  initialData = null,
  TypeSubmit = "create",
}) => {
  const { state, dispatch } = React.useContext(JobContext);
  const { job_id } = useParams();
  // const jobPlanExpDev = state.jobPlanExpDev.job_plan.well || {};
  const [formData, setFormData] = React.useState({
    rotary_table_elev: null,
    kb_elev: null,
    derrick_floor_elev: null,
    ground_elev: null,
    mean_sea_level: null,
    final_md: null,
    maximum_tvd: null,
    depth_datum: null,
    // additional fields
    base_depth: null,
    deepest_depth: null,
    depth_datum_elev: null,
    difference_lat_msl: null,
    drill_td: null,
    plugback_depth: null,
    top_depth: null,
    water_depth: null,
    ground_elev_type: null, //String
    subsea_elev_ref_type: null, //String
    water_depth_datum: null, //String
    elev_ref_datum: null,
    whipstock_depth: null,
  });

  const jobPlanExpDev = state.jobPlanExpDev?.job_plan?.well || {};

  React.useEffect(() => {
    if (initialData && TypeSubmit === "update") {
      setFormData({
        rotary_table_elev: initialData.rotary_table_elev || null,
        kb_elev: initialData.kb_elev || null,
        derrick_floor_elev: initialData.derrick_floor_elev || null,
        ground_elev: initialData.ground_elev || null,
        mean_sea_level: initialData.mean_sea_level || null,
        final_md: initialData.final_md || null,
        maximum_tvd: initialData.maximum_tvd || null,
        depth_datum: initialData.depth_datum || null,
        // additional fields
        base_depth: initialData.base_depth || null,
        deepest_depth: initialData.deepest_depth || null,
        depth_datum_elev: initialData.depth_datum_elev || null,
        difference_lat_msl: initialData.difference_lat_msl || null,
        drill_td: initialData.drill_td || null,
        plugback_depth: initialData.plugback_depth || null,
        top_depth: initialData.top_depth || null,
        water_depth: initialData.water_depth || null,
        ground_elev_type: initialData.ground_elev_type || null, //String
        subsea_elev_ref_type: initialData.subsea_elev_ref_type || null, //String
        water_depth_datum: initialData.water_depth_datum || null, //String
        elev_ref_datum: initialData.elev_ref_datum || null,
        whipstock_depth: initialData.whipstock_depth || null,
      });
    }
  }, [TypeSubmit]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let values;
    if (type === "number") {
      values = value.includes(".")
        ? parseFloat(value)
        : parseInt(value, 10) || null;
    } else if (type === "text") {
      values = value;
    } else {
      values = value;
    }
    setFormData((prevData) => ({
      ...prevData,
      [name]: values,
    }));
  };

  React.useEffect(() => {
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: formData,
    });
  }, [formData]);

  const DepthDatumRender = () => {
    const optionDepht = [
      {
        value: "RT",
        label: "RT",
      },
      {
        value: "KB",
        label: "KB",
      },
      {
        value: "MSL",
        label: "MSL",
      },
    ];
    return (
      <Flex>
        <SelectComponent
          label="Depth Datum"
          placeholder="Select Datum"
          name={"depth_datum"}
          isInvalid={errorForms?.depth_datum}
          errorMessage={errorForms?.depth_datum}
          value={formData.depth_datum}
          onChange={handleChange}
        >
          {optionDepht.map((option, index) => (
            <SelectOption
              key={index}
              value={option.value}
              label={option.label}
            />
          ))}
        </SelectComponent>
      </Flex>
    );
  };

  const additionalFields = [
    {
      label: "Base Depth",
      name: "base_depth",
      desc: "The deepest, bottom or base measured depth in which this well component is found.",
    },
    {
      label: "Deepest Depth",
      name: "deepest_depth",
      desc: "The deepest depth drilled occurs for remedial operations in which the new remedial depth is less than the original measured depth. The deepest depth captures the original measured depth before the remedial drilling event. The depth at time of completion is the remedial drilled depth. Deepest depth drilled allows the database to store any depths greater than the completed remedial depth.",
    },
    {
      label: "Depth Datum Elev",
      name: "depth_datum_elev",
      desc: "Operator reported elevation of the measurement datum used as a reference for other measured well points.",
    },
    {
      label: "Difference Lat MSL",
      name: "difference_lat_msl",
      desc: "The computed difference between LAT and MSL.",
    },
    {
      label: "Drill TD",
      name: "drill_td",
      desc: "Total or maximum depth of the well as reported by the operator/ driller.",
    },
    {
      label: "Plugback Depth",
      name: "plugback_depth",
      desc: "Depth of the point that the well was plugged back to when setting the casing or completing the well.",
    },
    {
      label: "Top Depth",
      name: "top_depth",
      desc: "Measured depth from the surface to the top of the drilling pipe.",
    },
    {
      label: "Water Depth",
      name: "water_depth",
      desc: "Depth of the water at a well (measured from the water level to the mud line).",
    },
    {
      label: "Whipstock Depth",
      name: "whipstock_depth",
      desc: "Measurement of the depth position of the whipstock. This is used for side tracking or directional drilling.",
    },
  ];

  const subsea_elev_ref_type = [
    "KELLY BUSHING",
    "DRILLER FLOOR",
    "ROTARY TABLE",
  ];

  const ground_elev_type = ["KELLY BUSHING", "GROUND", "SEA LEVEL"];

  const water_depth_datum = ["MEAN SEA LEVEL"];

  const elev_ref_datum = ["MSL", "LAT"];

  const additionalFieldSelect = [
    {
      label: "Subsea Elev Ref Type",
      name: "subsea_elev_ref_type",
      value: subsea_elev_ref_type,
      desc: "The reported type of elevation that was used to determine the subsea elevation, such as Kelly Bushing, Driller Floor, Casing Flange, Rotary Table etc. The Subsea elevation is computed by subtracting the ground elevation from the elevation reported by the drilling contractor.",
    },
    {
      label: "Ground Elev Type",
      name: "ground_elev_type",
      value: ground_elev_type,
      desc: "The type of point or horizontal surface used as an elevation reference for measurements in a well. For example: kelly bushing, ground, sea level.",
    },
    {
      label: "Water Depth Datum",
      name: "water_depth_datum",
      value: water_depth_datum,
      desc: "Identifies the point near or on the rig from where the water depths are to be measured.",
    },
    {
      label: "Elevation Reference Datum",
      name: "elev_ref_datum",
      value: elev_ref_datum,
      desc: "The name of the datum to which elevations are referenced e.g. MSL or LAT.",
    },
  ];

  return (
    // <Box
    //   borderWidth="1px"
    //   borderRadius="lg"
    //   p={6}
    //   mt={4}
    //   bg="white"
    //   fontFamily={"Mulish"}
    // >
    //   <VStack align="stretch" spacing={4}>
    //     <Flex alignItems="center">
    //       <Icon as={IconRuler2} boxSize={12} color="gray.800" mr={3} />
    //       <Flex flexDirection={"column"}>
    //         <Text
    //           fontSize="xl"
    //           fontWeight="bold"
    //           color="gray.700"
    //           fontFamily={"Mulish"}
    //         >
    //           {"Elevations and Depths"}
    //         </Text>
    //         <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
    //           {"subtitle"}
    //         </Text>
    //       </Flex>
    //     </Flex>
    //     {/* Rotary Table Elevation and Kelly Bushing Elevation */}

    //   </VStack>
    // </Box>
    <CardFormK3
      mt={4}
      fontFamily={"Mulish"}
    
      title="Elevations and Depths"
      subtitle="* Required"
    >
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <GridItem>
          <FormControl isInvalid={!!errorForms["rotary_table_elev"]}>
            <HeaderForm
              title={"Rotary Table Elevation"}
              desc={
                "The elevation of the rotary table. This is needed to track Australian information."
              }
            />
            <InputGroup>
              <Input
                name="rotary_table_elev"
                type="number"
                placeholder="rotary table elev"
                value={formData.rotary_table_elev}
                onChange={handleChange}
              />
              <InputRightAddon>
                {(unittype === "METRICS" && "m") ||
                  (unittype === "Imperial" && "ft")}
              </InputRightAddon>
            </InputGroup>
            {errorForms["rotary_table_elev"] && (
              <FormErrorMessage>
                Rotary Table Elevation is required
              </FormErrorMessage>
            )}
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl isInvalid={!!errorForms["kb_elev"]}>
            <HeaderForm
              title={"Kelly Bushing Elevation"}
              desc={
                "The height of the drilling floor above ground level, plus the ground level"
              }
            />
            <InputGroup>
              <Input
                name="kb_elev"
                placeholder="kelly bushing elev"
                value={formData.kb_elev}
                onChange={handleChange}
                type="number"
              />
              <InputRightAddon>
                {(unittype === "METRICS" && "m") ||
                  (unittype === "Imperial" && "ft")}
              </InputRightAddon>
            </InputGroup>
            {errorForms["kb_elev"] && (
              <FormErrorMessage>
                Kelly Bushing Elevation is required
              </FormErrorMessage>
            )}
          </FormControl>
        </GridItem>
      </Grid>

      {/* Derrick Floor Elevation and Ground Elevation */}
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <GridItem>
          <FormControl isInvalid={!!errorForms["derrick_floor_elev"]}>
            <HeaderForm
              title={"Derrick Floor Elevation"}
              desc={"Elevations that are reported from the Derrick floor."}
            />
            <InputGroup>
              <Input
                name="derrick_floor_elev"
                placeholder="derrick floor elev"
                value={formData.derrick_floor_elev}
                type="number"
                onChange={handleChange}
              />
              <InputRightAddon>
                {(unittype === "METRICS" && "m") ||
                  (unittype === "Imperial" && "ft")}
              </InputRightAddon>
            </InputGroup>
            {errorForms["derrick_floor_elev"] && (
              <FormErrorMessage>
                Derrick Floor Elevation is required
              </FormErrorMessage>
            )}
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl isInvalid={!!errorForms["ground_elev"]}>
            <HeaderForm
              title={"Ground Elevation"}
              desc={"The elevation of the ground at the well site."}
            />
            <InputGroup>
              <Input
                name="ground_elev"
                placeholder="ground elev"
                value={formData.ground_elev}
                type="number"
                onChange={handleChange}
              />
              <InputRightAddon>
                {(unittype === "METRICS" && "m") ||
                  (unittype === "Imperial" && "ft")}
              </InputRightAddon>
            </InputGroup>
            {errorForms["ground_elev"] && (
              <FormErrorMessage>Ground Elevation is required</FormErrorMessage>
            )}
          </FormControl>
        </GridItem>
      </Grid>

      {/* Final MD and Maximum TVD */}
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <GridItem>
          <FormControl isInvalid={!!errorForms["final_md"]}>
            <HeaderForm
              title={"Final MD"}
              desc={
                "The final length of the wellbore, as if determined by a measuring stick."
              }
            />
            <InputGroup>
              <Input
                name="final_md"
                type="number"
                placeholder="final md"
                value={formData.final_md}
                onChange={handleChange}
              />
              <InputRightAddon>
                {(unittype === "METRICS" && "m") ||
                  (unittype === "Imperial" && "ft")}
              </InputRightAddon>
            </InputGroup>
            {errorForms["final_md"] && (
              <FormErrorMessage>Final MD is required</FormErrorMessage>
            )}
          </FormControl>
        </GridItem>
        <GridItem>
          <FormControl isInvalid={!!errorForms["maximum_tvd"]}>
            <HeaderForm
              title={"Maximum TVD"}
              desc={
                "The maximum true vertical depth from the surface datum reference to the final total depth or deepest point, measured on a straight line."
              }
            />
            <InputGroup>
              <Input
                name="maximum_tvd"
                placeholder="maximum tvd"
                value={formData.maximum_tvd}
                onChange={handleChange}
                type="number"
              />
              <InputRightAddon>
                {(unittype === "METRICS" && "m") ||
                  (unittype === "Imperial" && "ft")}
              </InputRightAddon>
            </InputGroup>
            {errorForms["maximum_tvd"] && (
              <FormErrorMessage>Maximum TVD is required</FormErrorMessage>
            )}
          </FormControl>
        </GridItem>
      </Grid>

      {/* Additional Fields PPDM*/}
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        {additionalFields.map(({ label, name, desc }) => (
          <GridItem key={name}>
            <FormControl isInvalid={!!errorForms[name]}>
              <HeaderForm title={label} desc={desc} />

              <InputGroup>
                <Input
                  name={name}
                  placeholder={label}
                  value={formData[name]}
                  onChange={handleChange}
                  type="number"
                />
                <InputRightAddon>
                  {(unittype === "METRICS" && "m") ||
                    (unittype === "Imperial" && "ft")}
                </InputRightAddon>
              </InputGroup>

              {errorForms[name] && (
                <FormErrorMessage>{`${label} is required`}</FormErrorMessage>
              )}
            </FormControl>
          </GridItem>
        ))}
        {additionalFieldSelect.map(({ label, name, value, desc }) => (
          <SelectComponent
            isInvalid={!!errorForms[name]}
            errorMessage={errorForms[name]}
            key={name}
            label={label}
            placeholder={label}
            name={name}
            value={formData[name]}
            onChange={handleChange}
            title={label}
            desc={desc}
          >
            {value.map((option) => (
              <SelectOption key={option} value={option} label={option} />
            ))}
          </SelectComponent>
        ))}
        <DepthDatumRender />
      </Grid>
    </CardFormK3>
  );
};

export default ElevationsAndDepths;
