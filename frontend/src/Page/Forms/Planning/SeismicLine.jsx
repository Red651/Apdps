import React, { useState, useEffect } from "react";
import CardFormK3 from "../Components/CardFormK3";
import { Box, Flex, SimpleGrid, InputRightAddon } from "@chakra-ui/react";
import TableComponent from "../Components/TableComponent";
import FormControlCard from "../Components/FormControl";
import { useParams } from "react-router-dom";
import NewFileUpload from "../Components/NewFileUpload";

const SeismicLine = ({
  title = "Seismic Line",
  subtitle = "* Required",
  TypeSubmit = "create",
  value = null,
  name = null,
  OnChangeData = (e) => {},
}) => {
  const { job_id } = useParams();
  const [formData, setFormData] = useState(null);

  // Initial empty form data structure
  const initialFormDataStructure = {
    file_id: null,
    filename: null,
    physical_item_id: null,
    seismic_line_name: null,
    shot_point_number: null,
    average_velocity: null,
    max_latitude: null,
    max_longitude: null,
    min_latitude: null,
    min_longitude: null,
  };

  // Effect to initialize data from value prop
  useEffect(() => {
    if (TypeSubmit === "update" && value) {
      const newFormData = {
        ...initialFormDataStructure,
        ...Object.fromEntries(
          Object.entries(value).filter(([_, v]) => v != null)
        ),
      };

      setFormData(newFormData);
    }
  }, [TypeSubmit, value]);

  // Effect to trigger OnChangeData when formData changes
  useEffect(() => {
    OnChangeData(name, formData);
  }, [formData]);

  // Handler for file upload update
  const handleFileUploadChange = React.useCallback((fileData) => {
    if (fileData?.file_id || fileData?.filename) {
      setFormData((prev) => ({
        ...initialFormDataStructure,
        physical_item_id: fileData?.file_id,
        filename: fileData?.filename,
      }));
    } else {
      setFormData(null);
    }
  }, []);

  // Generic change handler to control data input
  const handleChange = (field, value) => {
    setFormData((prev) => {
      // If value is null or empty string, check if all other fields are also null
      if ((value === null || value === "") && prev) {
        const updatedFormData = { ...prev, [field]: null };

        // Check if all fields are null
        const allFieldsNull = Object.values(updatedFormData).every(
          (val) => val === null
        );

        return allFieldsNull ? null : updatedFormData;
      }

      // If this is the first input, create a new formData with all fields
      if (!prev) {
        return {
          ...initialFormDataStructure,
          [field]: value,
        };
      }

      // Otherwise, update the existing formData
      return {
        ...prev,
        [field]: value,
      };
    });
  };

  // Prepare parse data for file upload
  const parseData = {
    filename: formData?.filename || null,
    file_id: formData?.physical_item_id || null,
  };

  return (
    <CardFormK3 mt={4} title={title} subtitle={subtitle}>
      {/* File Upload Component */}
      {TypeSubmit === "update" && formData?.physical_item_id != null ? (
        <NewFileUpload
          onChange={handleFileUploadChange}
          initialData={parseData}
          TypeSubmit={TypeSubmit}
          title="Upload File"
          acceptFormat=".sgy"
        />
      ) : (
        <NewFileUpload
          onChange={handleFileUploadChange}
          title="Upload File"
          acceptFormat=".sgy"
        />
      )}

      {/* Form Control Cards */}
      <Flex gap={4} fontFamily={"Mulish"}>
        <FormControlCard
          labelForm="Seismic Line Name"
          value={formData?.seismic_line_name || ""}
          placeholder="Seismic Line Name"
          type="text"
          onChange={(e) => {
            handleChange("seismic_line_name", e.target.value || null);
          }}
        />
        <FormControlCard
          labelForm="Shot Point Number"
          value={formData?.shot_point_number || ""}
          placeholder="Shot Point Number"
          type="number"
          inputRightOn={"°"}
          onChange={(e) => {
            handleChange(
              "shot_point_number",
              e.target.value ? parseInt(e.target.value) : null
            );
          }}
        />
        <FormControlCard
          labelForm="Average Velocity"
          value={formData?.average_velocity || ""}
          placeholder="Average Velocity"
          type="number"
          inputRightOn={"°"}
          onChange={(e) => {
            handleChange(
              "average_velocity",
              e.target.value ? parseInt(e.target.value) : null
            );
          }}
        />
      </Flex>

      <Flex gap={4} fontFamily={"Mulish"}>
        <FormControlCard
          labelForm="Max Latitude"
          value={formData?.max_latitude || ""}
          placeholder="Max Latitude"
          type="text"
          inputRightOn={"°"}
          onChange={(e) => {
            handleChange(
              "max_latitude",
              e.target.value ? parseFloat(e.target.value) : null
            );
          }}
        />
        <FormControlCard
          labelForm="Min Latitude"
          value={formData?.min_latitude || ""}
          placeholder="Min Latitude"
          type="number"
          inputRightOn={"°"}
          onChange={(e) => {
            handleChange(
              "min_latitude",
              e.target.value ? parseFloat(e.target.value) : null
            );
          }}
        />
        <FormControlCard
          labelForm="Max Longitude"
          value={formData?.max_longitude || ""}
          placeholder="Max Longitude"
          type="number"
          inputRightOn={"°"}
          onChange={(e) => {
            handleChange(
              "max_longitude",
              e.target.value ? parseFloat(e.target.value) : null
            );
          }}
        />
        <FormControlCard
          labelForm="Min Longitude"
          value={formData?.min_longitude || ""}
          placeholder="Min Longitude"
          type="number"
          inputRightOn={"°"}
          onChange={(e) => {
            handleChange(
              "min_longitude",
              e.target.value ? parseFloat(e.target.value) : null
            );
          }}
        />
      </Flex>

      {/* Table Component */}
      <SimpleGrid maxH={"400px"} overflow={"auto"}>
        <Box
          mt={4}
          overflowX={"auto"}
          Maxheight={"400px"}
          width={"100%"}
          gap={4}
        >
          {formData?.data && (
            <TableComponent
              headers={formData?.data.headers}
              data={formData.data.item}
            />
          )}
        </Box>
      </SimpleGrid>
    </CardFormK3>
  );
};

export default React.memo(SeismicLine);
