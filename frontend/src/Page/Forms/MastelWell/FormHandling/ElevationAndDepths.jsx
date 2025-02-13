import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  VStack,
  Text,
  Flex,
  Icon,
  Box,
  Grid,
  GridItem,
  FormControl,
  FormLabel,
  InputGroup,
  Input,
  InputRightAddon,
  FormErrorMessage,
  FormHelperText,
  Select,
} from "@chakra-ui/react";
import { IconRuler2, IconInfoCircle } from "@tabler/icons-react";
import { useJobContext } from "../../../../Context/JobContext";
import { ADD_WELL_MASTER } from "../../../../Reducer/reducer";
import { useDebounce } from "use-debounce"; // Pastikan package ini terpasang
import HeaderForm from "../../../Components/Form/LabelForm";
import CardFormK3 from "../../Components/CardFormK3";

const ElevationsAndDepths = ({ errorForms = {} }) => {
  const { state, dispatch } = useJobContext();
  const unittype = state?.wellMaster?.unit_type || "METRICS";
  const [formData, setFormData] = useState({
    rotary_table_elev: null,
    kb_elev: null,
    derrick_floor_elev: null,
    ground_elev: null,
    // mean_sea_level: null,
    final_md: null,
    maximum_tvd: null,
    base_depth: null,
    deepest_depth: null,
    depth_datum_elev: null,
    difference_lat_msl: null,
    drill_td: null,
    plugback_depth: null,
    top_depth: null,
    water_depth: null,
    ground_elev_type: null,
    subsea_elev_ref_type: null,
    water_depth_datum: null,
    elev_ref_datum: null,
    whipstock_depth: null,
  });

  // Gunakan useDebounce untuk formData
  const [debouncedFormData] = useDebounce(formData, 500); // Debounce dengan delay 500ms
  const prevDebouncedFormDataRef = useRef(debouncedFormData);

  const subsea_elev_ref_type = [
    "KELLY BUSHING",
    "DRILLER FLOOR",
    "ROTARY TABLE",
  ];

  const ground_elev_type = ["KELLY BUSHING", "GROUND", "SEA LEVEL"];

  const water_depth_datum = ["MEAN SEA LEVEL"];

  const elev_ref_datum = ["MSL", "LAT"];

  // Load initial data
  useEffect(() => {
    if (state?.wellMaster) {
      const wellData = state.wellMaster;
      const initialData = {
        rotary_table_elev: wellData.rotary_table_elev?.toString() || null,
        kb_elev: wellData.kb_elev?.toString() || null,
        derrick_floor_elev: wellData.derrick_floor_elev?.toString() || null,
        ground_elev: wellData.ground_elev?.toString() || null,
        final_md: wellData.final_md?.toString() || null,
        maximum_tvd: wellData.maximum_tvd?.toString() || null,
        base_depth: wellData.base_depth?.toString() || null,
        deepest_depth: wellData.deepest_depth?.toString() || null,
        depth_datum_elev: wellData.depth_datum_elev?.toString() || null,
        difference_lat_msl: wellData.difference_lat_msl?.toString() || null,
        drill_td: wellData.drill_td?.toString() || null,
        plugback_depth: wellData.plugback_depth?.toString() || null,
        top_depth: wellData.top_depth?.toString() || null,
        water_depth: wellData.water_depth?.toString() || null,
        ground_elev_type: wellData.ground_elev_type?.toString() || null,
        subsea_elev_ref_type: wellData.subsea_elev_ref_type?.toString() || null,
        water_depth_datum: wellData.water_depth_datum?.toString() || null,
        elev_ref_datum: wellData.elev_ref_datum?.toString() || null,
        whipstock_depth: wellData.whipstock_depth?.toString() || null,
        // mean_sea_level: wellData.mean_sea_level?.toString() || null,
      };
      setFormData(initialData);
    }
  }, [state?.wellMaster]);

  useEffect(() => {
    // Hanya dispatch jika debouncedFormData berubah
    if (
      JSON.stringify(debouncedFormData) !==
      JSON.stringify(prevDebouncedFormDataRef.current)
    ) {
      prevDebouncedFormDataRef.current = debouncedFormData;

      dispatch({
        type: ADD_WELL_MASTER,
        payload: {
              ...state.wellMaster,
              ...debouncedFormData,
        },
      });
    }
  }, [debouncedFormData, dispatch, state.wellMaster]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value === "" ? null : isNaN(value) ? value : parseFloat(value), // Menangani input angka
    }));
  }, []);

  const renderSelectControl = (label, name, options, desc) => (
    <FormControl isInvalid={!!errorForms[`well.${name}`]}>
      <HeaderForm title={label} desc={desc} />

      <Select
        name={name}
        value={formData[name] || ""}
        onChange={handleChange}
        borderColor={errorForms[`well.${name}`] ? "red.500" : "gray.300"}
        _focus={{ borderColor: "teal.500" }}
        _hover={{ borderColor: "teal.300" }}
        borderRadius="md"
        fontSize="md"
        placeholder="Select an option"
      >
        {options.map((option, index) => (
          <option key={index} value={option}>
            {option}
          </option>
        ))}
      </Select>
      {errorForms[`well.${name}`] && (
        <FormErrorMessage color="red.500" fontSize="sm" mt={2}>
          {`${label} is required`}
        </FormErrorMessage>
      )}
    </FormControl>
  );

  const renderFormControl = (
    label,
    name,
    placeholder,
    desc,
    isNumber = true
  ) => (
    <FormControl isInvalid={!!errorForms[`well.${name}`]}>
      <HeaderForm title={label} desc={desc} />
      {/* <FormHelperText
        fontSize="md"
        color="gray.500"
        mb={2}
        display="flex"
        gap={2}
        alignItems="center"
      >
        {desc && <Icon as={IconInfoCircle} boxSize={4} />}
        {desc}
      </FormHelperText> */}
      <InputGroup>
        <Input
          name={name}
          placeholder={placeholder}
          type={isNumber ? "number" : "text"}
          value={formData[name] || ""}
          onChange={handleChange}
          step="any"
          borderColor={errorForms[`well.${name}`] ? "red.500" : "gray.300"}
          _focus={{ borderColor: "teal.500" }}
          _hover={{ borderColor: "teal.300" }}
          padding={4}
          borderRadius="md"
          fontSize="md"
        />
        {isNumber && (
          <InputRightAddon>
            {unittype === "METRICS" ? "m" : "ft"}
          </InputRightAddon>
        )}
      </InputGroup>
      {errorForms[`well.${name}`] && (
        <FormErrorMessage color="red.500" fontSize="sm" mt={2}>
          {`${label} is required`}
        </FormErrorMessage>
      )}
    </FormControl>
  );

  return (
    <CardFormK3
      title="Elevation and Depths"
      subtitle="Elevation and Depth Details"
      icon={IconRuler2}
      OptionDepth={["MSL", "KB", "RT"]}
      value={formData.depth_datum}
      OptionValue={(e) =>
        setFormData((prev) => ({ ...prev, depth_datum: e }))
      }
    >
      <VStack align="stretch" spacing={4}>
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            {renderFormControl(
              "Rotary Table Elevation",
              "rotary_table_elev",
              "rotary table elev",
              "The elevation of the rotary table. This is needed to track Australian information."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Kelly Bushing Elevation",
              "kb_elev",
              "kelly bushing elev",
              "The height of the drilling floor above ground level, plus the ground level"
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Derrick Floor Elevation",
              "derrick_floor_elev",
              "derrick floor elev",
              "Elevations that are reported from the Derrick floor."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Ground Elevation",
              "ground_elev",
              "ground elev",
              "The elevation of the ground at the well site."
            )}
          </GridItem>
        </Grid>

        {/* Depths and Datum Sections */}
        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
          <GridItem>
            {renderFormControl(
              "Final MD",
              "final_md",
              "final md",
              "The final length of the wellbore, as if determined by a measuring stick."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Maximum TVD",
              "maximum_tvd",
              "maximum tvd",
              "The maximum true vertical depth from the surface datum reference to the final total depth or deepest point, measured on a straight line."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Base Depth",
              "base_depth",
              "Base Depth",
              "The deepest, bottom or base measured depth in which this well component is found."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Deepest Depth",
              "deepest_depth",
              "Deepest Depth",
              "The deepest depth drilled occurs for remedial operations in which the new remedial depth is less than the original measured depth. The deepest depth captures the original measured depth before the remedial drilling event. The depth at time of completion is the remedial drilled depth. Deepest depth drilled allows the database to store any depths greater than the completed remedial depth."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Depth Datum Elevation",
              "depth_datum_elev",
              "depth datum elev",
              "Operator reported elevation of the measurement datum used as a reference for other measured well points."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Difference Lat MSL",
              "difference_lat_msl",
              "difference lat msl",
              "The computed difference between LAT and MSL."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Drill TD",
              "drill_td",
              "Drill TD",
              "Total or maximum depth of the well as reported by the operator/ driller."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Plugback Depth",
              "plugback_depth",
              "Plugback Depth",
              "Depth of the point that the well was plugged back to when setting the casing or completing the well."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Top Depth",
              "top_depth",
              "Top Depth",
              "Measured depth from the surface to the top of the drilling pipe."
            )}
          </GridItem>
          <GridItem>
            {renderFormControl(
              "Water Depth",
              "water_depth",
              "Water Depth",
              "Depth of the water at a well (measured from the water level to the mud line)."
            )}
          </GridItem>

          {/* <GridItem>{renderFormControl("Elevation Reference Datum", "elev_ref_datum", "Elevation Reference Datum")}</GridItem> */}
          <GridItem>
            {renderFormControl(
              "Whipstock Depth",
              "whipstock_depth",
              "Whipstock Depth",
              "Measurement of the depth position of the whipstock. This is used for side tracking or directional drilling."
            )}
          </GridItem>
          {/* <GridItem>
            {renderFormControl(
              "Mean Sea Level",
              "mean_sea_level",
              "Mean Sea Level"
            )}
          </GridItem> */}
          <GridItem>
            {renderSelectControl(
              "Elevation Reference Datum",
              "elev_ref_datum",
              elev_ref_datum,
              "Pilih jenis target hidrokarbon"
            )}
          </GridItem>

          <GridItem>
            {renderSelectControl(
              "Ground Elevation Type",
              "ground_elev_type",
              ground_elev_type,
              "Pilih jenis target hidrokarbon"
            )}
          </GridItem>
          <GridItem>
            {renderSelectControl(
              "Subsea Elevation Reference Type",
              "subsea_elev_ref_type",
              subsea_elev_ref_type,
              "Pilih jenis target hidrokarbon"
            )}
          </GridItem>
        </Grid>
        <Grid templateColumns="repeat(1, 1fr)" gap={4}>
          <GridItem>
            {renderSelectControl(
              "Water Depth Datum",
              "water_depth_datum",
              water_depth_datum,
              "Pilih jenis target hidrokarbon"
            )}
          </GridItem>
        </Grid>
      </VStack>
    </CardFormK3>
  );
};

export default ElevationsAndDepths;
