import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Grid,
  GridItem,
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import JobDetail from "../FormHandling/JobDetail";
import WellLocation from "../FormHandling/WellLocationOperation";
import ElevationsAndDepths from "../FormHandling/ElevationAndDepth";
import KeyDates from "../FormHandling/KeyDates";
import WellSummaryFormOperation from "../FormHandling/WellSumarryUntukOperation";
import WellCasing from "../FormHandling/WellCasing";
import WellStratigraphyForm from "../FormHandling/WellStratigraphy";
import WellTrajectory from "../FormHandling/WellTrajetory";
import SeismicLineOperation from "../FormHandling/SeismicLineOperation";
import CardUploadTabular from "../FormHandling/CardUploadTabular";
import { putPlanningUpdate } from "../../../API/PostKkks";
import { useParams } from "react-router-dom";
import { useJobContext } from "../../../../Context/JobContext";
import WellCores from "../FormHandling/WellCores";
import WellLogsCard from "../FormHandling/WellLogs";
import FileUploadSection from "../FormHandling/FileUploadSection";
import Others from "../FormHandling/Other";
import WellDocuments from "../FormHandling/WellDocuments";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";
import DynamixRowGrid from "../../../Components/Form/DynamicRowGrid/DynamicRowGrid";
import {
  TableWellEquipmentConf,
  wellCasingConf,
  wellCompletionConf,
  wellPressureConf,
  wellTestConf,
} from "../../../Components/utils/TableHeader.js";

