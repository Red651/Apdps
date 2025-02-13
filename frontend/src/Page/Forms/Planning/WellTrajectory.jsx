import React, { useState, useEffect } from "react";
import CardFormK3 from "../Components/CardFormK3";
import { Box, Flex, SimpleGrid } from "@chakra-ui/react";
import TableComponent from "../Components/TableComponent";
import FormControlCard from "../Components/FormControl";
import { useParams } from "react-router-dom";
import NewFileUpload from "../Components/NewFileUpload";
import {
  SelectComponentV2,
  SelectOptionV2,
} from "../Components/SelectOptionV2";

const WellTrajectory = ({
  title = "Well Trajectory",
  subtitle = "* Required",
  TypeSubmit = "create",
  unit_type = "METRICS",
  value = null,
  name = null,
  OnChangeData = (e) => {},
}) => {
  const { job_id } = useParams();
  const [formData, setFormData] = useState(null);

  const formDataRef = React.useRef(formData);
  //  
  useEffect(() => {
    if (TypeSubmit === "update" && value) {
      setFormData({
        filename: value?.filename || "",
        unit_type: value?.unit_type || "",
        physical_item_id: value?.physical_item_id || "",
        survey_start_date: value?.survey_start_date || "",
        survey_end_date: value?.survey_end_date || "",
        top_depth: value?.top_depth || 0,
        base_depth: value?.base_depth || 0,
        survey_type: value?.survey_type || "",
      });
    }
  }, [TypeSubmit]);

  useEffect(() => {
    if(formData?.length > 0){
      OnChangeData(name, formData);
    } else if(formData?.length === 0 || formData === null){
      OnChangeData(name, null);
    }
  }, [formData]);

  const handleFileUploadChange = React.useCallback(
    (fileData) => {
      if(fileData?.file_id === null){
        setFormData((prev) => ({
          ...prev,
        }))
      } 
      if(fileData?.file_id !== null){
        setFormData((prev) => ({
          ...prev,
          physical_item_id: fileData?.file_id || null,
        }));
      }
    },
    [FormData]
  );

  const parseData = {
    filename: formData?.filename || null,
    file_id: formData?.physical_item_id || null,
  };
 
  //  

  //  
  return (
    <CardFormK3 mt={4} title={title} subtitle={subtitle}>
      {/* {TypeSubmit === "create" && (
        <NewFileUpload
          onChange={handleFileUploadChange}
          // initialData={formData}
          TypeSubmit={TypeSubmit}
          title="Format Excel"
          acceptFormat=".xls, .xlsx , .csv"
        />
      )} */}
      {(TypeSubmit === "update" && formData?.physical_item_id) ? (
        <NewFileUpload
          onChange={handleFileUploadChange}
          initialData={parseData}
          TypeSubmit={TypeSubmit}
          title="Format Excel"
          acceptFormat=".xls, .xlsx , .csv"
        />
      ) : (
        <NewFileUpload
          onChange={handleFileUploadChange}
          // initialData={parseData}
          // TypeSubmit={TypeSubmit}
          title="Format Excel"
          acceptFormat=".xls, .xlsx , .csv"
        />
      )}

      <Flex gap={4} fontFamily="Mulish">
        {/* <FormControlCard
          labelForm="Unit Type"
          value={formData.unit_type}
          placeholder="Unit Type"
          type="text"
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, unit_type: e.target.value }));
          }}
        /> */}
        <SelectComponentV2
          labelForm="Unit Type"
          value={formData?.unit_type}
          onChange={(e) => {
            setFormData((prev) => ({ ...prev, unit_type: e.target.value }));
          }}
        >
          <SelectOptionV2 value="METRICS" label="METRICS" />
          <SelectOptionV2 value="IMPERIAL" label="IMPERIAL" />
        </SelectComponentV2>

        <FormControlCard
          labelForm="Survey Start Date"
          value={formData?.survey_start_date}
          placeholder="Survey Start Date"
          type="date"
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              survey_start_date: e.target.value,
            }));
          }}
        />
        <FormControlCard
          labelForm="Survey End Date"
          value={formData?.survey_end_date}
          placeholder="Survey End Date"
          type="date"
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              survey_end_date: e.target.value,
            }));
          }}
        />
      </Flex>

      <Flex gap={4} fontFamily="Mulish">
        <FormControlCard
          labelForm="Top Depth"
          value={formData?.top_depth}
          placeholder="Top Depth"
          type="number"
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              top_depth: parseFloat(e.target.value),
            }));
          }}
        />
        <FormControlCard
          labelForm="Base Depth"
          value={formData?.base_depth}
          placeholder="Base Depth"
          type="number"
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              base_depth: parseFloat(e.target.value),
            }));
          }}
        />
        <FormControlCard
          labelForm="Survey Type"
          value={formData?.survey_type}
          placeholder="Survey Type"
          type="text"
          onChange={(e) => {
            setFormData((prev) => ({
              ...prev,
              survey_type: e.target.value,
            }));
          }}
        />
      </Flex>

      <SimpleGrid maxH="400px" overflow="auto">
        <Box mt={4} overflowX="auto" maxH="400px" width="100%" gap={4}>
          {formData?.data && (
            <TableComponent
              headers={formData.data.headers}
              data={formData.data.item}
            />
          )}
        </Box>
      </SimpleGrid>
    </CardFormK3>
  );
};

export default React.memo(WellTrajectory);
