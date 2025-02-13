import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  SimpleGrid,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useImperativeHandle, forwardRef } from "react";
import { PostOperationReport } from "../../../API/PostKkks";
import SimpleButton from "../../Components/SimpleButton";
import DailyDates from "../FormHandling/DailyDates";
import CardFormK3 from "../../Components/CardFormK3";
import TimeBreakdown from "../FormHandling/TimeBreakdown";
import DrillingFluid from "../FormHandling/DrillingFluid";
import MudAdditive from "../FormHandling/MudAdditive";
import BottomHoleAssembly from "../FormHandling/BottomHoleAssembly";
import BitRecord from "../FormHandling/BitRecord";
import CasingOps from "../FormHandling/Casing";
import GasForm from "../FormHandling/Gas";
import HydraulicAnalysisForm from "../FormHandling/HydraulicAnalisys";
import MaterialForm from "../FormHandling/MaterialForm";
import HealthSafety from "../FormHandling/HealthSafety";
import DirectionalSurvey from "../FormHandling/DirectionalSurvey";
import Personel from "../FormHandling/Personel";
import Pumps from "../FormHandling/Pumps";
import WeatherForm from "../FormHandling/WeatherForm";
import FormControlCard from "../../Components/FormControl";
import MudVolumes from "../FormHandling/MudVolumes";
import { IconInfoCircle } from "@tabler/icons-react";

import ModalAndContent from "../../Components/ModalAndContent";
import FileHandlingUpload from "../../Components/FileHandlingUpload";
import ModalUploadDailyReport from "../FormHandling/ModalUploadDailyReport";
import { useJobContext } from "../../../../Context/JobContext";
import { initialData } from "../../../../Reducer/initialData";
import { ADD_DAILY_OPERATION_REPORT } from "../../../../Reducer/reducer";

