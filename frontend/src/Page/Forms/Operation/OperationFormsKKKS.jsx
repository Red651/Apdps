import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import {
  Box,
  Flex,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Alert,
  AlertIcon,
  AlertTitle,
  CloseButton,
  useToast,
} from "@chakra-ui/react";
import { useParams } from "react-router-dom"; // Removed useLocation
import { getViewRawPlanning } from "../../API/APIKKKS";
import { useJobContext } from "../../../Context/JobContext";
import {
  ADD_JOB_EXP_DEV,
  ADD_JOB_EXP_DEV_JOB_PLAN,
  UPDATE_OPERATION_DATA,
} from "../../../Reducer/reducer";
import BreadcrumbCard from "../../Components/Card/Breadcrumb";

// Lazy load all components
const OperationalParent = lazy(() => import("./FormParent.jsx/Operational"));
const Technical = lazy(() => import("./FormParent.jsx/Technical"));
const DailyReport = lazy(() => import("./FormParent.jsx/DailyReport"));
const FinishOperation = lazy(() => import("./FormParent.jsx/FinishOperation"));
const TechnicalWOWS = lazy(() => import("./FormParent.jsx/TechnicalWOWS"));

const OperationFormsKKKS = ({ job_type }) => {
  const { job_id } = useParams();
  // const location = useLocation(); // Removed unused variable
  const { state, dispatch } = useJobContext();
  const [tabsIndex, setTabsIndex] = useState(0);
  const [showAlert, setShowAlert] = useState(false);
  const toast = useToast();
  const [wellName, setWellName] = useState(null);
  const wellNameBefore = state?.initialOperationData?.actual_job?.well?.well_name || "";

  useEffect(() => {
    if (job_id) {
      const getViewRawPlannings = async () => {
        try {
          const data = await getViewRawPlanning(job_id);
          const updatedData = checkAndNullifyEmptyArrays(data.data); // Process data
          //  
          dispatch({
            type: UPDATE_OPERATION_DATA,
            payload: updatedData || [],
          });
        } catch (error) {
          if (error.response && error.response.status === 429) {
            setShowAlert(true);
            toast({
              title: "Error",
              description: "To many request",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          } else {
            console.error("Error fetching data:", error);
          }
        }
      };
      getViewRawPlannings();
    }
  }, [job_id, dispatch]);

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

  const handleChangeJob = useCallback(
    (data) => {
      dispatch({
        type: ADD_JOB_EXP_DEV,
        payload: data,
      });
    },
    [dispatch],
  );

  const handleChangeJobPlan = useCallback(
    (data) => {
      dispatch({
        type: ADD_JOB_EXP_DEV_JOB_PLAN,
        payload: data,
      });
    },
    [dispatch],
  );

  const handleWellNameChange = (wellName) => {
    
    setWellName(wellName);
    // Anda bisa menyimpan nilai ini di state atau melakukan apa saja dengan nilai tersebut
  };

  const renderTabContent = useMemo(() => {
    return (
      <TabPanels>
        <TabPanel>
          <Suspense fallback={<p>Loading...</p>}>
            {state.updatedOperationData ? (
              <OperationalParent jobType={job_type} />
            ) : (
              <p>Loading...</p>
            )}
          </Suspense>
        </TabPanel>

        <TabPanel>
          <Suspense fallback={<p>Loading...</p>}>
            {state.updatedOperationData ? (
              job_type === "workover" || job_type === "wellservice" ? (
                <TechnicalWOWS jobType={job_type} onWellNameChange={handleWellNameChange} />
              ) : (
                <Technical jobType={job_type} />
              )
            ) : (
              <p>Loading...</p>
            )}
          </Suspense>
        </TabPanel>

        <TabPanel>
          <Suspense fallback={<p>Loading...</p>}>
            <DailyReport job_id={job_id} />
          </Suspense>
        </TabPanel>
        <TabPanel>
          <Suspense fallback={<p>Loading...</p>}>
            <FinishOperation />
          </Suspense>
        </TabPanel>
      </TabPanels>
    );
  }, [state.updatedOperationData, job_id, job_type]);

  return (
    <Flex gap={6} mt={6} direction={"column"} fontFamily={"Mulish"}>
      <Flex>
        <Heading fontFamily={"Mulish"}>Update {(wellName || wellNameBefore).charAt(0).toUpperCase() + (wellName || wellNameBefore).slice(1).toLowerCase()}</Heading>
      </Flex>

      <BreadcrumbCard wellName={wellName || wellNameBefore} disabledSegments={["update"]} />

      {showAlert && (
        <Alert
          status="error"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          bg="red.500"
          color="white"
          borderRadius="lg"
          p={3}
          mt={5}
          mb={5}
          boxShadow="lg"
        >
          <AlertIcon />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            Error
          </AlertTitle>
          <Text fontSize="md" mb={4}>
            To many request
          </Text>
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={() => setShowAlert(false)}
          />
        </Alert>
      )}

      <Box mt={4} fontFamily={"Mulish"}>
        <Tabs
          onChange={(index) => {
            if (index === 3) {
              // Logic to rerender tab content when 'Finish Operation' tab is selected
              setTabsIndex(index);
              setTabsIndex((prev) => prev); // Trigger rerender
            } else {
              setTabsIndex(index);
            }
          }}
          index={tabsIndex}
          variant={"soft-rounded"}
        >
          <TabList>
            <Tab>Project Management</Tab>
            <Tab>Technical</Tab>
            <Tab>Daily Operation Report</Tab>
            <Tab>Finish Operation</Tab>
          </TabList>
          {renderTabContent}
        </Tabs>
      </Box>
    </Flex>
  );
};

export default OperationFormsKKKS;

