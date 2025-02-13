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
import { GetOperasionalExploration, PutOperasionalExp } from "../API/APISKK";

import { useNavigate, useParams } from "react-router-dom";

const PengajuanDrillingForm = () => {
  const [jobPlan, setJobPlan] = useState({});
  const { job_id } = useParams();
  const navigate = useNavigate();
  const [msgError, setMsgError] = useState({});
  const job = jobPlan?.data;
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await GetOperasionalExploration(job_id);
        setJobPlan(response.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, [job_id]);

  //   }, [job_id]);
  const [dataMetricImperial, setDataMetricImperial] = React.useState("METRICS");
  const metricImperialChange = (e) => {
    setJobPlan((prevJobPlan) => ({
      ...prevJobPlan,
      job_plan: {
        ...prevJobPlan.job_plan,
        job_operation_days: {
          ...prevJobPlan.job_plan.job_operation_days,
          unit_type: e.target.value,
        },
        well_plan: {
          ...prevJobPlan.job_plan.well_plan,
          unit_type: e.target.value,
        },
      },
    }));

    setDataMetricImperial(e.target.value);
  };

  const handleWellDataChange = (wellData) => {
    setJobPlan((prevJobPlan) => ({
      ...prevJobPlan,
      job_plan: {
        ...prevJobPlan.job_plan,
        well: {
          ...wellData,
        },
      },
    }));
  };

  const handleJobDocuments = (jobDocuments) => {
    setJobPlan((prevJobPlan) => ({
      ...prevJobPlan,
      job_plan: {
        ...prevJobPlan.job_plan,
        job_documents: jobDocuments,
      },
    }));
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
    const errors = validateForm(jobPlan);
    setFormErrors(errors);

    setLoading(true);
    try {
      const post = await PutOperasionalExp(jobPlan);

      // Cek apakah data respons benar dan status sukses
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
        }, 3000);
        // Reset form atau lakukan tindakan lain jika berhasil
        // resetForm(); // Contoh reset form jika diperlukan
      }
    } catch (error) {
      // Menangani error dari server atau dari permintaan
      console.error("Error dalam pengiriman:", error.data.detail);
      toast({
        title: "Terjadi kesalahan.",
        description: "Data gagal dikirim ke server.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      const errorFields = {};
      error.data.detail.forEach((message) => {
        const errorValue = message.loc?.at(-1) ?? message.loc;
        errorFields[errorValue] = message.msg;
        // console.error(errorValue, message.msg)
      });
      
      setMsgError(errorFields);
    } finally {
      setLoading(false); // Menghentikan loading state
    }
  };


  return (
    <>
      <Flex
        justify={"flex-start"}
        mr={5}
        my={5}
        gap={5}
        justifyContent={"space-between"}
      >
        <Heading>New Exploration Well</Heading>
        <Select width={"auto"} fontSize={"xl"} onChange={metricImperialChange}>
          <option value="METRICS">METRICS</option>
          <option value="Imperial">Imperial</option>
        </Select>
      </Flex>
      <Box borderRadius="lg">
        <Tabs variant={"soft-rounded"}>
          <TabList>
            <Tab>Teknis</Tab>
            <Tab>Operasional</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <CardFormWell
                initialData={jobPlan}
                onFormChange={handleWellDataChange}
                unitType={dataMetricImperial}
                errorForms={formErrors}
                wellType={["DELINEATION", "WILDCAT"]}
                area_id={jobPlan.area_id}
              />
            </TabPanel>
            <TabPanel>
              <Operasional
                errorForms={formErrors}
                onData={(operasional) => {
                  setJobPlan((prevJobPlan) => ({
                    ...prevJobPlan,
                    ...operasional,
                  }));
                }}
                handleChangeRigType={useCallback((e) => {
                  setJobPlan((prevJobPlan) => ({
                    ...prevJobPlan,
                    job_plan: {
                      ...prevJobPlan.job_plan,
                      ...e,
                    },
                  }));
                })}
                dataWRM={(data) => {
                  setJobPlan((prevJobPlan) => ({
                    ...prevJobPlan,
                    job_plan: {
                      ...prevJobPlan.job_plan,
                      ...data,
                    },
                  }));
                }}
                handleChangeJobPlan={useCallback((e) => {
                  setJobPlan((prevJobPlan) => ({
                    ...prevJobPlan,
                    job_plan: {
                      ...prevJobPlan.job_plan,
                      ...e,
                    },
                  }));
                })}
                jobDocuments={handleJobDocuments}
                WBSData={(data) => {
                  setJobPlan((prevJobPlan) => ({
                    ...prevJobPlan,
                    job_plan: {
                      ...prevJobPlan.job_plan,
                      work_breakdown_structure: {
                        ...prevJobPlan.job_plan.work_breakdown_structure,
                        ...data,
                      },
                    },
                  }));
                }}
                EventWRM={(e) => {
                  setJobPlan((prevJobPlan) => ({
                    ...prevJobPlan,
                    job_plan: {
                      ...prevJobPlan.job_plan,
                      work_breakdown_structure: {
                        ...prevJobPlan.job_plan.work_breakdown_structure,
                        events: e,
                      },
                    },
                  }));
                }}
                JobOperationData={(data) => {
                  setJobPlan((prevJobPlan) => ({
                    ...prevJobPlan,
                    job_plan: {
                      ...prevJobPlan.job_plan,
                      job_operation_days: data,
                    },
                  }));
                }}
                HazardTypeData={(data) => {
                  setJobPlan((prevJobPlan) => ({
                    ...prevJobPlan,
                    job_plan: {
                      ...prevJobPlan.job_plan,
                      job_hazards: [...data],
                    },
                  }));
                }}
                unitType={dataMetricImperial}
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
    </>
  );
};

export default PengajuanDrillingForm;
