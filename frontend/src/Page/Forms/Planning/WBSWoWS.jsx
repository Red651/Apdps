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

// TableWBSRev Component
const TableWBSRev = React.memo(({ onChange, dataTable }) => {
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
  }, [data, tableData, onChange, toast]);

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
          min={data.start_date}
          isDisabled={!data.start_date}
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

    });

    useEffect(() => {
      onChangeField(wrmValue);
    }, [wrmValue]);
    React.useEffect(()=> {
      if(wrmValueForm) {
        setWrmValue(wrmValueForm)
      }
    },[wrmValue])

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
const WBSWoWS = ({
  WRMValue = (e) => console.log(e),
  WRMRequired = (e) => console.log("value", e),
  EventWRM = (e) => console.log("EventWMR", e),
  TypeSubmit="create",
  initialData= null
}) => {
  const { state, dispatch } = useJobContext();
  const JobPlanExpDev = state.jobPlanExpDev?.job_plan;
  const { job_id } = useParams();
  const [dataTable, setDataTable] = useState([]);
  const [formData, setFormData] = useState({});
  const [dataWRMRequire, setDataWRMRequire] = useState({
    wrm_internal_kkks: false,
    wrm_pengadaan_equipment: false,
    wrm_pengadaan_services: false,
    wrm_pengadaan_handak: false,
    wrm_pengadaan_octg: false,
    wrm_pengadaan_lli: false,
    wrm_pengadaan_artificial_lift: false,
    wrm_sumur_berproduksi: false,
    wrm_fasilitas_produksi: false,
    wrm_persiapan_lokasi: false,
    wrm_well_integrity: false,
  });
  const [dataFieldWRM, setDataFieldWRM] = useState({});
  const [formFieldWRM, setFormFieldWRM] = useState({});

  // 
  // 
  React.useEffect(() => {
    setFormFieldWRM((prev) => ({ ...prev, ...dataFieldWRM }));
    setFormFieldWRM((prev) => ({ ...prev, events: dataTable }));
  }, [dataFieldWRM, dataTable]);

  React.useEffect(()=>  {
    if(TypeSubmit === "update" && initialData) {
      setFormData((prevData)=>({
        ...prevData,
        ...initialData.work_breakdown_structure
      }))
    }
  },[TypeSubmit])

  React.useEffect(() => {
    // WRMValue(formFieldWRM)
    // 
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN,
      payload: {
        work_breakdown_structure: formFieldWRM,
      },
    });
  }, [formFieldWRM]);

   
  React.useEffect(() => {
   
    if (TypeSubmit === "update" && initialData) {
      
      setDataWRMRequire((prev) => ({
        wrm_internal_kkks: initialData?.wrm_internal_kkks || false,
        wrm_pengadaan_equipment: initialData?.wrm_pengadaan_equipment || false,
        wrm_pengadaan_services: initialData?.wrm_pengadaan_services || false,
        wrm_pengadaan_handak: initialData?.wrm_pengadaan_handak || false,
        wrm_pengadaan_octg: initialData?.wrm_pengadaan_octg || false,
        wrm_pengadaan_lli: initialData?.wrm_pengadaan_lli || false,
        wrm_pengadaan_artificial_lift:
          initialData?.wrm_pengadaan_artificial_lift || false,
        wrm_sumur_berproduksi: initialData?.wrm_sumur_berproduksi || false,
        wrm_fasilitas_produksi: initialData?.wrm_fasilitas_produksi || false,
        wrm_persiapan_lokasi: initialData?.wrm_persiapan_lokasi || false,
        wrm_well_integrity: initialData?.wrm_well_integrity || false,
      }));
    }

    if (TypeSubmit === "update" && initialData) {
      setDataTable((prev) => {
        return [...prev, ...initialData?.work_breakdown_structure?.events];
      });
    }
  }, [TypeSubmit]);

  // React.useEffect(() => {
  //   dispatch({});
  // }, [job_id]);

  React.useEffect(() => {
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN,
      payload: dataWRMRequire,
    });
  }, [dataWRMRequire]);

  const handleChangeOfData = useCallback(
    (data, name) => {
      setDataWRMRequire((prev) => ({ ...prev, [name]: data }));

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
    ],
    []
  );

  const wrmFields = useMemo(
    () => [
      { name: "wrm_internal_kkks", title: "Internal KKKS" },
      { name: "wrm_pengadaan_equipment", title: "Pengadaan Equipment" },
      { name: "wrm_pengadaan_services", title: "Pengadaan Services" },
      { name: "wrm_pengadaan_handak", title: "Pengadaan Handak" },
      { name: "wrm_pengadaan_octg", title: "Pengadaan OCTG" },
      { name: "wrm_pengadaan_lli", title: "Pengadaan LLI" },
      {
        name: "wrm_pengadaan_artificial_lift",
        title: "Pengadaan Artificial Lift",
      },
      { name: "wrm_sumur_berproduksi", title: "Sumur Berproduksi" },
      { name: "wrm_fasilitas_produksi", title: "Fasilitas Produksi" },
      { name: "wrm_persiapan_lokasi", title: "Persiapan Lokasi" },
    ],
    []
  );

  const handleDataTableChange = useCallback(
    (newData) => {
      setDataTable(newData);
      EventWRM(newData);
    },
    [EventWRM]
  );

  return (
    <CardFormK3 title="Work Breakdown Structure" mt={2} subtitle="WBS">
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
            wrmValueForm={formData[field.name]}
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

export default WBSWoWS;
