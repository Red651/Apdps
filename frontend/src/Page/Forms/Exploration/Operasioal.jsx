import React, { useEffect, useState } from "react";
import ProposedJob from "../Planning/OperasionalID";
import JobOpertionsDays from "../Planning/JobOperationDays";
import HazardType from "../Planning/HazardType";
import JobDocuments from "../Planning/JobDocuments";
import WBSRev from "../Planning/WBSRev";
import JobProjectManagementTeam from "../Planning/JobProjectManagementTeam";
import JobEquipments from "../Planning/JobEquipments";
import JobHSEAspect from "../Planning/JobHSEAspect";
import { Box } from "@chakra-ui/react";
import { useJobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN } from "../../../Reducer/reducer";

const Operasional = ({
  handleChangeJob = (e) => console.log(e),
  handleChangeJobPlan = (e) => console.log(e),
  
  TypeOperational,
  errorForms,
  TypeSubmit = "create",
  initialData= null,
  unitType,
}) => {
  const { state, dispatch } = useJobContext();
  const [data, setData] = useState({});
  const [datas, setDatas] = useState({});
  useEffect(() => {
    handleChangeJobPlan(data);
  }, [data]);
  useEffect(() => {
    handleChangeJob(datas);
  }, [datas]);

  const handleData = (newData) => {
    setData((prevData) => ({ ...prevData, ...newData }));
  };

  const datawrm = (newData) => {
    setDatas((prevData) => ({ ...prevData, ...newData }));
  };

  return (
    <Box gap={2}>
      <ProposedJob
        errorForms={errorForms}
        handleChangeJob={(e) => setDatas((prevData) => ({ ...prevData, ...e }))}
        handleChangeJobPlan={(e) =>
          setData((prevData) => ({ ...prevData, ...e }))
        }
        initialData={initialData}
        TypeOperasional={TypeOperational}
        TypeSubmit={TypeSubmit}
      />
      <WBSRev
        WRMRequired={datawrm}
        WRMRequiredValueBool={(e) =>
          setData((prevData) => ({ ...prevData, ...e }))
        }
        handleChangeJobPlan={(e) =>
          setData({
            ...data,
            work_breakdown_structure: e,
          })
        }
        TypeSubmit={TypeSubmit}
        initialData={initialData}
      />

      <JobOpertionsDays
        errorForms={errorForms}
        handleChangeJobPlan={(data) =>
          setData((prevData) => ({ ...prevData, job_operation_days: data }))
        }
        unitType={unitType}
        TypeSubmit={TypeSubmit}
        initialData={initialData}
      />
      {/* <HazardType errorForms={errorForms} onDataChange={HazardTypeData} /> */}
      <JobProjectManagementTeam
      initialData={initialData?.job_plan.job_project_management_team}
      TypeSubmit={TypeSubmit}

        handleChangeJobPlan={(e) =>
          setData((prev) => ({ ...prev, job_project_management_team: e }))
        }
      />
      <JobEquipments
      initialData={initialData?.job_plan.job_equipment}
      TypeSubmit={TypeSubmit}
        handleChangeJobPlan={(e) =>
          setData((prev) => ({ ...prev, job_equipment: e }))
        }
      />
      <JobHSEAspect
      initialData={initialData?.job_plan.job_hse_aspect}
      TypeSubmit={TypeSubmit}
      errorForms={errorForms}
        handleChangeJobPlan={(e) => setData((prev) => ({ ...prev, ...e }))}
      />

      <JobDocuments
      initialData={initialData?.job_plan.job_documents}
      TypeSubmit={TypeSubmit}
        onChange={(value) => {
          const valueNull = value.length === 0 ? null : value;
           
          dispatch({
            type: ADD_JOB_EXP_DEV_JOB_PLAN,
            payload: {
              job_documents: valueNull,
            },
          });
        }}
      />
    </Box>
  );
};

export default Operasional;
