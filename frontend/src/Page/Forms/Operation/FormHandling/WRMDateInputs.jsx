import React, { useState } from "react";
import CardFormK3 from "../../Components/CardFormK3";
import { IconBrightness } from "@tabler/icons-react";
import {
  Box,
  Button,
  FormControl,
  Input,
  VStack,
  HStack,
  Text,
  useToast,
} from "@chakra-ui/react";
import { getWRMPPercentValues, patchWRM } from "../../../../Page/API/APISKK";

const WRMDateInputs = ({ onUpdate, job_id, initialData }) => {
  
  // 
  //  

  const [dates, setDates] = useState(null);

  React.useEffect(() => {
    job_id && setDates(initialData?.wbs);
  }, [initialData]);
  // 
 React.useEffect(()=> {
  onUpdate(dates)
 },[dates])
    

  const toast = useToast();




  const handleChange = (key, field, value) => {
    const otherField = field === "start_date" ? "end_date" : "start_date";

    // Validasi tanggal
    if (field === "end_date" && value < dates[key].start_date) {
      toast({
        title: "Invalid Date",
        description: "End date cannot be earlier than start date",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (
      field === "start_date" &&
      dates[key].end_date &&
      value > dates[key].end_date
    ) {
      toast({
        title: "Invalid Date",
        description: "Start date cannot be later than end date",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setDates((prevDates) => ({
      ...prevDates,
      [key]: { ...prevDates[key], [field]: value },
    }));
  };

  
  
  const dataLabels = {
    wrm_internal_kkks: "Internal KKKS",
    wrm_pengadaan_equipment: "Pengadaan Equipment",
    wrm_pengadaan_services: "Pengadaan Services",
    wrm_pengadaan_handak: "Pengadaan Handak",
    wrm_pengadaan_octg: "Pengadaan OCTG",
    wrm_pengadaan_lli: "Pengadaan LLI",
    wrm_pengadaan_artificial_lift: "Pengadaan Artificial Lift",
    wrm_sumur_berproduksi: "Sumur Berproduksi",
    wrm_fasilitas_produksi: "Fasilitas Produksi",
    wrm_persiapan_lokasi: "Persiapan Lokasi",
    wrm_well_integrity: "Well Integrity",
    wrm_amdal: "AMDAL",
    wrm_evaluasi_subsurface: "Evaluasi Subsurface",
    wrm_ippkh: "IPPKH",
    wrm_cutting_dumping: "Cutting & Dumping",
    wrm_pembebasan_lahan: "Pembebasan Lahan",
    wrm_pengadaan_drilling_services: "Pengadaan Drilling Services",
    wrm_pengadaan_rig: "Pengadaan Rig",
    wrm_ukl_upl: "UKL-UPL"
};


  return (
    <CardFormK3 title="WRM Dates" icon={IconBrightness} subtitle="* Required">
      <VStack spacing={6} align="stretch">
        {/* Header Labels */}
        <HStack spacing={6} width="100%">
          <Text fontWeight="light" width="30%"></Text>
          <Text fontWeight="light" width="35%">
            Start Date
          </Text>
          <Text fontWeight="light" width="35%">
            End Date
          </Text>
        </HStack>

        {/* Date Inputs */}
        {dates &&
          Object.keys(dates).map((key,index) => (
            <HStack key={index} spacing={6} align="center" width="100%">
              <Text fontWeight="light" width="30%">
                {dataLabels[key]}
              </Text>
              <FormControl width="35%">
                <Input
                  type="date"
                  value={dates[key].start_date}
                  onChange={(e) =>
                    handleChange(key, "start_date", e.target.value)
                  }
                  size="md"
                />
              </FormControl>
              <FormControl width="35%">
                <Input
                  type="date"
                  disabled={!dates[key].start_date}
                  min={dates[key].start_date}
                  value={dates[key].end_date}
                  onChange={(e) =>
                    handleChange(key, "end_date", e.target.value)
                  }
                  size="md"
                />
              </FormControl>
            </HStack>
          ))}

        
      </VStack>
    </CardFormK3>
  );
};

export default WRMDateInputs;
