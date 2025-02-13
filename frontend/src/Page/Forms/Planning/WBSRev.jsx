import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Grid,
  GridItem,
  SimpleGrid,
  Text,
  useToast,
} from "@chakra-ui/react";
import CardFormK3 from "../Components/CardFormK3";
import FormControlCard from "../Components/FormControl";
import TableDataForm from "../Components/TableDataForm";
import { useJobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN } from "../../../Reducer/reducer";
import { useParams } from "react-router-dom";
import { initialData } from "../../../Reducer/initialData";

// TableWBSRev Component
const TableWBSRev = React.memo(({ onChange, dataTable, TypeSubmit }) => {
  const toast = useToast();
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

  const handleAddDataTable = useCallback(() => {
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
    setData({
      event: "",
      start_date: "",
      end_date: "",
      remarks: "",
    });
  }, [data]);

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
          isDisabled={!data.start_date}
          min={data.start_date}
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
});

// InputWBSRequirement Component
const InputWBSRequirement = React.memo(
  ({ titleWRM, onChange, checkedValue, onChangeField, wrmValueForm }) => {
    const [wrmValue, setWrmValue] = useState({
      start_date: "",
      end_date: "",
      remarks: "",
    });

    React.useEffect(() => {
      if (
        wrmValueForm &&
        !wrmValue.start_date &&
        !wrmValue.end_date &&
        !wrmValue.remarks
      ) {
        setWrmValue({
          start_date: wrmValueForm.start_date || "",
          end_date: wrmValueForm.end_date || "",
          remarks: wrmValueForm.remarks || "",
        });
      }
    }, [wrmValueForm, wrmValue]);

    useEffect(() => {
      onChangeField(wrmValue);
    }, [wrmValue]);

    useEffect(() => {
      onChange(checkedValue);
      if (!checkedValue) {
        setWrmValue({
          start_date: "",
          end_date: "",
          remarks: "",
        });
      }
    }, [checkedValue]);

    const handleChange = useCallback((value, field) => {
      setWrmValue((prev) => ({ ...prev, [field]: value }));
    }, []);

    return (
      <GridItem>
        <Grid templateColumns="repeat(2, 1fr)">
          <GridItem>
            <Box alignContent="center" w="full" h="full">
              <Checkbox
                isChecked={checkedValue}
                onChange={(e) => onChange(e.target.checked)}
              >
                <Text fontSize="xl" fontFamily={"Mulish"}>
                  {titleWRM}
                </Text>
              </Checkbox>
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
                min={wrmValue.start_date}
                value={wrmValue.end_date}
                isDisabled={!checkedValue || wrmValue.start_date === ""}
                onChange={(e) => handleChange(e.target.value, "end_date")}
              />
            </Flex>
          </GridItem>
        </Grid>
      </GridItem>
    );
  }
);

