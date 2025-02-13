// TeknisForm.jsx
import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import ExistingWell from "../Planning/ExistingWell"; // Sesuaikan path sesuai dengan struktur folder Anda
import WellSchematic from "../Operation/FormHandling/WellSchematic";
import { useJobContext } from "../../../Context/JobContext";
import { ADD_JOB_EXP_DEV_JOB_PLAN } from "../../../Reducer/reducer";
import CardUploadTabular from "../Components/CardUploadTabular";

const TeknisForm = ({ formErrors, dataExistingWell }) => {
  const { state, dispatch } = useJobContext();
  const [formData, setFormData] = React.useState({});
  // 
  const handleChange = (data) => {
    // 
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN,
      payload: {
        ...data,
      },
    });
  };
  return (
    <Flex gap={10} direction={"column"}>
      <ExistingWell formErrors={formErrors} dataExistingWell={handleChange} />
      <CardUploadTabular
        title="Well Schematic"
        subtitle="Schematic"
        
        OnChangeData={(e) =>
          dispatch({
            type: ADD_JOB_EXP_DEV_JOB_PLAN,
            payload: {
              ...formData,
              well_schematic: e,
            },
          })
        }
      />
      {/* <WellSchematic onDataChange={handleChange} /> */}
    </Flex>
  );
};

export default TeknisForm;
