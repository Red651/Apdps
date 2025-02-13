import React, { useState } from "react";
import {
  Grid,
  Box,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightAddon,
  VStack,
  Flex,
  Text,
  Icon,
  FormErrorMessage,
  GridItem,
} from "@chakra-ui/react";
import { IconClover } from "@tabler/icons-react";
import { JobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN_WELL } from "../../../Reducer/reducer";
import { useParams } from "react-router-dom";
import { SelectComponent, SelectOption } from "../Components/SelectOption";
import HeaderForm from "../../Components/Form/LabelForm";

const Others = ({ errorForms = {},initialData=null,TypeSubmit="create" }) => {
  const { state, dispatch } = React.useContext(JobContext);
  const { job_id } = useParams();
  const jobPlanExpDev = state.jobPlanExpDev?.job_plan?.well || {};

  // State lokal untuk menangani input sebelum diformat dan dikirim ke parent
  const [localValues, setLocalValues] = useState({
    hydrocarbon_target: null,
    net_pay: null,
    water_acoustic_vel: null,
    azimuth: null,
    maximum_inclination: null,
    kick_off_point: null,
  });
  const [formData, setFormData] = useState({
    hydrocarbon_target: null,
    net_pay: null,
    water_acoustic_vel: null,
    azimuth: null,
    maximum_inclination: null,
    kick_off_point: null,
  });

  //  
 
  React.useEffect(() => {
    if (TypeSubmit === "update" && initialData) {
      setFormData({
        hydrocarbon_target: initialData?.hydrocarbon_target || null,
        // hydrocarbon_target: initialData?.hydrocarbon_target || null,
        net_pay: initialData?.net_pay || null,
        water_acoustic_vel: initialData?.water_acoustic_vel || null,
        azimuth: initialData?.azimuth || null,
        maximum_inclination: initialData?.maximum_inclination || null,
        kick_off_point: initialData?.kick_off_point || null,
      });
    }
  }, [TypeSubmit]);

  // Fungsi untuk menangani perubahan input
  const handleLocalChange = (e) => {
    const { name, value } = e.target;

    // Izinkan angka, titik desimal, dan tanda minus di awal
    let formattedValue = String(value).replace(/[^0-9.-]/g, ""); // Izinkan angka, minus, dan titik

    // Pastikan minus hanya ada di awal
    if (formattedValue.includes("-") && formattedValue[0] !== "-") {
      formattedValue = formattedValue.replace(/-/g, "");
    }

    // Mencegah lebih dari satu titik desimal
    const parts = formattedValue.split(".");
    if (parts.length > 2) {
      formattedValue = `${parts[0]}.${parts.slice(1).join("")}`;
    }

    // Batasi angka desimal menjadi maksimal 6 angka di belakang koma
    if (parts[1] && parts[1].length > 6) {
      formattedValue = `${parts[0]}.${parts[1].substring(0, 6)}`;
    }

    // Update state lokal
    // setLocalValues((prev) => ({
    //   ...prev,
    //   [name]: formattedValue,
    // }));

    const valueForFormData =
      formattedValue !== ""
        ? formattedValue.includes(".")
          ? parseFloat(formattedValue)
          : parseInt(formattedValue, 10)
        : "";

    // Update formData dengan nilai yang diubah
    setFormData((prevData) => ({
      ...prevData,
      [name]: valueForFormData, // Menyimpan sebagai int atau float
    }));
  };
  React.useEffect(() => {
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: formData,
    });
  }, [formData]);

  const hydrocarbon_target = ["OIL", "GAS"];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let values;
    if (type === "number") {
      values = value.includes(".")
        ? parseFloat(value)
        : parseInt(value, 10) || 0;
    } else if (type === "text") {
      values = value;
    } else {
      values = value;
    }

    setFormData((prevData) => {
      if (name === "well_profile_type" && value === "VERTICAL") {
        return {
          ...prevData,
          [name]: values,
          well_directional_type: null,
        };
      }

      return {
        ...prevData,
        [name]: values,
      };
    });

    // setFormData((prevData) => ({ ...prevData, [name]: values }));
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={6} mt={4} fontFamily={"Mulish"}>
      <VStack align="stretch" spacing={4}>
        <Flex alignItems="center">
          <Icon as={IconClover} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              {"Others"}
            </Text>
            <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
              {"subtitle"}
            </Text>
          </Flex>
        </Flex>

        <Grid gap={4}>
          <GridItem colSpan={1}>
            <FormControl isInvalid={errorForms.hydrocarbon_target}>
              <SelectComponent
                key={"hydrocarbon_target"}
                label={"Hydrocarbon Target"}
                placeholder={"Select Hydrocarbon Target"}
                isInvalid={errorForms.hydrocarbon_target}
                // errorMessage={errorForms.hydrocarbon_target}
                name={"hydrocarbon_target"}
                value={formData.hydrocarbon_target}
                onChange={handleChange}
                desc={
                  "The length of the wellbore, as if determined by a measuring stick"
                }
              >
                {hydrocarbon_target.map((option) => (
                  <SelectOption key={option} value={option} label={option} />
                ))}
              </SelectComponent>
              <FormErrorMessage>
                {errorForms.hydrocarbon_target}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem colSpan={1}>
            <FormControl isInvalid={errorForms.net_pay}>
              <HeaderForm
                title={"Net Pay"}
                desc={
                  "The cumulative reservoir rock capable of producing within the entire thickness of a pay zone. The net pay within a gross interval."
                }
              />
              <InputGroup>
                <Input
                  id="net_pay"
                  name="net_pay"
                  value={formData.net_pay || ""}
                  onChange={handleLocalChange}
                  type="number" // Ubah tipe input menjadi "number"
                  placeholder="Net Pay"
                  fontFamily={"Mulish"}
                />
                <InputRightAddon>m</InputRightAddon>
              </InputGroup>
              <FormErrorMessage>{errorForms.net_pay}</FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem colSpan={1}>
            <FormControl isInvalid={errorForms.water_acoustic_vel}>
              <HeaderForm
                title={"Water Acoustic Velocity"}
                desc={
                  "The average acoustic velocity from surface to sea bed near the well site"
                }
              />
              <InputGroup>
                <Input
                  id="water_acoustic_vel"
                  name="water_acoustic_vel"
                  value={formData.water_acoustic_vel || ""}
                  onChange={handleLocalChange}
                  type="number" // Ubah tipe input menjadi "number"
                  placeholder="Water Acoustic Velocity"
                  fontFamily={"Mulish"}
                />
                <InputRightAddon>m</InputRightAddon>
              </InputGroup>
              <FormErrorMessage>
                {errorForms.water_acoustic_vel}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
          <GridItem colSpan={1}>
            <FormControl isInvalid={errorForms.water_acoustic_vel}>
              <HeaderForm
                title={"Azimuth"}
                desc={
                  "Compass direction of a wellbore or directional survey, measured in degrees from 0 to 359"
                }
              />
              <InputGroup>
                <Input
                  id="azimuth"
                  name="azimuth"
                  value={formData.azimuth || ""}
                  onChange={handleLocalChange}
                  type="number" // Ubah tipe input menjadi "number"
                  placeholder="Azimuth"
                  fontFamily={"Mulish"}
                />
                <InputRightAddon>m</InputRightAddon>
              </InputGroup>
              <FormErrorMessage>
                {errorForms.water_acoustic_vel}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={1}>
            <FormControl isInvalid={errorForms.water_acoustic_vel}>
              <HeaderForm
                title={"Maximum Inclination"}
                desc={
                  "The maximum angle at which a surface can be tilted from the horizontal"
                }
              />

              <InputGroup>
                <Input
                  id="maximum_inclination"
                  name="maximum_inclination"
                  value={formData.maximum_inclination || ""}
                  onChange={handleLocalChange}
                  type="number" // Ubah tipe input menjadi "number"
                  placeholder="Maximum Inclination"
                  fontFamily={"Mulish"}
                />
                <InputRightAddon>m</InputRightAddon>
              </InputGroup>
              <FormErrorMessage>
                {errorForms.water_acoustic_vel}
              </FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={1}>
            <FormControl isInvalid={errorForms.water_acoustic_vel}>
              <HeaderForm
                title={"Kick Off Point"}
                desc={
                  "The point at which a wellbore is intentionally deviated from a vertical path to build it to a desired orientation"
                }
              />
              <InputGroup>
                <Input
                  id="kick_off_point"
                  name="kick_off_point"
                  value={formData.kick_off_point || ""}
                  onChange={handleLocalChange}
                  type="number" // Ubah tipe input menjadi "number"
                  placeholder="Kick Off Point"
                  fontFamily={"Mulish"}
                />
                <InputRightAddon>m</InputRightAddon>
              </InputGroup>
              <FormErrorMessage>
                {errorForms.water_acoustic_vel}
              </FormErrorMessage>
            </FormControl>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

export default Others;
