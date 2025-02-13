import React, { useImperativeHandle, forwardRef } from "react";
import GridLayout from "../../Layout/GridLayout";
import WRMUpdates from "../FormHandling/WRMUpdates";
import WRMUissues from "../FormHandling/WRMUissues";
import { GridItem, Flex } from "@chakra-ui/react";
import { useLocation } from "react-router-dom";

const WRMRequirement = forwardRef(({ job_id }, ref) => {
  const location = useLocation();
  const { job_actual } = location.state || {};

  // 

  // useImperativeHandle(ref, () => ({
  //   handleSubmit: () => {
  //     alert("Submit button clicked");
  //   }
  // }));

  return (

        <WRMUpdates job_actual={job_actual} reference={ref} />
     
  );
});

WRMRequirement.displayName = "WRMRequirement";
export default WRMRequirement;
