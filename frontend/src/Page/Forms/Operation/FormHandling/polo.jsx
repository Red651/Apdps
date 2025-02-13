import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import TableDataForm from "../../Components/TableDataForm";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";

const TableWBSOperation = ({ onChange, dataTable }) => {
  const toast = useToast();
  const { state, dispatch } = useJobContext();
  const [tableData, setTableData] = useState([]);
  const [data, setData] = useState({
    event: "",
    start_date: "",
    end_date: "",
    remarks: "",
  });

  useEffect(() => {
    setTableData(dataTable);
  }, [dataTable]);

  const handleAddDataTable = () => {
    if (Object.values(data).some((value) => !value)) {
      toast({
        title: "Incomplete Data",
        description: "Please fill all required fields.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    const updatedTableData = [...tableData, data];
    setTableData(updatedTableData);
    onChange(updatedTableData);
    //  ANCHOR INGFOKAN LE
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: {
        ...state.initialOperationData, // Mengambil state lama
        actual_job: {
          ...state.initialOperationData.actual_job, // Mengambil job yang lama
          work_breakdown_structure: {
            ...state.initialOperationData.actual_job.work_breakdown_structure, // Mengambil struktur lama
            events: updatedTableData, // Mengupdate nilai baru
          },
        },
      },
    });
    setData({
      event: "",
      start_date: "",
      end_date: "",
      remarks: "",
    });
  };

  const updateField = useCallback((field, value) => {
    setData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  }, []);

  return (
    <Box>
      <FormControlCard
        labelForm="Event"
        type="text"
        value={data.event}
        onChange={(e) => updateField("event", e.target.value)}
      />
      <Flex gap={4}>
        <FormControlCard
          labelForm="Start Date"
          type="date"
          value={data.start_date}
          onChange={(e) => updateField("start_date", e.target.value)}
        />
        <FormControlCard
          labelForm="End Date"
          type="date"
          value={data.end_date}
          onChange={(e) => updateField("end_date", e.target.value)}
        />
      </Flex>
      <FormControlCard
        labelForm="Remarks"
        type="text"
        isTextArea
        value={data.remarks}
        onChange={(e) => updateField("remarks", e.target.value)}
      />
      <Flex justifyContent="flex-end" mt={2}>
        <Button colorScheme="blue" onClick={handleAddDataTable}>
          Add
        </Button>
      </Flex>
    </Box>
  );
};

const InputWBSRequirement = ({
  titleWRM,
  checkedValue,
  wrmValueForm,
  onChangeField,
  dispatch,
  name,
  state,
}) => {
  const [wrmValue, setWrmValue] = useState(
    wrmValueForm || {
      start_date: "",
      end_date: "",
      remarks: "",
    }
  );

  useEffect(() => {
    if (wrmValueForm) {
      setWrmValue(wrmValueForm);
    }
  }, [wrmValueForm]);

  const handleChange = (value, field) => {
    const updatedValue = { ...wrmValue, [field]: value };
    setWrmValue(updatedValue);
    onChangeField(updatedValue);

    // Dispatch to update the reducer state
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: {
        ...state.initialOperationData, // Mengambil state lama
        actual_job: {
          ...state.initialOperationData.actual_job, // Mengambil job yang lama
          work_breakdown_structure: {
            ...state.initialOperationData.actual_job.work_breakdown_structure, // Mengambil struktur lama
            [name]: updatedValue, // Mengupdate nilai baru
          },
        },
      },
    });
  };

  return (
    <GridItem>
      <Grid templateColumns="repeat(2, 1fr)">
        <GridItem>
          <Box alignContent="center" w="full" h="full">
            <Text fontSize="xl" fontFamily={"Mulish"}>
              {titleWRM}
            </Text>
          </Box>
        </GridItem>
        <GridItem>
          <Flex gap={4}>
            <FormControlCard
              labelForm=""
              type="date"
              value={wrmValue.start_date}
              isDisabled={!checkedValue}
              onChange={(e) => handleChange(e.target.value, "start_date")}
            />
            <FormControlCard
              labelForm=""
              type="date"
              value={wrmValue.end_date}
              isDisabled={!checkedValue}
              onChange={(e) => handleChange(e.target.value, "end_date")}
            />
          </Flex>
        </GridItem>
      </Grid>
    </GridItem>
  );
};

