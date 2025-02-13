import React, { useState, useEffect } from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import { Button } from "@chakra-ui/react";

// Komponen AreaWell untuk memetakan data area dan field ID ke dalam form
const AreaWell = ({ data }) => {
  const datas = data?.data;
  // 
  // State untuk menyimpan nilai form
  const [areaWell, setAreaWell] = useState("");
  const [fieldId, setFieldId] = useState("");

  // 

  // Mengisi form dengan data yang diterima dari API
  useEffect(() => {
    if (data) {
      setAreaWell(data.area_id || ""); // Memetakan area_id dari API
      setFieldId(data.field_id || ""); // Memetakan field_id dari API
    }
  }, [data]);

  return (
    <CardFormK3 title="Area Well" subtitle="well"    >
     
      <FormControlCard
        labelForm="Area Well"
        placeholder="Area"
        value={areaWell}
        isDisabled
      />
      <FormControlCard
        labelForm="Field ID"
        placeholder="Field ID"
        value={fieldId}
        isDisabled
      />
    </CardFormK3>
  );
};

export default AreaWell;
