import React, { useEffect, useState, useCallback } from "react";
import ProposedJob from "../Planning/OperasionalID";
import WRMRequirement from "../Planning/WRMRequirement";
import JobOpertionsDays from "../Planning/JobOperationDays";

import WorkBreakDownStructure from "../Planning/BorkBreakDowns";
import HazardType from "../Planning/HazardType";
import JobDocuments from "../Planning/JobDocuments";
import WBSWoWS from "../Planning/WBSWoWS";
import { set } from "lodash";
import { useJobContext } from "../../../Context/JobContext";
// import { Path } from "leaflet";

const Operasional = ({
  onData,

  jobOperationData,
  handleChangeJobPlan,
  WBSValue,
  TypeOperasionalJob,
  jobPlanData,
  WRMBoolean,
  formErrors={},
  jobHazardData,
  jobDocumentsData,
  initialData,
  TypeSubmit="create",
}) => {
  const [data, setData] = useState({

  });
  const {state,dispatch} = useJobContext();
  // 
  const [datas, setDatas] = useState({});
  // 

  useEffect(() => {
    onData(data);
  }, [data]);

  const jobPlan = state.jobPlanExpDev;

  
  

  const handleData = (name = null, pathData = null) => {
    return (newData) => {
      setData((prevData) => {
        if (!pathData) {
          return { ...prevData, ...newData };
        }

        if (pathData.includes("job_plan.")) {
          return {
            ...prevData,
            job_plan: {
              ...prevData.job_plan,
              ...(name ? { [name]: newData } : newData),
            },
          };
        }

        return {
          ...prevData,
          [name]: newData,
        };
      });
    };
  };
  // const datawrm = useCallback(
  //   (newData) => {
  //     setDatas((prevData) => ({ ...prevData, ...newData }));
  //   },
  //   [setDatas]
  // );

  return (
    <div>
      <ProposedJob
        onData={jobPlanData}
        TypeSubmit={TypeSubmit}
        handleChangeJobPlan={handleChangeJobPlan}
        TypeOperasional={TypeOperasionalJob}
        initialData={initialData}
        errorForms={formErrors}
      />
      {/* <WRMRequirement datawrm={dataWRM} onDataChange={handleData} /> */}
      {/* <WorkBreakDownStructure ondata={WBSdata} errorForms={formErrors} /> */}
      <WBSWoWS
        WRMValue={WBSValue}
        initialData={initialData?.job_plan}
        WRMRequired={WRMBoolean}
        TypeSubmit={TypeSubmit}
      />
      <JobOpertionsDays
        ondata={jobOperationData}
        formErrors={formErrors}
        TypeSubmit={TypeSubmit}
        initialData={initialData}
      />
      <HazardType
        onDataChange={jobHazardData}
        formErrors={formErrors}
        initialData={initialData?.job_plan?.hazard_type}
        TypeSubmit={TypeSubmit}
      />
      <JobDocuments onChange={jobDocumentsData} TypeSubmit={TypeSubmit} initialData={initialData?.job_plan?.job_documents} />
    </div>
  );
};

export default React.memo(Operasional);