const WBSOperation = ({
  WRMValue,
  WRMRequired,
  EventWRM = (e) => {},
  onChangeData = (e) => {},
  RawValueWRM,
  WRMRequiredValueBool,
}) => {
  const toast = useToast();
  const { state, dispatch } = useJobContext();
  // 
  RawValueWRM =
    state?.initialOperationData?.actual_job?.work_breakdown_structure;
  // 
  const [dataTable, setDataTable] = useState([]);
  const [dataWRMRequire, setDataWRMRequire] = useState({
    wrm_pembebasan_lahan: false,
    wrm_ippkh: false,
    wrm_ukl_upl: false,
    wrm_amdal: false,
    wrm_pengadaan_rig: false,
    wrm_pengadaan_drilling_services: false,
    wrm_pengadaan_lli: false,
    wrm_persiapan_lokasi: false,
    wrm_internal_kkks: false,
    wrm_evaluasi_subsurface: false,
  });
  const [dataFieldWRM, setDataFieldWRM] = useState({});

  useEffect(() => {
    if (RawValueWRM) {
      setDataWRMRequire(RawValueWRM);
      if (RawValueWRM.events) {
        setDataTable(RawValueWRM.events);
        // Dispatch to update the reducer state
        // dispatch({
        //   type: UPDATE_OPERATION_DATA,
        //   payload: {
        //     ...state.initialOperationData, // Mengambil state lama
        //     actual_job: {
        //       ...state.initialOperationData.actual_job, // Mengambil job yang lama
        //       work_breakdown_structure: {
        //         ...state.initialOperationData.actual_job
        //           .work_breakdown_structure, // Mengambil struktur lama
        //         events: RawValueWRM.events, // Mengupdate nilai baru
        //       },
        //     },
        //   },
        // });
      }
    }
  }, [RawValueWRM]);

  useEffect(() => {
    onChangeData("job_plan.work_breakdown_structure", dataFieldWRM);
  }, [dataFieldWRM, onChangeData]);

  useEffect(() => {
    EventWRM(dataTable);
  }, [dataTable]);

  const handleWRMValue = (fieldData, name) => {
    setDataFieldWRM((prev) => ({ ...prev, [name]: fieldData }));
  };

  const handleDispatch = useCallback(
    (data, name) => {
      dispatch({
        type: UPDATE_OPERATION_DATA,
        payload: {
          actual_job: {
            work_breakdown_structure: {
              ...dataFieldWRM,
              [name]: data,
            },
          },
        },
      });
    },
    [dispatch, dataFieldWRM]
  );

  const header = [
    { Header: "Event", accessor: "event", type: "text" },
    { Header: "Start Date", accessor: "start_date", type: "date" },
    { Header: "End Date", accessor: "end_date", type: "date" },
  ];

  const wrmFields = [
    { name: "wrm_pembebasan_lahan", title: "Pembebasan Lahan" },
    { name: "wrm_ippkh", title: "Izin PPKH" },
    { name: "wrm_ukl_upl", title: "UKL & UPL" },
    { name: "wrm_amdal", title: "AMDAL" },
    { name: "wrm_pengadaan_rig", title: "Pengadaan Rig" },
    {
      name: "wrm_pengadaan_drilling_services",
      title: "Pengadaan Drilling Service",
    },
    { name: "wrm_pengadaan_lli", title: "Pengadaan LLI" },
    { name: "wrm_persiapan_lokasi", title: "Persiapan Lokasi" },
    { name: "wrm_internal_kkks", title: "Internal KKKS" },
    { name: "wrm_evaluasi_subsurface", title: "Evaluasi Subsurface" },
    { name: "wrm_pengadaan_equipment", title: "Pengadaan Equipment" },
    { name: "wrm_pengadaan_services", title: "Pengadaan Services" },
    { name: "wrm_pengadaan_handak", title: "Pengadaan Handak" },
    { name: "wrm_pengadaan_octg", title: "Pengadaan OCTG" },
    {
      name: "wrm_pengadaan_artificial_lift",
      title: "Pengadaan Artificial Lift",
    },
    { name: "wrm_sumur_berproduksi", title: "Sumur Berproduksi" },
    { name: "wrm_fasilitas_produksi", title: "Fasilitas Produksi" },
  ];

  return (
    <CardFormK3 title="Work Breakdown Structure" subtitle="WBS">
      <Grid templateColumns="repeat(1, 1fr)" mx={2}>
        <GridItem>
          <Grid templateColumns="repeat(2, 1fr)">
            <GridItem>
              <Box alignContent="center" w="full" h="full">
                <Text fontSize="xl" fontWeight="bold" fontFamily={"Mulish"}>
                  WBS
                </Text>
              </Box>
            </GridItem>
            <GridItem>
              <Flex gap={4}>
                <Text
                  flex={1}
                  fontSize="xl"
                  fontWeight="bold"
                  fontFamily={"Mulish"}
                >
                  Start Date
                </Text>
                <Text
                  flex={1}
                  fontSize="xl"
                  fontWeight="bold"
                  fontFamily={"Mulish"}
                >
                  End Date
                </Text>
              </Flex>
            </GridItem>
          </Grid>
        </GridItem>

        {wrmFields.map((field) => {
          if (dataWRMRequire[field.name]) {
            return (
              <InputWBSRequirement
                key={field.name}
                titleWRM={field.title}
                checkedValue={dataWRMRequire[field.name]}
                wrmValueForm={dataWRMRequire[field.name]}
                onChangeField={(e) => handleWRMValue(e, field.name)}
                dispatch={dispatch}
                name={field.name}
                state={state}
              />
            );
          }
        })}

        <GridItem mt={4}>
          <SimpleGrid columns={2} gap={4}>
            <CardFormK3 title="" subtitle="" icon={null}>
              <TableWBSOperation
                onChange={(e) => setDataTable(e)}
                dataTable={dataTable}
              />
            </CardFormK3>
            <CardFormK3 title="" subtitle="" icon={null}>
              <TableDataForm
                data={dataTable}
                headers={header}
                onDataChange={(e) => setDataTable(e)}
              />
            </CardFormK3>
          </SimpleGrid>
        </GridItem>
      </Grid>
    </CardFormK3>
  );
};

export default WBSOperation;
