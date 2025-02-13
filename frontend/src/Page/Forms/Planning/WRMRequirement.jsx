import React, { useState, useEffect } from "react";
import { Box, VStack, Checkbox, Flex, Icon, Text } from "@chakra-ui/react";
import { IconWorld } from "@tabler/icons-react";

const initialFormData = {
  wrm_pembebasan_lahan: false,
  wrm_ippkh: false,
  wrm_ukl_upl: false,
  wrm_amdal: false,
  wrm_cutting_dumping: false,
  wrm_pengadaan_rig: false,
  wrm_pengadaan_drilling_services: false,
  wrm_pengadaan_lli: false,
  wrm_persiapan_lokasi: false,
  wrm_internal_kkks: false,
  wrm_evaluasi_subsurface: false,
};

const WRMRequirement = ({ onDataChange, showCuttingDumpingCheckbox}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: checked,
    }));

    // Update selectedItems array
    setSelectedItems((prevSelected) => {
      if (checked) {
        return [...prevSelected, name];
      } else {
        return prevSelected.filter((item) => item !== name);
      }
    });
  };

  useEffect(() => {
    onDataChange(formData);
  }, [formData]);


  const checkboxItems = [
    { name: "wrm_pembebasan_lahan", label: "Pembebasan Lahan" },
    { name: "wrm_ippkh", label: "Izin PPKH" },
    { name: "wrm_ukl_upl", label: "UKL & UPL" },
    { name: "wrm_amdal", label: "AMDAL" },
    { name: "wrm_pengadaan_rig", label: "Pengadaan Rig" },
    { name: "wrm_pengadaan_drilling_services", label: "Pengadaan Drilling Services" },
    { name: "wrm_pengadaan_lli", label: "Pengadaan LLI" },
    { name: "wrm_persiapan_lokasi", label: "Persiapan Lokasi" },
    { name: "wrm_internal_kkks", label: "Internal KKKS" },
    { name: "wrm_evaluasi_subsurface", label: "Evaluasi Subsurface" },
  ];

  // Conditionally add wrm_cutting_dumping checkbox
  if (showCuttingDumpingCheckbox) {
    checkboxItems.splice(4, 0, { name: "wrm_cutting_dumping", label: "Cutting Dumping" });
  }

  return (
    <Box borderWidth="1px" borderRadius="lg" mt={4} p={6} boxShadow="md">
      <Flex alignItems="center" mb={6}>
        <Icon as={IconWorld} boxSize={12} color="gray.800" mr={3} />
        <Flex flexDirection={"column"}>
          <Text fontSize="xl" fontWeight="bold" color="gray.700" fontFamily={"Mulish"}>
            {"WRM Requirements"}
          </Text>
          <Text fontSize="md" color="gray.600" fontFamily={"Mulish"}>
            {"subtitle"}
          </Text>
        </Flex>
      </Flex>

      <VStack align="start" spacing={3}>
        {checkboxItems.map((item) => (
          <Checkbox
            key={item.name}
            name={item.name}
            isChecked={formData[item.name]}
            onChange={handleCheckboxChange}
            size={"lg"}
          >
            {item.label}
          </Checkbox>
        ))}
      </VStack>
    </Box>
  );
};

export default WRMRequirement;
