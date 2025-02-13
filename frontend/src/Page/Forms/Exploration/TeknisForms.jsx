import React, { useCallback, useState, useEffect } from "react";
import WellCasing from "../Planning/WellCasing";
import WellTrajectory from "../Planning/WellTrajectory";
import ElevationsAndDepths from "./../Planning/ElevationsandDepths";
import WellLocation from "./../Planning/WellLocation";
import JobDetail from "./../Planning/JobDetail";
import KeyDates from "./../Planning/KeyDates";
import WellStratigraphyForm from "../Operation/FormHandling/WellStratigraphy";
import SeismicLine from "../Planning/SeismicLine";
import CardUploadTabular from "../Components/CardUploadTabular";
import { JobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN_WELL } from "../../../Reducer/reducer";
import CardFormTabular from "../Planning/Shared/CardFormTabular";
import Others from "../Planning/Others";
import WellTest from "../Planning/WellTest";
import DynamicRowGrid from "../../Components/Form/DynamicRowGrid/DynamicRowGrid";
// import DataHeaderWellLogs from "../Operation/FormHandling/Utils/WellLogsHeader";
import { Box } from "@chakra-ui/react";
import {
  TableWellEquipmentConf,
  wellCasingConf,
  wellCompletionConf,
  wellPressureConf,
  wellTestConf,
  TableWellLogsConf,
  TableWellCoresConf,
} from "../../../Page/Components/utils/TableHeader";
import WellCoresFormPlann from "../Planning/WellCoresPlan";

