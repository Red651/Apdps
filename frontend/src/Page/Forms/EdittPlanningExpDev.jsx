import {
  Box,
  Button,
  Flex,
  Heading,
  Select,
  Skeleton,
  SkeletonText,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  useToast,
} from "@chakra-ui/react";
import React from "react";
// import { Select } from "react-day-picker";
import OperasionalA from "./Exploration/Operasioal";
import OperasionalB from "./Workover/Operasioal";

import CardFormWell from "./Exploration/TeknisForms";
import { useJobContext } from "../../Context/JobContext";
import {
  redirect,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import TeknisForm from "./WellService/TeknisForms";
import { GetDataJobPlanning } from "../API/APIKKKS";
import { ADD_JOB_EXP_DEV, GET_DATA_JOB_EXP_DEV } from "../../Reducer/reducer";
import { UpdateDataPlanning } from "../API/PostKkks";
import ExistingWell from "./Planning/ExistingWell";
import { useQuery } from "@tanstack/react-query";
import BreadcrumbCard from "../Components/Card/Breadcrumb";
import { ValidateFormJobPlanning } from "../Components/utils/ValidateForm";
import {
  validationPostPutDevPlanning,
  validationPostPutPlanning,
} from "./Planning/Utils/ValidationPlanning";
import { validatePlanningWo } from "./Planning/Utils/ValidatePlanningWoWS";

const EdittPlanningExpDev = () => {
  const { state, dispatch } = useJobContext();
  const { job_type, job_id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const location = useLocation();
  const job_phase = location.state?.job_phase;
  const [isSuccess, setIsSuccess] = React.useState(false);
  const formData = state.jobPlanExpDev;
  const [isLoading, setIsLoading] = React.useState(false);
  const [formErrors, setFormErrors] = React.useState({});

  const {
    data: initialData,
    isLoading: loadingData,
    error: errorData,
    isSuccess: successData,
  } = useQuery({
    queryKey: ["jobPlanExpDev"],
    queryFn: () => GetDataJobPlanning(job_id).then((res) => res.data.data),
  });

  //  
  //  
  

  const handleSave = async () => {
    setIsLoading(true);
    const validateType =
      job_phase === "update-exploration"
        ? validationPostPutPlanning(formData)
        : job_phase === "update-development"
        ? validationPostPutDevPlanning(formData)
        : job_phase === "update-workover"
        ? validatePlanningWo(formData) : 
        job_phase === "update-wellservice" ? 
        validatePlanningWo(formData) : false;

        //  
    try {
      if (validateType) {
        throw {
          response: {
            status: 422,
            message: "Entity Required",
            errormessage: validateType.errormessage,
          },
        };
      }
      const res = await UpdateDataPlanning(job_id, formData, job_phase);
      if (res.status === 200) {
        toast({
          title: "Success",
          description: "Data Berhasil Di Update",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        setTimeout(() => {
          window.location.reload();
          navigate(-1);
        }, 1000);
      }
    } catch (error) {
      console.error(error.response.errormessage);

      if (error.response.status === 422) {
        toast({
          title: "Error",
          description: "Harap Periksa Kembali Fieldnya",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
        setFormErrors(error.response.errormessage);
      }
      if (error.response.status === 500) {
        toast({
          title: "Error",
          description: "Internal Server Error",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  let wellType;
  if (job_type === "development") {
    wellType = ["INJECTION", "PRODUCER", "INFILL", "STEPOUT"];
  } else if (job_type === "exploration") {
    wellType = ["DELINEATION", "WILDCAT"];
  } else {
    wellType = [];
  }

  const checkAndNullifyEmptyArrays = (data) => {
    if (Array.isArray(data) && data.length === 0) {
      return null;
    }

    if (typeof data === "object" && data !== null) {
      for (const key in data) {
        data[key] = checkAndNullifyEmptyArrays(data[key]);
      }
    }

    return data;
  };

  // React.useEffect(() => {
  //   const fetchJobPlan = async () => {
  //     try {
  //       const response = await GetDataJobPlanning(job_id);
  //       setIsSuccess(true);
  //        
  //       return response; // Set success after data is fetched
  //     } catch (error) {
  //       console.error(error);
  //     }
  //   };
  //   fetchJobPlan();
  // }, [job_id]); // Trigger when job_id or dispatch changes
  const jobPlanValue = state.jobPlanExpDev;
  const [dataMetricImperial, setDataMetricImperial] = React.useState("METRICS");
  const metricImperialChange = (e) => {
    setDataMetricImperial(e.target.value);
  };
  //  
  if (loadingData) {
    return (
      <Box>
        <SkeletonText
          mt={4}
          noOfLines={8}
          spacing={2}
          skeletonHeight={"20px"}
        />
      </Box>
    );
  }
  if (successData) {
    return (
      <Flex direction={"column"} mt={5} gap={6}>
        <Flex justify={"flex-start"} justifyContent={"space-between"}>
          <Heading fontFamily={"Mulish"}>Edit Planning</Heading>

          <Select
            width={"auto"}
            fontSize={"xl"}
            onChange={metricImperialChange}
          >
            <option value="METRICS">METRICS</option>
            <option value="Imperial">Imperial</option>
          </Select>
        </Flex>
        <BreadcrumbCard
          wellName={state?.jobPlanExpDev?.job_plan?.well?.well_name}
        />

        <Box borderRadius="lg">
          <Tabs variant={"soft-rounded"}>
            <TabList>
              <Tab>Project Management </Tab>
              <Tab>Technical</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                {(job_type === "exploration" || job_type === "development") && (
                  <OperasionalA
                    unitType={dataMetricImperial}
                    TypeOperational={job_type}
                    initialData={initialData}
                    errorForms={formErrors}
                    TypeSubmit="update"
                  />
                )}
                {(job_type === "workover" || job_type === "wellservice") && (
                  <OperasionalB
                    TypeOperasionalJob={
                      job_type === "workover" ? "WORKOVER" : "WELLSERVICE"
                    }
                    initialData={initialData}
                    formErrors={formErrors}
                    onData={(e) => console.log(e)}
                    unitType={dataMetricImperial}
                    TypeSubmit="update"
                  />
                )}
              </TabPanel>
              <TabPanel>
                {(job_type === "exploration" || job_type === "development") && (
                  <CardFormWell
                    unitType={dataMetricImperial}
                    wellType={wellType}
                    errorForms={formErrors}
                    initialData={initialData}
                    TypeOperasional={job_type}
                    TypeSubmit="update"
                  />
                )}
                {(job_type === "workover" || job_type === "wellservice") && (
                  <ExistingWell initialData={initialData?.job_plan} TypeSubmit="update" formErrors={formErrors} />
                )}
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Box>
        <Flex mt={4}>
          <Button
            colorScheme="blue"
            onClick={handleSave}
            isLoading={isLoading}
            w={"100%"}
          >
            Save
          </Button>
        </Flex>
      </Flex>
    );
  }
};

export default EdittPlanningExpDev;
