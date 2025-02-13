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
  Tooltip,
} from "@chakra-ui/react";
import { IconDropCircle } from "@tabler/icons-react";
import { JobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN_WELL } from "../../../Reducer/reducer";
import { useParams } from "react-router-dom";
import { IconInfoCircle } from "@tabler/icons-react";
import HeaderForm from "../../Components/Form/LabelForm";

const WellLocation = ({ handleChange, errorForms = {},initialData=null,TypeSubmit="create" }) => {
  const { state, dispatch } = React.useContext(JobContext);
  const { job_id } = useParams();
  const jobPlanExpDev = state.jobPlanExpDev?.job_plan?.well || {};
  //  

  // State lokal untuk menangani input sebelum diformat dan dikirim ke parent
  const [localValues, setLocalValues] = useState({
    surface_longitude: null,
    surface_latitude: null,
    bottom_hole_longitude: null,
    bottom_hole_latitude: null,
  });
  const [formData, setFormData] = useState({
    surface_longitude: null,
    surface_latitude: null,
    bottom_hole_longitude: null,
    bottom_hole_latitude: null,
  });

  React.useEffect(() => {
    if (initialData && TypeSubmit === "update") {
      setLocalValues({
        surface_longitude: initialData.surface_longitude || null,
        surface_latitude: initialData.surface_latitude || null,
        bottom_hole_longitude: initialData.bottom_hole_longitude || null,
        bottom_hole_latitude: initialData.bottom_hole_latitude || null,
      });
      setFormData({
        surface_longitude: initialData.surface_longitude || null,
        surface_latitude: initialData.surface_latitude || null,
        bottom_hole_longitude: initialData.bottom_hole_longitude || null,
        bottom_hole_latitude: initialData.bottom_hole_latitude || null,
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
    setLocalValues((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

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
    //
    // Kirim nilai yang sudah diformat ke parent sebagai float
    // handleChange({
    //   target: {
    //     name,
    //     value: formattedValue !== '' ? parseFloat(formattedValue) : '', // Pastikan tipe float
    //     type: 'number',
    //   },
    // });
  };
  React.useEffect(() => {
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: formData,
    });
  }, [formData]);
  //
  //

  // const HeaderForm = (title, desc) => (
  //   <FormLabel display={"flex"} gap={2} alignItems={"center"}>
  //     {title}
  //     <Tooltip label={desc}>
  //       <Icon as={IconInfoCircle} boxSize={4} />
  //     </Tooltip>
  //   </FormLabel>
  // );

  return (
    <Box borderWidth="1px" borderRadius="lg" p={6} mt={4} fontFamily={"Mulish"}>
      <VStack align="stretch" spacing={4}>
        <Flex alignItems="center">
          <Icon as={IconDropCircle} boxSize={12} color="gray.800" mr={3} />
          <Flex flexDirection={"column"}>
            <Text
              fontSize="xl"
              fontWeight="bold"
              color="gray.700"
              fontFamily={"Mulish"}
            >
              {"Well Location"}
            </Text>
            <Text fontSize="md" color="red.500" fontFamily={"Mulish"}>
              {"* Required"}
            </Text>
          </Flex>
        </Flex>

        <Grid gap={4}>
          <GridItem>
            <FormControl
              isInvalid={!!errorForms["surface_longitude"]}
            >
              <HeaderForm
                title={"Surface Longitude"}
                desc={
                  "Angular distance in decimal degrees, east or west of the prime meridian of the geodetic datum. A negative value represents a west longitude"
                }
              />
              <InputGroup>
                <Input
                  name="surface_longitude"
                  placeholder="Surface longitude"
                  type="text"
                  value={localValues.surface_longitude}
                  onChange={handleLocalChange} // Gunakan handleLocalChange untuk menangani input
                />
                <InputRightAddon>°</InputRightAddon>
              </InputGroup>
              {errorForms["surface_longitude"] && (
                <FormErrorMessage>
                  Surface longitude is required
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>
          <GridItem>
            <FormControl
              isInvalid={!!errorForms["surface_latitude"]}
            >
              <HeaderForm
                title={"Surface Latitude"}
                desc={
                  "Angular distance in decimal degrees, north or south of the equator. A positive value represents a north latitude"
                }
              />
              <InputGroup>
                <Input
                  type="text"
                  name="surface_latitude"
                  placeholder="Surface latitude"
                  value={localValues.surface_latitude}
                  onChange={handleLocalChange}
                />
                <InputRightAddon>°</InputRightAddon>
              </InputGroup>
              {errorForms["surface_latitude"] && (
                <FormErrorMessage>
                  Surface latitude is required
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>
        </Grid>

        <Grid gap={4}>
          <GridItem>
            <FormControl
              isInvalid={!!errorForms["bottom_hole_longitude"]}
            >
              <HeaderForm
                title={"Bottom Hole Longitude"}
                desc={
                  "Longitude of bottom hole point projected to surface. For straight wells this would be exactly the same as surface longitude or null"
                }
              />
              <InputGroup>
                <Input
                  name="bottom_hole_longitude"
                  placeholder="Bottom hole longitude"
                  type="text"
                  value={localValues.bottom_hole_longitude}
                  onChange={handleLocalChange}
                />
                <InputRightAddon>°</InputRightAddon>
              </InputGroup>
              {errorForms["bottom_hole_longitude"] && (
                <FormErrorMessage>
                  Bottom hole longitude is required
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>
          <GridItem>
            <FormControl
              isInvalid={!!errorForms["bottom_hole_latitude"]}
            >
              <HeaderForm
                title={"Bottom Hole Latitude"}
                desc={
                  "Latitude of bottom hole point projected to surface. For straight wells this would be exactly the same as surface latitude or null"
                }
              />
              <InputGroup>
                <Input
                  name="bottom_hole_latitude"
                  placeholder="Bottom hole latitude"
                  type="text"
                  value={localValues.bottom_hole_latitude}
                  onChange={handleLocalChange}
                />
                <InputRightAddon>°</InputRightAddon>
              </InputGroup>
              {errorForms["bottom_hole_latitude"] && (
                <FormErrorMessage>
                  Bottom hole latitude is required
                </FormErrorMessage>
              )}
            </FormControl>
          </GridItem>
        </Grid>
      </VStack>
    </Box>
  );
};

export default WellLocation;
