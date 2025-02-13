import React, { useCallback, useState, useEffect } from "react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import WellTest from "../Planning/WellTest";
import WellCasing from "../Planning/WellCasing";
import FileUploadForm from "../Planning/WellTrajectory";
import WellTrajectory from "../Planning/WellTrajectory";
import WellPorePressureForm from "../Planning/WellPPFG";
import ElevationsAndDepths from "./../Planning/ElevationsandDepths";
import WellLocation from "./../Planning/WellLocation";
import JobDetail from "./../Planning/JobDetail";
import WellSummary from "./../Planning/WellSummary";
import Stratigraphy from "./../Planning/Stratigraphy";
import Seismic from "../Planning/Seismic";
import KeyDates from "./../Planning/KeyDates";
import ExistingWell from "../Planning/ExistingWell";
import { useJobContext } from "../../../Context/JobContext";

const CardFormWell = ({ onFormChange, unitType, dataExistingWell,JobType }) => {
  const {state,dispatch} = useJobContext();
  
  

  const [formData, setFormData] = useState({
    unit_type: unitType,
    uwi: "",
    field_id: "",
    area_id: "",
    kkks_id: "",
    well_name: "",
    alias_long_name: "",
    well_type: "WILDCAT",
    well_status: "Active",
    well_profile_type: "",
    hydrocarbon_target: "OIL",
    environment_type: "MARINE",
    surface_longitude: 0,
    surface_latitude: 0,
    bottom_hole_longitude: 0,
    bottom_hole_latitude: 0,
    maximum_inclination: 0,
    azimuth: 0,
    line_name: "",
    spud_date: "",
    final_drill_date: "",
    completion_date: "",
    rotary_table_elev: 0,
    kb_elev: 0,
    derrick_floor_elev: 0,
    ground_elev: 0,
    mean_sea_level: 0,
    depth_datum: "RT",
    kick_off_point: 0,
    maximum_tvd: 0,
    final_md: 0,
    remark: "",
    well_trajectory: {
      file_id: "",
      data_format: "IMAGE",
    },
    well_ppfg: {
      file_id: "",
      data_format: "IMAGE",
    },
    well_logs: [
      {
        file_id: "",
        data_format: "IMAGE",
      },
    ],
    well_drilling_parameter: {
      file_id: "",
      data_format: "IMAGE",
    },
    well_documents: [
      {
        file_id: "",
        document_type: "Well Report",
        remark: "",
      },
    ],
  });

  useEffect(() => {
    if (JobType === "Exploration") {
      onFormChange(formData);
    }
  }, [formData, JobType]);

  const handleChange = useCallback((e) => {
    const { name, value, type } = e.target;
    let parsedValue;
    if (type === "number") {
      parsedValue =
        value === ""
          ? ""
          : value.includes(".")
          ? parseFloat(value)
          : parseInt(value, 10);
    } else {
      parsedValue = value; // If type is text or anything else, keep it as string
    }

    // 

    setFormData((prevData) => ({
      ...prevData,
      [name]: parsedValue,
    }));
  }, []);
  const handleMenuItemClick = (unit) => {
    setFormData((prevData) => ({
      ...prevData,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEntry((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleInputChangeWellStraigraphy = (e) => {
    const { name, value } = e.target;
    setWellStratigraphy((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const [tableData, setTableData] = useState([]);

  const [currentEntry, setCurrentEntry] = useState({
    unit_type: "METRICS",
    depth_datum: "RT",
    depth: 0,
    hole_diameter: 0,
    bit: "",
    casing_outer_diameter: 0,
    logging: "",
    mud_program: "",
    cementing_program: "",
    bottom_hole_temperature: 0,
    rate_of_penetration: 0,
    remarks: "",
  });

  const [TablewellStratigraphy, setTablewellStratigraphy] = useState([]);
  const [WellStratigraphy, setWellStratigraphy] = useState({
    unit_type: "METRICS",
    depth_datum: "RT",
    depth: 0,
    stratigraphy_id: "",
  });

  const handleAddClick = useCallback(() => {
    const newEntry = { ...currentEntry };
    setTableData((prevData) => [...prevData, newEntry]);
    setFormData((prevData) => ({
      ...prevData,
      well_summary: [...(prevData.well_summary || []), newEntry],
    }));
    // Reset currentEntry after adding
    setCurrentEntry({
      unit_type: "METRICS",
      depth_datum: "",
      depth: 0,
      hole_diameter: 0,
      bit: "",
      casing_outer_diameter: 0,
      logging: "",
      mud_program: "",
      cementing_program: "",
      bottom_hole_temperature: 0,
      rate_of_penetration: 0,
      remarks: "",
    });
  }, [currentEntry]);

  const handleWellStratichy = () => {
    const newEntry = { ...WellStratigraphy };
    setTablewellStratigraphy((prevData) => [...prevData, newEntry]);
    setFormData((prevData) => ({
      ...prevData,
      well_stratigraphy: [...(prevData.well_stratigraphy || []), newEntry],
    }));
    // Reset WellStratigraphy after adding
    setWellStratigraphy({
      unit_type: "METRICS",
      depth_datum: "RT",
      depth: 0,
      stratigraphy_id: "",
    });
  };

  const handleData = (newData) => {
    const newEntry = { ...newData };
    // Update parent state with the new data
    setFormData((prevData) => ({
      ...prevData,
      well_test: newData,
    }));
  };

  // 
  return (
    <>
    <ExistingWell onSubmit={dataExistingWell}/>
      {/* <JobDetail
        handleChange={handleChange}
        formData={formData}
        unittype={unitType}
      />
      <WellLocation handleChange={handleChange} />
      <ElevationsAndDepths handleChange={handleChange} unittype={unitType} />
      <Seismic handleChange={handleChange} formData={formData} />
      <KeyDates handleChange={handleChange} formData={formData} />
      <WellSummary
        handleAddClick={handleAddClick}
        handleInputChange={handleInputChange}
        currentEntry={currentEntry}
        tableData={tableData}
      />

      <WellCasing
        dataWellCasing={(data) =>
          setFormData((prev) => ({ ...prev, well_casing: data }))
        }
      />
      <Stratigraphy
        setWellStratigraphy={setWellStratigraphy}
        WellStratigraphy={WellStratigraphy}
        handleInputChangeWellStraigraphy={handleInputChangeWellStraigraphy}
        handleWellStratichy={handleWellStratichy}
        TablewellStratigraphy={TablewellStratigraphy}
      />

      <WellTrajectory
        ondata={(data) =>
          setFormData((prev) => ({ ...prev, well_trajectory: data }))
        }
      />
      <WellPorePressureForm />
      <WellTest onData={handleData} /> */}
    </>
  );
};

export default CardFormWell;