// Main WBSRev Component
const WBSRev = ({
  WRMValue = (e) => console.log(e),
  WRMRequired = (e) => console.log("value", e),
  // EventWRM,
  handleChangeJobPlan = (e) => console.log(e),
  RawValueWRM,
  WRMRequiredValueBool = (e) => console.log(e),
  TypeSubmit = "create",
  initialData = null,
}) => {
  const { state, dispatch } = useJobContext();
  const { job_id } = useParams();
  const jobId = job_id ?? null;
  //
  const [dataTable, setDataTable] = useState([]);
  const [formData, setFormData] = useState({});
  const initialDataPlan = state.jobPlanExpDev?.job_plan;
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
  //
  //  
  //  
  React.useEffect(() => {
    if (TypeSubmit === "update") {
      setDataFieldWRM((prev) => ({
        ...prev,
        ...initialData.job_plan.work_breakdown_structure,
      }));
    }
     
    if (TypeSubmit === "update" && initialData) {
      setDataWRMRequire((prev) => ({
        wrm_pembebasan_lahan: initialData.job_plan.wrm_pembebasan_lahan,
        wrm_ippkh: initialData.job_plan.wrm_ippkh,
        wrm_ukl_upl: initialData.job_plan.wrm_ukl_upl,
        wrm_amdal: initialData.job_plan.wrm_amdal,
        wrm_pengadaan_rig: initialData.job_plan.wrm_pengadaan_rig,
        wrm_pengadaan_drilling_services:
          initialData.job_plan.wrm_pengadaan_drilling_services,
        wrm_pengadaan_lli: initialData.job_plan.wrm_pengadaan_lli,
        wrm_persiapan_lokasi: initialData.job_plan.wrm_persiapan_lokasi,
        wrm_internal_kkks: initialData.job_plan.wrm_internal_kkks,
        wrm_evaluasi_subsurface: initialData.job_plan.wrm_evaluasi_subsurface,
      }));
    }

    TypeSubmit === "update"
      ? setDataTable((prev) => [...initialData.job_plan.work_breakdown_structure.events])
      : setDataTable([]);
  }, [TypeSubmit]);
  //
  //

  //
  React.useEffect(() => {
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN,
      payload: dataWRMRequire,
    });
  }, [dataWRMRequire]);
  // React.useEffect(() => {
  //   setFormData((prevData) => ({
  //     ...prevData,
  //     ...dataFieldWRM,
  //   }));
  // }, [dataFieldWRM]);

  React.useEffect(() => {
    setDataFieldWRM((prevData) => ({
      ...prevData,
      events: dataTable,
    }));
  }, [dataTable]);

  React.useEffect(() => {
    // handleChangeJobPlan(formData);
    //  
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN,
      payload: {
        work_breakdown_structure: dataFieldWRM,
      },
    });
  }, [dataFieldWRM]);

  const handleChangeOfData = useCallback(
    (data, name) => {
      setDataWRMRequire((prev) => ({ ...prev, [name]: data }));

      //

      if (!data) {
        setDataFieldWRM((prev) => {
          const newState = { ...prev };
          delete newState[name];
          return newState;
        });
      }
    },
    [dataFieldWRM]
  );

  // const handleChangeOfData = (data,name) => {
  //   setDataWRMRequire((prev) => ({ ...prev, [name]: data }));
  // }

  const handleWRMValue = useCallback(
    (fieldData, name) => {
      if (dataWRMRequire[name]) {
        setDataFieldWRM((prev) => ({ ...prev, [name]: fieldData }));
      }
    },
    [dataWRMRequire]
  );

  const header = useMemo(
    () => [
      { Header: "Event", accessor: "event", type: "text" },
      { Header: "Start Date", accessor: "start_date", type: "date" },
      { Header: "End Date", accessor: "end_date", type: "date" },
      { Header: "Remark", accessor: "remarks", type: "text" },
    ],
    []
  );

  const wrmFields = useMemo(
    () => [
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
      { name: "wrm_internal_kkks", title: "Internal KKKS" },
      { name: "wrm_evaluasi_subsurface", title: "Evaluasi Subsurface" },
      { name: "wrm_persiapan_lokasi", title: "Persiapan Lokasi" },
    ],
    []
  );

  const handleDataTableChange = useCallback(
    (newData) => {
      //  
      setDataTable(newData);
    },
    [dataTable]
  );

  return (
    <CardFormK3 title="Work Breakdown Structure" mt={2} subtitle="*Required">
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

        {wrmFields.map((field) => (
          <InputWBSRequirement
            key={field.name}
            titleWRM={field.title}
            onChangeField={(e) => handleWRMValue(e, field.name)}
            checkedValue={dataWRMRequire[field.name]}
            wrmValueForm={dataFieldWRM[field.name]}
            onChange={(e) => handleChangeOfData(e, field.name)}
          />
        ))}

        <GridItem mt={4}>
          <SimpleGrid columns={2} gap={4}>
            <CardFormK3 title="" subtitle="" icon={null}>
              <TableWBSRev
                onChange={handleDataTableChange}
                dataTable={dataTable}
              />
            </CardFormK3>
            <CardFormK3 title="" subtitle="" icon={null}>
              <TableDataForm
                data={dataTable}
                headers={header}
                onDataChange={handleDataTableChange}
              />
            </CardFormK3>
          </SimpleGrid>
        </GridItem>
      </Grid>
    </CardFormK3>
  );
};

export default WBSRev;