const CardFormWell = ({
  onFormChange = (e) => {
    return;
  },
  unitType,
  errorForms,
  wellType,
  area_id,
  initialData = null,
  TypeSubmit = "create",
  TypeOperasional,
}) => {
  const { state, dispatch } = React.useContext(JobContext);
  const [formData, setFormData] = useState({
    unit_type: "METRICS",
  });
  //
  const initialDataJobPlanWell = state.jobPlanExpDev?.job_plan?.well || null;
  // const dataHeader = DataHeaderWellLogs;

  const handleChangeFile = (name, data) => {
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: {
        [name]: data,
      },
    });
  };

  const [tableData, setTableData] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    unit_type: "METRICS",
    depth_datum: "RT",
    depth: 0,
    hole_diameter: 0,
    bit: null,
    casing_outer_diameter: 0,
    logging: null,
    mud_program: null,
    cementing_program: null,
    bottom_hole_temperature: 0,
    rate_of_penetration: 0,
    remarks: null,
  });

  //

  const [TablewellStratigraphy, setTablewellStratigraphy] = useState([]);
  const [WellStratigraphy, setWellStratigraphy] = useState({
    unit_type: "METRICS",
    depth_datum: "RT",
    depth: 0,
    stratigraphy_id: null,
  });

  useEffect(() => {
    //
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: formData,
    });
  }, [formData]);

  // const handleChangeDynamicTable = React.useCallback((objectName, data) => {
  //

  //   dispatch({
  //     type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
  //     payload: {
  //       [objectName]: data,
  //     },
  //   });
  // }, []);
  const handleChangeDynamicTable = React.useCallback(
    (objectName, data) => {
      // Map through the data and replace unit_type with unitType
      if (objectName === "well_logs" || objectName === "well_cores") {
        const modifiedData = data.map((item) => ({
          ...item,
          unit_type: unitType, // Assuming unitType is defined in the scope
        }));

        dispatch({
          type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
          payload: {
            [objectName]: modifiedData,
          },
        });
      } else {
        dispatch({
          type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
          payload: {
            [objectName]: data,
          },
        });
      }
    },
    [unitType]
  ); // Add unitType to dependency array

  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;

    let parsedValue;
    if (type === "number") {
      const stringValue = String(value);
      parsedValue =
        stringValue === ""
          ? ""
          : stringValue.includes(".")
          ? parseFloat(stringValue)
          : parseInt(stringValue, 10);
    } else if (type === "text") {
      parsedValue = value;
    } else {
      parsedValue = value;
    }

    setFormData((prevData) => {
      // If well_profile_type is "VERTICAL", reset well_directional_type to null
      if (name === "well_profile_type" && value === "VERTICAL") {
        return {
          ...prevData,
          [name]: parsedValue,
          well_directional_type: null,
        };
      }

      return {
        ...prevData,
        [name]: parsedValue,
      };
    });
  }, []);
  //
  //conso
  return (
    <>
      <JobDetail
        unittype={unitType}
        errorForms={errorForms}
        wellType={wellType}
        TypeSubmit={TypeSubmit}
        initialData={initialData?.job_plan?.well || null}
        TypeOperational={TypeOperasional}
      />
      <WellLocation
        errorForms={errorForms}
        initialData={initialData?.job_plan?.well || null}
        TypeSubmit={TypeSubmit}
      />
      <Others
        initialData={initialData?.job_plan?.well || null}
        TypeSubmit={TypeSubmit}
        errorForms={errorForms}
      />
      <ElevationsAndDepths
        unittype={unitType}
        errorForms={errorForms}
        initialData={initialData?.job_plan.well || null}
        TypeSubmit={TypeSubmit}
      />
      {/* <Seismic handleChange={handleChange} formData={formData} />  */}
      <KeyDates
        initialData={initialData?.job_plan.well || null}
        TypeSubmit={TypeSubmit}
        handleChange={handleChange}
        formData={formData}
        errorForms={errorForms}
      />

      {/* <WellCasing
        unittype={unitType}
        errorForms={errorForms}
        initialData={initialData?.job_plan.well.well_casing || null}
        TypeSubmit={TypeSubmit}
      /> */}

      <WellStratigraphyForm />
      <Box my={2}>
        {/* <DynamicRowGrid
          title="Well Logs"
          objectName="well_logs"
          onDataChange={handleChangeDynamicTable}
          columnConfig={dataHeader}
          initialData={initialData?.job_plan?.well?.well_logs || null}
        /> */}
      </Box>
      <Box my={2}>
        <DynamicRowGrid
          title="Well Equipment"
          objectName="well_equipments"
          onDataChange={handleChangeDynamicTable}
          columnConfig={TableWellEquipmentConf}
          initialData={initialData?.job_plan?.well?.well_equipments || null}
        />
      </Box>
      <Box my={2}>
        <DynamicRowGrid
          title="Well Completion"
          objectName="well_completion"
          onDataChange={handleChangeDynamicTable}
          columnConfig={wellCompletionConf}
          initialData={initialData?.job_plan?.well?.well_completion || null}
        />
      </Box>
      <Box my={2}>
        <DynamicRowGrid
          title="Well Pressure"
          objectName="well_pressure"
          onDataChange={handleChangeDynamicTable}
          columnConfig={wellPressureConf}
          initialData={initialData?.job_plan?.well?.well_pressure || null}
        />
      </Box>
      <Box my={2}>
        <DynamicRowGrid
          title="Well Casing"
          objectName="well_casings"
          onDataChange={handleChangeDynamicTable}
          columnConfig={wellCasingConf}
          initialData={initialData?.job_plan?.well?.well_casings || null}
        />
      </Box>
      {/* <Box my={2}>
        <DynamicRowGrid
          title="Well Trajectory"
          objectName="well_trajectory"
          onDataChange={handleChangeDynamicTable}
          columnConfig={wellTrajectoryConf}
        />
      </Box> */}
      {TypeOperasional === "exploration" && (
        <Box my={2}>
          <DynamicRowGrid
            title="Well Test"
            objectName="well_tests"
            onDataChange={handleChangeDynamicTable}
            columnConfig={wellTestConf}
            initialData={initialData?.job_plan.well?.well_tests || null}
          />
        </Box>
      )}

      <WellTrajectory
        errorForms={errorForms}
        value={initialData?.job_plan?.well?.well_trajectory || null}
        TypeSubmit={TypeSubmit}
        name={"well_trajectory"}
        unit_type={unitType}
        OnChangeData={handleChangeFile}
      />

      <SeismicLine
        value={initialData?.job_plan?.well?.seismic_line || null}
        TypeSubmit={TypeSubmit}
        name={"seismic_line"}
        OnChangeData={handleChangeFile}
      />

      <CardFormTabular
        title="Well Pore Pressure Fracture Gradient"
        subtitle="Well PPFG"
        name={"well_ppfg"}
        
        maxFileSize={5}
        acceptFormat={[".pdf"]}
        visibleTable={false}
        OnChangeData={handleChangeFile}
        TypeSubmit={TypeSubmit}
        initialData={initialDataJobPlanWell?.well_ppfg || null}
      />

      <CardFormTabular
        title="Well Material "
        subtitle="Well Material"
        name={"well_materials"}
        visibleTable={false}
        OnChangeData={handleChangeFile}
        TypeSubmit={TypeSubmit}
        initialData={initialDataJobPlanWell?.well_materials || null}
      />

      <CardFormTabular
        title="Well Schematic"
        subtitle="Well Schematic"
        name={"well_schematic"}
        visibleTable={false}
        TypeSubmit={TypeSubmit}
        OnChangeData={handleChangeFile}
        initialData={initialDataJobPlanWell?.well_schematic || null}
      />
      {/* <CardFormTabular
        title="Well Log Plan"
        subtitle="Well Log Plan"
        name={"well_log_plan"}
        visibleTable={false}
        TypeSubmit={TypeSubmit}
        OnChangeData={handleChangeFile}
        initialData={initialDataJobPlanWell?.well_log_plan || null}
      /> */}
      <Box my={2}>
        <DynamicRowGrid
          title="Well Logs"
          objectName="well_logs"
          onDataChange={handleChangeDynamicTable}
          columnConfig={TableWellLogsConf}
          initialData={initialDataJobPlanWell?.well_logs || null}
        />
      </Box>
      <CardFormTabular
        title="Well Drilling Parameter"
        subtitle="Well Drilling Parameter"
        name={"well_drilling_parameter_plan"}
        visibleTable={false}
        TypeSubmit={TypeSubmit}
        OnChangeData={handleChangeFile}
        initialData={
          initialDataJobPlanWell?.well_drilling_parameter_plan || null
        }
      />

      {TypeOperasional === "exploration" && (
        <>
          {/* <CardFormTabular
            title="Well Core Plan"
            subtitle="Well Core Plan"
            name={"well_core_plan"}
            visibleTable={false}
            TypeSubmit={TypeSubmit}
            OnChangeData={handleChangeFile}
            initialData={initialDataJobPlanWell?.well_core_plan || null}
          /> */}
          <Box my={2}>
            <DynamicRowGrid
              title="Well Cores"
              objectName="well_cores"
              onDataChange={handleChangeDynamicTable}
              columnConfig={TableWellCoresConf}
              initialData={initialDataJobPlanWell?.well_cores || null}
            />
          </Box>
          {/* <CardFormTabular
            title="Well Test Plan"
            subtitle="Well Test Plan"
            name={"well_test_plan"}
            visibleTable={false}
            TypeSubmit={TypeSubmit}
            OnChangeData={handleChangeFile}
            initialData={initialDataJobPlanWell?.well_test_plan || null}
          /> */}
        </>
      )}

      {/* <WellPorePressureForm handleDataSubmit={(e)=> setFormData((prev) => ({ ...prev, well_ppfg: e }))}/> */}
    </>
  );
};

export default CardFormWell;
