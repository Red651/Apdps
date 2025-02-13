import React, { useCallback, useEffect, useState } from "react";
import CardFormWell from "./Exploration/TeknisForms";
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Box,
  Button,
  Heading,
  Flex,
  Select,
  useToast,
} from "@chakra-ui/react";
import Operasional from "./Exploration/Operasioal";
import { PostPlanningDevelopment } from "../API/APISKK";
import { useJobContext } from "../../Context/JobContext";
import {
  ADD_JOB_EXP_DEV,
  ADD_JOB_EXP_DEV_JOB_PLAN,
  ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
} from "../../Reducer/reducer";
import { useNavigate } from "react-router-dom";
import BreadcrumbCard from "../Components/Card/Breadcrumb";
import { validationPostPutDevPlanning } from "./Planning/Utils/ValidationPlanning";

const PlanDevelopmentForm = () => {
  const { state, dispatch } = useJobContext();
  const navigate = useNavigate();
  const jobPlan = state.jobPlanExpDev;


  const [dataMetricImperial, setDataMetricImperial] = useState("METRICS");
  const metricImperialChange = (e) => {
    // setJobPlan((prevJobPlan) => ({
    //   ...prevJobPlan,
    //   job_plan: {
    //     ...prevJobPlan.job_plan,
    //     job_operation_days: {
    //       ...prevJobPlan.job_plan.job_operation_days,
    //       unit_type: e.target.value,
    //     },
    //     well_plan: {
    //       ...prevJobPlan.job_plan.well_plan,
    //       unit_type: e.target.value,
    //     },
    //   },
    // }));

    setDataMetricImperial(e.target.value);
  };

  // const handleWellDataChange = (wellData) => {
  //   setJobPlan((prevJobPlan) => ({
  //     ...prevJobPlan,
  //     job_plan: {
  //       ...prevJobPlan.job_plan,
  //       well: {
  //         ...wellData,
  //       },
  //     },
  //   }));
  // };
  const handleChangeJob = (data) => {
    dispatch({
      type: ADD_JOB_EXP_DEV,
      payload: data,
    });
  };

  const handleChangeJobPlan = (data) => {
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN,
      payload: data,
    });
  };

  const handleWellDataChange = (data) => {
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: data,
    });
  };
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const toast = useToast();

  const validateForm = (formData, parentKey = "") => {
    let errors = {};

    // Iterasi melalui setiap key dalam formData
    Object.entries(formData).forEach(([key, value]) => {
      // Tentukan nama lengkap key termasuk parent jika ada (dot notation)
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      // Jika value adalah object dan bukan array, lakukan rekursi
      if (value && typeof value === "object" && !Array.isArray(value)) {
        errors = { ...errors, ...validateForm(value, fullKey) };
      } else if (Array.isArray(value) && value.length === 0) {
        // Jika value adalah array kosong, tambahkan pesan error
        errors[fullKey] = `${fullKey.replace(/_/g, " ")} cannot be empty.`;
      } else if (!value || (typeof value === "string" && value.trim() === "")) {
        // Tambahkan pesan error jika value kosong atau string kosong
        errors[fullKey] = `${fullKey.replace(/_/g, " ")} is required.`;
      }
    });

    return errors;
  };
  const onClickSubmitForm = async () => {
    setLoading(true);
    const validateResult = validationPostPutDevPlanning(jobPlan);
    try {
      if(validateResult){
        // console.error(validateResult);
        throw{
          status: 422,
          message: "Entity Required",
          errormessage: validateResult.errormessage
        }
      }
      const post = await PostPlanningDevelopment(jobPlan, toast);
      if (post) {
        setLoading(false);
        setTimeout(() => {
          window.location.reload();
          navigate(-1);
        }, 1000);
        return post.data;
      }
    } catch (error) {
      // console.error(error);
      if (error.status === 422) {
        toast({
          title: "Terjadi kesalahan.",
          description: "Harap Periksa Kembali",
          status: "warning",
          duration: 2000,
          isClosable: true,
        });
        //  
        setFormErrors(error.errormessage);
      }
      if (error.status === 500) {
        toast({
          title: "Terjadi kesalahan.",
          description: "Internal Server Error",
          status: "error",
          duration: 2000,
          isClosable: true,
        });
      }
      // const errorFields = {};
      // error.data.detail.forEach((message) => {
      //   const errorValue = message.loc?.at(-1) ?? message.loc;
      //   errorFields[errorValue] = message.msg;
      //   // console.error(errorValue, message.msg)
      // });
    } finally {
      setLoading(false);
    }
  };

  const typeWell = ["INJECTION", "PRODUCER", "INFILL", "STEPOUT"];
  return (
    <Flex direction={"column"} gap={6}>
      <Flex
        justify={"flex-start"}
        mt={5}
        gap={6}
        justifyContent={"space-between"}
        fontFamily={"Mulish"}
      >
        <Heading fontFamily={"Mulish"}>New Development Well</Heading>
        <Select width={"auto"} fontSize={"xl"} onChange={metricImperialChange}>
          <option value="METRICS">METRICS</option>
          <option value="Imperial">Imperial</option>
        </Select>
      </Flex>

      <BreadcrumbCard />

      <Box borderRadius="lg">
        <Tabs variant={"soft-rounded"} fontFamily={"Mulish"}>
          <TabList>
            <Tab>Project Management</Tab>
            <Tab>Technical</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Operasional
                errorForms={formErrors}
                unitType={dataMetricImperial}
                handleChangeJobPlan={(data) => handleChangeJobPlan(data)}
                // handleChangeJob={(data) => handleChangeJob(data)}
                handleChangeJob={(e) => handleChangeJob(e)}
                TypeOperational={"development"}
              />
            </TabPanel>
            <TabPanel>
              <CardFormWell
                onFormChange={handleWellDataChange}
                unitType={dataMetricImperial}
                errorForms={formErrors}
                wellType={typeWell}
                TypeOperasional={"development"}
                // area_id={jobPlan.area_id}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
      <Flex mt={4}>
        <Button
          colorScheme="blue"
          w={"100%"}
          isLoading={loading}
          onClick={onClickSubmitForm}
        >
          Save
        </Button>
      </Flex>
    </Flex>
  );
};

export default PlanDevelopmentForm;
