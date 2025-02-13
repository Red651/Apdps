import {
  Box,
  Button,
  Flex,
  //   Grid,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import React from "react";

import WRMRequirement from "./FormParent.jsx/WRMRequirement";
import ConfirmOperational from "./FormParent.jsx/ConfirmOperation";
import { useParams, useLocation } from "react-router-dom";
import WRMUissues from "./FormHandling/WRMUissues";
import { useJobContext } from "../../../Context/JobContext";
import { validationOperate } from "./FormHandling/Utils/ValidationOperate";
import BreadcrumbCard from "../../Components/Card/Breadcrumb";
import WRMUpdates from "./FormHandling/WRMUpdates";

const OperationFormsKKKS = () => {
  const { job_id, job_type } = useParams();
   
  const location = useLocation();
  const { type_job } = location.state || {};
  const [tabsIndex, setTabsIndex] = React.useState(0);
  const wrmRef = React.useRef();
  const technicalRef = React.useRef();
  const operationalRef = React.useRef();
  const dailyRef = React.useRef();
  const { state, dispatch } = useJobContext();
  const wrmData = state?.wrmValues;
   
  const [isValid, setIsValid] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const { job_actual } = location.state || {};
  React.useEffect(() => {
    const validation = () => {
      const result = validationOperate(wrmData);
      setIsValid(result?.permission);
      setMessage(result?.msg);
      return result;
    };
    validation();
  }, [wrmData]);

  const handleUpdate = () => {
    switch (tabsIndex) {
      case 0:
        wrmRef.current.handleSubmit();
        break;
      case 1:
        operationalRef.current.handleSave();
        break;
      case 2:
        technicalRef.current.handleSave();
        break;
      case 3:
        dailyRef.current.postData();
        break;
      default:
        break;
    }
  };

  return (
    <Flex direction={"column"} gap={6} mt={6}>
        <Heading fontFamily={"Mulish"}>WRM</Heading>
      <BreadcrumbCard wellName={state?.wrmValues?.header?.well_name} uppercaseSegments={["wrm"]} disabledSegments={["wrm"]} />
      <Box mt={4} fontFamily={"Mulish"}>
        {}
        <Tabs onChange={(index) => setTabsIndex(index)} index={tabsIndex} variant={"soft-rounded"}>
          <TabList>
            <Tab>Well Readiness Monitoring</Tab>
            <Tab>WRM Issues</Tab>
            <Tab isDisabled={isValid}>Start Operation/Spud</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {/* <WRMRequirement
                ref={wrmRef}
                job_id={job_id}
                // job_actual={job_actual}
              /> */}
              <WRMUpdates job_actual={job_actual} job_id={job_id} reference={wrmRef} job_type={job_type} />
            </TabPanel>
            <TabPanel>
              <WRMUissues job_id={job_id} />
            </TabPanel>
            <TabPanel>
              <ConfirmOperational />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Flex>
  );
};

export default OperationFormsKKKS;