const Technical = ({ jobType }) => {
  const { job_id } = useParams();
  // const { state } = useJobContext();
  const { state, dispatch } = useJobContext();
    
   
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef();
  const [capturedRowData, setCapturedRowData] = useState([]);

  const shinraTensei = state?.initialOperationData?.actual_job;
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    const updatedData = state.updatedOperationData;

    // Cek validasi untuk well
    const wellFields = [
      "well_name",
      "well_num",
      "well_class",
      "well_profile_type",
      "environment_type",
      "well_level_type",

      // Validasi untuk lokasi
      "surface_longitude",
      "surface_latitude",
      "bottom_hole_longitude",
      "bottom_hole_latitude",

      // validasi untuk elevations and depths
      // "rotary_table_elev",
      // "kb_elev",
      // "derrick_floor_elev",
      // "ground_elev",
      // "final_md",
      // "maximum_tvd",
      // "base_depth",
      // "deepest_depth",
      // "depth_datum_elev",
      // "difference_lat_msl",
      // "drill_td",
      // "plugback_depth",
      // "top_depth",
      // "water_depth",
      // "ground_elev_type",
      // "subsea_elev_ref_type",
      // "water_depth_datum",
      // "elev_ref_datum",
      // "whipstock_depth",

      // Other
      // "hydrocarbon_target",
      // "net_pay",
      // "water_acoustic_vel",
      // "azimuth",
      // "maximum_inclination",
      // "kick_off_point",

      // Validasi untuk key dates
      // "spud_date",
      // "final_drill_date",
      // "completion_date",
      // "abandonment_date",
      // "rig_on_site_date",
      // "rig_release_date",
    ];

    wellFields.forEach((field) => {
      if (
        updatedData?.well?.[field] === null ||
        updatedData?.well?.[field] === ""
      ) {
        errors[`well.${field}`] = `${field
          .replace(/_/g, " ")
          .toUpperCase()} is required`;
      }
    });

    // Tambahkan validasi untuk field lain sesuai kebutuhan
    // Contoh:
    // if (!updatedData?.actual_job?.key_dates?.spud_date) {
    //   errors['job_plan.key_dates.spud_date'] = 'Spud Date is required';
    // }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Fungsi update yang dimodifikasi
  const handleUpdate = async () => {
    // Lakukan validasi terlebih dahulu
    if (validateForm()) {
      const data = state.updatedOperationData;
      try {
        await putPlanningUpdate(job_id, data, jobType);
        toast({
          title: "Update Successful",
          description: "Data has been successfully updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "Update Failed",
          description: "There was an error updating the data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      // Tampilkan toast bahwa ada field yang belum terisi
       
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fungsi untuk menangkap data dari komponen anak
  const onDataChange = useCallback(
    (objectName, data) => {
      const name = objectName;
      setCapturedRowData(data);

      // Only dispatch if data has changed to prevent infinite re-rendering
      if (state.initialOperationData.actual_job.well[name] !== data) {
        dispatch({
          type: UPDATE_OPERATION_DATA,
          payload: {
            ...state.initialOperationData,
            actual_job: {
              ...state.initialOperationData.actual_job,
              well: {
                ...state.initialOperationData.actual_job.well,
                [name]: data,
              },
            },
          },
        });
      }
    },
    [dispatch] // Ensure dependencies are correct
  );
  return (
    <>
      <Grid gap={4}>
        <GridItem>
          <JobDetail errorForms={formErrors} />
        </GridItem>
        <GridItem>
          <WellLocation errorForms={formErrors} />
        </GridItem>
        <GridItem>
          <ElevationsAndDepths errorForms={formErrors} />
        </GridItem>
        <GridItem>
          <Others errorForms={formErrors} />
        </GridItem>
        <GridItem>
          <KeyDates errorForms={formErrors} />
        </GridItem>
        <GridItem>
          {shinraTensei?.well?.well_stratigraphy ? (
            <WellStratigraphyForm />
          ) : null}
        </GridItem>
        <GridItem>
          <WellTrajectory />
        </GridItem>
        <GridItem>
          <SeismicLineOperation />
        </GridItem>
        <GridItem>
          <WellDocuments />
        </GridItem>
        <GridItem>
          <FileUploadSection
            title="Well PPFG"
            subtitle="Upload Well PPFG file"
            variableName="well_ppfg"
            parentPath="well"
          />
        </GridItem>
        {/* <GridItem>
        <CardUploadTabular
            title="Well Materials"
            subtitle="well materials"
            variableName="well_materials"
          />
        </GridItem> */}
        <GridItem>
          <FileUploadSection
            title="Well Schematic"
            subtitle="Well Schematic"
            variableName="well_schematic"
            parentPath="well"
            allowedFileTypes={[".pdf", ".jpg", ".jpeg", ".png"]}
            maxFileSize={5}
          />
        </GridItem>
        <GridItem>
          <WellLogsCard />
        </GridItem>
        <GridItem>
          <FileUploadSection
            title="Well Drilling Parameter"
            subtitle="Well Drilling Parameter"
            variableName="well_drilling_parameter_plan"
          />
        </GridItem>
        <GridItem>{jobType == "development" ? null : <WellCores />}</GridItem>
        <GridItem>
          {/* <WellCasing /> */}
          <DynamixRowGrid
            title="Well Casing"
            columnConfig={wellCasingConf}
            objectName="well_casings"
            onDataChange={onDataChange}
            initialData={
              state.initialOperationData?.actual_job?.well?.well_casings
            }
          />
        </GridItem>
        <GridItem>
          <DynamixRowGrid
            title="Well Equipments"
            columnConfig={TableWellEquipmentConf}
            objectName="well_equipments"
            onDataChange={onDataChange}
            initialData={
              state.initialOperationData?.actual_job?.well?.well_equipments
            }
          />
        </GridItem>

        <GridItem>
          <DynamixRowGrid
            title="Well Completion"
            columnConfig={wellCompletionConf}
            objectName="well_completion"
            onDataChange={onDataChange}
            initialData={
              state.initialOperationData?.actual_job?.well?.well_completion
            }
          />
        </GridItem>
        <GridItem>
          <DynamixRowGrid
            title="Well Pressure"
            columnConfig={wellPressureConf}
            objectName="well_pressure"
            onDataChange={onDataChange}
            initialData={
              state.initialOperationData?.actual_job?.well?.well_pressure
            }
          />
        </GridItem>

        <GridItem>
          {jobType == "development" ? null : (
            <GridItem>
              <DynamixRowGrid
                title="Well Test"
                columnConfig={wellTestConf}
                objectName="well_tests"
                onDataChange={onDataChange}
                initialData={
                  state.initialOperationData?.actual_job?.well?.well_tests
                }
              />
            </GridItem>
          )}
        </GridItem>
      </Grid>
      <Button
        colorScheme="blue"
        size="lg"
        onClick={onOpen}
        variant="outline"
        width="full"
        mt={4}
      >
        Update Data
      </Button>

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Update
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to update the data? This action cannot be
              undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={() => {
                  handleUpdate().then(() => {
                    setTimeout(() => {
                      window.scrollTo(0, 0);
                      // window.location.reload();
                    }, 2000);
                  });
                  onClose();
                }}
                ml={3}
              >
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Technical;