const DailyReport = forwardRef(({ job_id }, ref) => {
  const [errors, setErrors] = React.useState({});
  const { state, dispatch } = useJobContext();

  useImperativeHandle(ref, () => ({
    postData,
  }));

  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialData = state?.jobOperationData;
  const [handleData, setHandleData] = React.useState({
    report_date: "2024-09-20",
    avg_wob: null,
    avg_rop: null,
    avg_rpm: null,
    torque: null,
    stand_pipe_pressure: null,
    flow_rate: null,
    string_weight: null,
    rotating_weight: null,
    total_drilling_time: null,
    circulating_pressure: null,
    daily_cost: null,
    daily_mud_cost: null,
    day_supervisor: null,
    night_supervisor: null,
    engineer: null,
    geologist: null,
    day_summary: null,
    day_forecast: null,
    last_size: null,
    set_md: null,
    next_size: null,
    next_set_md: null,
    last_lot_emw: null,
    tol: null,
    start_mud_volume: null,
    lost_surface_mud_volume: null,
    lost_dh_mud_volume: null,
    dumped_mud_volume: null,
    built_mud_volume: null,
    ending_mud_volume: null,
    max_gas: null,
    conn_gas: null,
    trip_gas: null,
    back_gas: null,
    annular_velocity: null,
    pb: null,
    sys_hhp: null,
    hhpb: null,
    hsi: null,
    percent_psib: null,
    jet_velocity: null,
    impact_force: null,
    if_area: null,
    stop_cards: null,
    lta: null,
    spill: null,
    h2s_test: null,
    hse_mtg: null,
    kicktrip: null,
    kickdrill: null,
    fire: null,
    job_id: job_id,
    personnel: [
      {
        company: null,
        people: null,
      },
    ],
    Incidents: [
      {
        incidents_time: "",
        incident: null,
        incident_type: null,
        comments: null,
      },
    ],
    time_breakdowns: [
      {
        start_time: "16:52:54.442Z",
        end_time: "16:52:54.442Z",
        start_measured_depth: null,
        end_measured_depth: null,
        category: "DRILLING",
        p: null,
        npt: "NP",
        code: "(1) Rig Up and Tear Down",
        operation: null,
      },
    ],
    bit_records: {
      bit_size: null,
      bit_number: null,
      bit_run: null,
      manufacturer: null,
      iadc_code: null,
      jets: null,
      serial: null,
      depth_out: null,
      depth_in: null,
      meterage: null,
      bit_hours: null,
      nozzels: null,
      dull_grade: null,
    },
    bottom_hole_assemblies: [
      {
        bha_number: null,
        bha_run: null,
        components: [],
      },
    ],
    drilling_fluids: [],
    mud_additives: [],
    bulk_materials: [],
    directional_surveys: [],
    pumps: [],
    weather: {
      temperature_high: null,
      temperature_low: null,
      chill_factor: null,
      wind_speed: null,
      wind_direction: null,
      barometric_pressure: null,
      wave_height: null,
      wave_current_speed: null,
      road_condition: null,
      visibility: null,
    },
  });

  // 

  const toast = useToast();
  const postData = async () => {
    try {
      const response = await PostOperationReport(job_id, handleData);
      
      if (response.status === 200) {
        toast({
          title: "Data Berhasil",
          description: "Data Berhasil",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      if (error.response.status === 422) {
        toast({
          title: "Error",
          description: "Harap Periksa Kembali Fieldnya",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        console.error(error);
        const fieldErrors = {};
        error.response.data.detail.forEach((error) => {
          const field = error.loc;
          // 
          const fieldsname = field[field?.length - 1];
          // console.error(field);
          // 
          fieldErrors[fieldsname] = error.msg;
          // Sets the error message for each field
        });

        setErrors(fieldErrors);
      }
      if (error.status === 500) {
        toast({
          title: "500 Server Error",
          description: " Terjadi Kesalahan Pada Server",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      // console.error(error);
    }
  };

  const handleChangeNoName = React.useCallback(
    (data) => {
      setHandleData((prev) => ({ ...prev, ...data }));
    },
    [setHandleData]
  );

  // Menggunakan useCallback untuk handleDataWithName
  const handleDataWithName = React.useCallback(
    (name) => (data) => {
      setHandleData((prev) => ({ ...prev, [name]: data }));
    },
    [setHandleData]
  );
  const ButtonUploadDOR = () => {
    return (
      <Flex gap={4}>
        <Button colorScheme="blue" onClick={onOpen} variant="solid">
          Upload Daily Report
        </Button>
      </Flex>
    );
  };

  return (
    <>
      <ModalUploadDailyReport isOpen={isOpen} onClose={onClose} />

      <CardFormK3
        title="Daily Operational Report"
        actionButton={<ButtonUploadDOR />}
        subtitle=""
        titleSize="28px"
        borderWidth="0px"
        icon={null}
      >
        <SimpleGrid columns={1} spacing={2}>
          <DailyDates
            handleChangeOfData={handleChangeNoName}
            messageError={errors}
            initialData={initialData}
          />
          <TimeBreakdown
            handleChange={handleDataWithName("time_breakdowns")}
            initialData={initialData?.time_breakdowns}
          />
          <DrillingFluid
            handleChangeOfData={handleDataWithName("drilling_fluids")}
            initialData={initialData?.drilling_fluids}
          />
          <MudAdditive
            handleChangeOfData={handleDataWithName("mud_additives")}
            initialData={initialData?.mud_additives}
          />

          <CardFormK3
            title="Bottom Hole Assemblies"
            subtitle="BR"
            icon={IconInfoCircle}
          >
            <Tabs variant="enclosed-colored">
              <TabList>
                <Tab>BHA 1</Tab>
                <Tab>BHA 2</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <BottomHoleAssembly
                    handleFormData={(data) =>
                      setHandleData((prev) => ({
                        ...prev,
                        bottom_hole_assemblies: [
                          ...(prev.bottom_hole_assemblies[0]
                            ? [prev.bottom_hole_assemblies[0]]
                            : []), // Simpan BitRecord jika sudah ada
                          data, // BitRecord2 di posisi kedua
                        ],
                      }))
                    }
                    initialData={initialData?.bottom_hole_assemblies?.[0]}
                  />
                </TabPanel>
                <TabPanel>
                  <BottomHoleAssembly
                    handleFormData={(data) =>
                      setHandleData((prev) => ({
                        ...prev,
                        bottom_hole_assemblies: [
                          ...(prev.bottom_hole_assemblies[1]
                            ? [prev.bottom_hole_assemblies[1]]
                            : []), // Simpan BitRecord jika sudah ada
                          data, // BitRecord2 di posisi kedua
                        ],
                      }))
                    }
                    initialData={initialData?.bottom_hole_assemblies?.[1]}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardFormK3>

          {/* <BitRecord handleChangeOfData={handleDataWithName("bit_records")} /> */}
          <CardFormK3 title="Bit Record" subtitle="BR" icon={IconInfoCircle}>
            <Tabs variant="enclosed-colored">
              <TabList>
                <Tab>BR 1</Tab>
                <Tab>BR 2</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <BitRecord
                    handleChangeOfData={(data) =>
                      setHandleData((prev) => ({
                        ...prev,
                        bit_records: [
                          ...(prev.bit_records[1] ? [prev.bit_records[1]] : []), // Simpan BitRecord jika sudah ada
                          data, // BitRecord2 di posisi kedua
                        ],
                      }))
                    }
                    initialData={initialData?.bit_records?.[1]}
                  />
                </TabPanel>
                <TabPanel>
                  <BitRecord
                    handleChangeOfData={(data) =>
                      setHandleData((prev) => ({
                        ...prev,
                        bit_records: [
                          ...(prev.bit_records[0] ? [prev.bit_records[0]] : []), // Simpan BitRecord jika sudah ada
                          data, // BitRecord2 di posisi kedua
                        ],
                      }))
                    }
                    initialData={initialData?.bit_records?.[0]}
                  />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardFormK3>

          {/* <BitRecord2
            handleChangeOfData={(data) =>
              setHandleData((prev) => ({
                ...prev,
                bit_records: [
                  ...(prev.bit_records[0] ? [prev.bit_records[0]] : []), // Simpan BitRecord jika sudah ada
                  data, // BitRecord2 di posisi kedua
                ],
              }))
            }
          /> */}

          <CasingOps
            handleChangeOfData={handleChangeNoName}
            messageError={errors}
            initialData={initialData}
          />
          <MudVolumes
            handleChangeOfData={handleChangeNoName}
            messageError={errors}
            initialData={initialData}
          />
          <GasForm
            handleChangeOfData={handleChangeNoName}
            messageError={errors}
            initialData={initialData}
          />
          <HydraulicAnalysisForm
            handleChangeOfData={handleChangeNoName}
            messageError={errors}
            initialData={initialData}
          />
          <MaterialForm
            handleChangeOfData={handleDataWithName("bulk_materials")}
            initialData={initialData?.bulk_materials}
          />
          <HealthSafety
            handleChangeOfData={handleChangeNoName}
            handleChangeDataIncident={handleDataWithName("Incidents")}
            initialDataIncident={initialData?.Incidents}
            initialData={initialData}
            messageError={errors}
          />
          <DirectionalSurvey
            handleChangeOfData={handleDataWithName("directional_surveys")}
            initialData={initialData?.directional_surveys}
          />
          <Personel
            handleChangeOfData={handleDataWithName("personnel")}
            initialData={initialData?.personnel}
          />
          <Pumps
            handleChangeOfData={handleDataWithName("pumps")}
            initialData={initialData?.pumps}
          />
          <WeatherForm
            data={handleDataWithName("weather")}
            messageError={errors}
            initialData={initialData?.weather}
          />
          <Button onClick={postData}>Save</Button>
        </SimpleGrid>
      </CardFormK3>
    </>
  );
});

export default DailyReport;
