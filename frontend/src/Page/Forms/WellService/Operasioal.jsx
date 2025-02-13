import React, { useEffect, useState, useCallback } from "react";
import ProposedJob from "../Planning/OperasionalID";
import WRMRequirement from "../Planning/WRMRequirement";
import JobOpertionsDays from "../Planning/JobOperationDays";

import WorkBreakDownStructure from "../Planning/BorkBreakDowns";
import HazardType from "../Planning/HazardType";
import JobDocuments from "../Planning/JobDocuments";

const Operasional = ({
  onData = (e) => {
    return e;
  },
  dataWRM = (e) => {
    return e;
  },
  jobOperationData,
  jobPlanData,
  TypeOperasionalJob,
  WBSdata,
  HazardTypeData,
  jobDocumentsData,
  formErrors,
}) => {
  const [data, setData] = useState({});
  const [datas, setDatas] = useState({});
  // 

  useEffect(() => {
    // Menggabungkan data baru dengan data sebelumnya dari parent
    onData(data);

    dataWRM(datas);
  }, [data, datas]);

  // 

  const handleData = (newData) => {
    setData((prevData) => ({ ...prevData, ...newData }));
  };

  const datawrm = useCallback(
    (newData) => {
      setDatas((prevData) => ({ ...prevData, ...newData }));
    },
    [setDatas]
  );

  return (
    <div>
      <ProposedJob
        errorForms={formErrors}
        onData={handleData}
        handleChangeJobPlan={jobPlanData}
        TypeOperasional={TypeOperasionalJob}
      />
      <WRMRequirement datawrm={datawrm} onDataChange={handleData} />
      <WorkBreakDownStructure ondata={WBSdata} />
      <JobOpertionsDays ondata={jobOperationData} />
      <HazardType onDataChange={HazardTypeData} />
      <JobDocuments data={jobDocumentsData} />
    </div>
  );
};

export default Operasional;
