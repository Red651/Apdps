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
// import axios from "axios";

import { PostPlanningExploration } from "../API/APISKK";
import { useNavigate, useParams } from "react-router-dom";
import { useJobContext } from "../../Context/JobContext";
import {
  ADD_JOB_EXP_DEV,
  ADD_JOB_EXP_DEV_JOB_PLAN,
  ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
  RESET_JOB_PLAN_EXP_DEV,
  RESET_STATE,
} from "../../Reducer/reducer";
import { resetState } from "../Components/utils/resetState";
import BreadcrumbCard from "../Components/Card/Breadcrumb";
import { validationPostPutPlanning } from "./Planning/Utils/ValidationPlanning";

const PengajuanDrillingForm = () => {
  const { state, dispatch } = useJobContext();
   
  const navigate = useNavigate();
  const { job_id } = useParams();

  const jobPlan = state.jobPlanExpDev;

  React.useEffect(() => {
    dispatch({
      type: RESET_STATE,
    });
  }, []);

  const [dataMetricImperial, setDataMetricImperial] = React.useState("METRICS");

  React.useEffect(() => {
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN,
      payload: {
        unit_type: dataMetricImperial,
      },
    });
    dispatch({
      type: ADD_JOB_EXP_DEV_JOB_PLAN_WELL,
      payload: {
        unit_type: dataMetricImperial,
      },
    });
  }, [dataMetricImperial]);

   
  const metricImperialChange = (e) => {
    setDataMetricImperial(e.target.value);
  };

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Fungsi rekursif untuk memvalidasi form secara otomatis
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
    const validatonResult = validationPostPutPlanning(jobPlan);

    try {
      if (validatonResult) {
        throw {
          status: 422,
          message: "validation error",
          error: validatonResult.errormessage,
        };
      }

      const post = await PostPlanningExploration(jobPlan);
      if (post.status === 200) {
        toast({
          title: "Berhasil!",
          description: "Data berhasil dikirim ke server.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setTimeout(() => {
          window.location.reload();
          navigate(-1);
        }, 1000);
      }
    } catch (error) {
     

      //  
      if (error.status === 422) {
        toast({
          title: "Terjadi kesalahan.",
          description: "Harap Periksa Kembali",
          status: "warning",
          duration: 2000,
          isClosable: true,
        });
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
      // });
      setFormErrors(error.error);
      // setMsgError(errorFields);
    } finally {
      setLoading(false); // Menghentikan loading state
    }
  };

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

  return (
    <Flex direction={"column"} gap={6}>
      <Flex
        justify={"flex-start"}
        mt={5}
        gap={6}
        justifyContent={"space-between"}
        fontFamily={"Mulish"}
      >
        <Heading fontFamily={"Mulish"}>New Exploration Well</Heading>
        <Select
          width={"auto"}
          fontSize={"xl"}
          value={dataMetricImperial}
          placeholder="Select Unit"
          onChange={metricImperialChange}
        >
          <option value="METRICS">METRICS</option>
          <option value="IMPERIAL">Imperial</option>
        </Select>
      </Flex>

      <BreadcrumbCard />

      <Box borderRadius="lg">
        <Tabs variant={"soft-rounded"}>
          <TabList>
            <Tab>Project Management </Tab>
            <Tab>Technical</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <Operasional
                errorForms={formErrors}
                unitType={dataMetricImperial}
                handleChangeJobPlan={(data) => handleChangeJobPlan(data)}
                TypeSubmit={"create"}
                handleChangeJob={(e) => handleChangeJob(e)}
                TypeOperational={"exploration"}
              />
            </TabPanel>
            <TabPanel>
              <CardFormWell
                TypeSubmit={"create"}
                onFormChange={handleWellDataChange}
                unitType={dataMetricImperial}
                errorForms={formErrors}
                wellType={["DELINEATION", "WILDCAT"]}
                TypeOperasional={"exploration"}
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

export default PengajuanDrillingForm;
