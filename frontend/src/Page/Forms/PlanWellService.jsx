import React, { useState } from "react";
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
  useToast,
  Select,
} from "@chakra-ui/react";
import Operasional from "./Workover/Operasioal";
import TeknisForm from "./WellService/TeknisForms"; // Sesuaikan path sesuai dengan struktur folder Anda
import { PostWellService } from "../API/PostKkks"; // Sesuaikan path sesuai dengan struktur folder Anda
import { useJobContext } from "../../Context/JobContext";
import { useNavigate } from "react-router-dom";
import BreadcrumbCard from "../Components/Card/Breadcrumb";
import { validatePlanningWo } from "./Planning/Utils/ValidatePlanningWoWS";

const PlanWellServiceForm = () => {
  const {state,dispatch}= useJobContext();
  const [jobPlan, setJobPlan] = useState({
    area_id: "string",
    field_id: "string",
    contract_type: "COST-RECOVERY",
    afe_number: "string",
    wpb_year: 0,
    job_plan: {
      start_date: "2024-09-18",
      end_date: "2024-09-18",
      total_budget: 0,
      job_operation_days: [],
      work_breakdown_structure: [],
      job_hazards: [],
      job_documents: [],
      equipment: "string",
      equipment_specifications: "string",
      well_id: "string",
      job_category: "Acid Fracturing",
      job_description: "string",
      onstream_oil: 0,
      onstream_gas: 0,
      onstream_water_cut: 0,
      target_oil: 0,
      target_gas: 0,
      target_water_cut: 0,
    },
  });

  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const validateForm = (formData, parentKey = "") => {
    let errors = {};
    const navigate = useNavigate();

    Object.entries(formData).forEach(([key, value]) => {
      const fullKey = parentKey ? `${parentKey}.${key}` : key;

      if (value && typeof value === "object" && !Array.isArray(value)) {
        errors = { ...errors, ...validateForm(value, fullKey) };
      } else if (Array.isArray(value) && value.length === 0) {
        errors[fullKey] = `${fullKey.replace(/_/g, " ")} cannot be empty.`;
      } else if (!value || (typeof value === "string" && value.trim() === "")) {
        errors[fullKey] = `${fullKey.replace(/_/g, " ")} is required.`;
      }
    });

    return errors;
  };
  const initialStateData = state.jobPlanExpDev

  
  const PostDatanya = async () => {

    setLoading(true);
    try {
      if(validatePlanningWo(initialStateData)){
        throw {
          status: 422,
          message: "Field Required",
          errormessage : validatePlanningWo(initialStateData).errormessage
        }
      };
      const response = await PostWellService(initialStateData);

      if (response) {
        toast({
          title: "Data berhasil dikirim.",
          description: "Data telah berhasil disimpan ke database.",
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
      console.error("Error Dalam Kirim Data", error);
      if(error.status === 500){
        toast({
          title: "Terjadi kesalahan.",
          description: "Internal Server Error",
          status: "error",
          duration: 2000,
          isClosable: true,
        })
      }
     if(error.status === 422){
      toast({
        title: "Field Required",
        description: "Harap Periksa Kembali ",
        status: "warning",
        duration: 2000,
        isClosable: true,
      });
      setFormErrors(error.errormessage);
     }
    } finally {
      setLoading(false);
    }
  };

  const handleChangeJobPlan = (name) => (newData) => {
    setJobPlan((prevJobPlan) => ({
      ...prevJobPlan,
      job_plan: {
        ...prevJobPlan.job_plan,
        [name]: newData,
      },
    }));
  };


  return (
    <Flex flexDirection={"column"} gap={6} mt={5} fontFamily={"Mulish"}>
      <Flex justify={"space-between"}>
        <Heading>Planning Well Service</Heading>
        <Select width={"auto"} fontSize={"xl"}>
          <option value="METRICS">METRICS</option>
          <option value="Imperial">Imperial</option>
        </Select>
      </Flex>
      <BreadcrumbCard />
      <Box borderRadius="lg">
        <Tabs variant={"soft-rounded"}>
          <TabList>
            <Tab>Teknis</Tab>
            <Tab>Operasional</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <TeknisForm
                formErrors={formErrors}
                dataExistingWell={(e) =>
                  setJobPlan((prev) => ({
                    ...prev,
                    job_plan: {
                      ...prev.job_plan,
                      ...e,
                    },
                  }))
                }
              />
            </TabPanel>
            <TabPanel>
              <Operasional
                formErrors={formErrors}
                initialData={jobPlan}
                handleChangeJobPlan={(e) =>
                  setJobPlan((prev) => ({
                    ...prev,
                    job_plan: {
                      ...prev.job_plan,
                      ...e,
                    },
                  }))
                }
                WRMBoolean={(e) => {
                  setJobPlan((prev) => ({
                    ...prev,
                    job_plan: {
                      ...prev.job_plan,
                      ...e,
                    },
                  }));
                }}
                TypeOperasionalJob={"WELLSERVICE"}
                onData={(e) =>
                  setJobPlan((prevData) => ({
                    ...prevData,
                    ...e,
                  }))
                }
                jobPlanData={(e) =>
                  setJobPlan((prev) => ({
                    ...prev,
                    ...e,
                  }))
                }
                // dataWRM = {handleChangeJobPlan('wrm')}
                WBSValue={(e) =>
                  setJobPlan((prev) => ({
                    ...prev,
                    job_plan: {
                      ...prev.job_plan,
                      work_breakdown_structure: {
                        ...prev.job_plan.work_breakdown_structure,
                        ...e,
                      },
                    },
                  }))
                }
                jobOperationData={handleChangeJobPlan("job_operation_days")}
                jobHazardData={handleChangeJobPlan("job_hazards")}
                jobDocumentsData={handleChangeJobPlan("job_documents")}
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
          onClick={PostDatanya}
        >
          Save
        </Button>
      </Flex>
    </Flex>
  );
};

export default PlanWellServiceForm;
