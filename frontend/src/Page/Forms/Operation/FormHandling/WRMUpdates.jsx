import React, {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import CardFormK3 from "../../Components/CardFormK3";
import GridLayout from "../../Layout/GridLayout";
import { SelectComponent, SelectOption } from "../../Components/SelectOption";
import { IconBrightness } from "@tabler/icons-react";
import {
  patchWRM,
  getWRMData,
  getWRMPPercentValues,
} from "../../../../Page/API/APISKK";
import {
  Button,
  Spinner,
  Center,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Flex,
  Box,
  Grid,
  GridItem,
  VStack,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useLocation, useParams } from "react-router-dom";
import WRMDateInputs from "../FormHandling/WRMDateInputs";
import { useJobContext } from "../../../../Context/JobContext";
import { ADD_WRM_VALUES } from "../../../../Reducer/reducer";
import { useQuery } from "@tanstack/react-query";
import { FetchReusable } from "../../../API/FetchReusable";

const WRMUpdates = forwardRef(({ job_actual }, reference) => {
  const [values, setValues] = useState(null);
  const { state, dispatch } = useJobContext();

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const [percentValue, setPercentValue] = useState(null);

  const [wbsData, setWbsData] = useState({});

  useImperativeHandle(reference, () => ({
    handleSubmit: alert("Submit button clicked"),
  }));

  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();

  const { job_id, typejob, job_type } = useParams();

  const data = useLocation();

   
  const {
    data: rigData,
    isLoading: RigLoading,
    error: RigError,
  } = useQuery({
    queryKey: ["RigData"],
    queryFn: () =>
      FetchReusable(`/rig/all`, "get", {
        headers: {
          "Content-Type": "application/json",
        },
      }).then((res) => res.data),
  });

  const ValueOption = [
    { value: 100, label: "100%" },
    { value: 95, label: "95%" },
    { value: 90, label: "90%" },
    { value: 85, label: "85%" },
    { value: 80, label: "80%" },
    { value: 75, label: "75%" },
    { value: 70, label: "70%" },
    { value: 65, label: "65%" },
    { value: 60, label: "60%" },
    { value: 55, label: "55%" },
    { value: 50, label: "50%" },
    { value: 45, label: "45%" },
    { value: 40, label: "40%" },
    { value: 35, label: "35%" },
    { value: 30, label: "30%" },
    { value: 25, label: "25%" },
    { value: 20, label: "20%" },
    { value: 15, label: "15%" },
    { value: 10, label: "10%" },
    { value: 5, label: "5%" },
    { value: 0, label: "0%" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getWRMData(job_id, typejob);
        //
        if (response) {
          setValues(response?.data);
          setWbsData(response.data.wbs || {});
        } else {
          setValues(null);
        }
      } catch (error) {
        console.error("Error fetching WRM data", error);
        setValues(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [job_id]);

  React.useEffect(() => {
    if (job_id) {
      const fetchData = async () => {
        setLoading(true); // Set status loading menjadi true
        try {
          const response = await getWRMPPercentValues(job_id);
          if (response) {
            setPercentValue(response.data);
            dispatch({
              type: ADD_WRM_VALUES,
              payload: response.data,
            }); // Set data respons ke state
          } else {
            setPercentValue(null); // Jika respons tidak valid, set values ke null
          }
        } catch (error) {
          // console.error("Error fetching WRM data", error);
          setPercentValue(null); // Set nilai default jika error
        } finally {
          setLoading(false); // Selesai loading
        }
      };
      fetchData();
    }
  }, [job_id]);

  // Handle perubahan pada select
  const handleSelectChange = (name) => (e) => {
    const newValue = e.target.value;
    setPercentValue((prevValues) => ({
      ...prevValues,
      [name]: parseInt(newValue),
    }));
  };

  const handleChangeRigId = (name) => (e) => {
    const value = e.target.value;
    setPercentValue((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fungsi untuk submit data ke patch WRM
  const handleSubmit = async () => {
    // if (!job_actual) {
    //   console.error("job_actual is required");
    //   return;
    // }
    const formData = {
      ...percentValue,
      wbs: wbsData, // Pastikan wbsData berisi data tanggal yang valid
    };

    try {
      const response = await patchWRM(job_id, formData, job_type); // Mengirim data state `values` ke patchWRM
      //
      toast({
        title: "WRM Data Updated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      //
      onClose(); // Tutup AlertDialog setelah submit
    } catch (error) {
      console.error("Failed to update data", error);
      toast({
        title: "Failed Update WRM",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      onClose();
    }
  };
  //
  const FIELD_CONFIG = [
    {
      key: "wrm_pembebasan_lahan",
      label: "Pembebasan Lahan",
      placeholder: "Select Pembebasan Lahan",
    },
    {
      key: "wrm_ippkh",
      label: "Izin PPKH",
      placeholder: "Select Izin PPKH",
    },
    {
      key: "wrm_ukl_upl",
      label: "UKL & UPL",
      placeholder: "Select UKL & UPL",
    },
    {
      key: "wrm_amdal",
      label: "AMDAL",
      placeholder: "Select AMDAL",
    },
    {
      key: "wrm_pengadaan_rig",
      label: "Pengadaan Rig",
      placeholder: "Select Pengadaan Rig",
    },
    {
      key: "wrm_pengadaan_drilling_services",
      label: "Pengadaan Drilling Services",
      placeholder: "Select Pengadaan Drilling Services",
    },
    {
      key: "wrm_pengadaan_lli",
      label: "Pengadaan LLI",
      placeholder: "Select Pengadaan LLI",
    },
    {
      key: "wrm_persiapan_lokasi",
      label: "Persiapan Lokasi",
      placeholder: "Select Persiapan Lokasi",
    },
    {
      key: "wrm_internal_kkks",
      label: "Internal KKKS",
      placeholder: "Select Internal KKKS",
    },
    {
      key: "wrm_evaluasi_subsurface",
      label: "Evaluasi Subsurface",
      placeholder: "Select Evaluasi Subsurface",
    },
    {
      key: "wrm_pengadaan_equipment",
      label: "Pengadaan Equipment",
      placeholder: "Select Pengadaan Equipment",
    },
    {
      key: "wrm_pengadaan_services",
      label: "Pengadaan Services",
      placeholder: "Select Pengadaan Services",
    },
    {
      key: "wrm_pengadaan_handak",
      label: "Pengadaan Handak",
      placeholder: "Select Pengadaan Handak",
    },
    {
      key: "wrm_pengadaan_octg",
      label: "Pengadaan OCTG",
      placeholder: "Select Pengadaan OCTG",
    },
    {
      key: "wrm_pengadaan_artificial_lift",
      label: "Pengadaan Artificial Lift",
      placeholder: "Select Pengadaan Artificial Lift",
    },
    {
      key: "wrm_sumur_berproduksi",
      label: "Sumur Berproduksi",
      placeholder: "Select Sumur Berproduksi",
    },
    {
      key: "wrm_fasilitas_produksi",
      label: "Fasilitas Produksi",
      placeholder: "Select Fasilitas Produksi",
    },
    {
      key: "wrm_well_integrity",
      label: "Well Integrity",
      placeholder: "Select Well Integrity",
    },
    {
      key: "wrm_cutting_dumping",
      label: "Cutting & Dumping",
      placeholder: "Select Cutting & Dumping",
    },
  ];

  // Fungsi untuk membuka dialog konfirmasi submit
  const handleOpenSubmitDialog = () => {
    onOpen(); // Membuka AlertDialog
  };

  // Jika sedang loading, tampilkan spinner
  if (loading) {
    return (
      <Center mt={4}>
        <Spinner size="xl" color="blue.500" />
      </Center>
    );
  }

  const someUpdateHandler = (updatedData) => {
    setWbsData((prevData) => ({ ...prevData, ...updatedData }));
  };

  return (
    <Box>
      <Grid templateColumns="1fr 1fr" gap={6} borderRadius="lg">
        {/* Left Side - Form */}
        <GridItem>
          <CardFormK3
            title="WRM Updates"
            icon={IconBrightness}
            subtitle="* Required"
            overflowY="auto"
          >
            {/* WRM Updates Card */}
            <VStack spacing={4} align="stretch">
              {values &&
                FIELD_CONFIG.map(
                  (field, index) =>
                    values[field.key] === true && (
                      <SelectComponent
                        key={field.key}
                        label={field.label}
                        name={field.key}
                        placeholder={field.placeholder}
                        value={percentValue?.[field.key] || ""}
                        onChange={handleSelectChange(field.key)}
                      >
                        {percentValue?.[field.key] &&
                          !ValueOption.find(
                            (option) =>
                              option.value === percentValue?.[field.key]
                          ) && (
                            <SelectOption
                              value={percentValue?.[field.key]}
                              label={`${percentValue?.[field.key]}%`}
                            />
                          )}
                        {ValueOption.map((option, idx) => (
                          <SelectOption
                            key={idx}
                            value={option.value}
                            label={option.label}
                          />
                        ))}
                      </SelectComponent>
                    )
                )}
            </VStack>
          </CardFormK3>
        </GridItem>

        {/* Right Column - Rig Selection and Submit Button */}
        <GridItem w="full">
          <VStack spacing={4} align="stretch">
            {/* WRM Date Inputs */}
            <WRMDateInputs
              onUpdate={someUpdateHandler}
              initialData={percentValue}
              job_id={job_id}
            />

            {/* Rig Selection */}
            <FormControl>
              <FormLabel>Select Rig</FormLabel>
              <SelectComponent
                placeholder="Select Rig"
                name="rig_id"
                value={percentValue?.rig_id}
                onChange={handleChangeRigId("rig_id")}
              >
                {rigData?.map((item, index) => (
                  <SelectOption
                    key={index}
                    value={item["id"]}
                    label={item["Rig Name"]}
                  />
                ))}
              </SelectComponent>
            </FormControl>
            {/* Submit Button */}
            <Button
              onClick={handleOpenSubmitDialog}
              width="full"
              colorScheme="green"
              size="lg"
            >
              Submit Updates
            </Button>
          </VStack>
        </GridItem>
      </Grid>

      {/* AlertDialog untuk konfirmasi submit */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Submit
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to submit these updates? This action cannot
              be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="green" onClick={handleSubmit} ml={3}>
                Submit
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Loading Spinner */}
      {loading && (
        <Center mt={4}>
          <Spinner size="xl" color="blue.500" />
        </Center>
      )}
    </Box>
  );
});

WRMUpdates.displayName = "WRMUpdates";

export default WRMUpdates;
