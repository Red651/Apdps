import React,{ useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  VStack,
  HStack,
  FormControl,
  FormLabel,
  Select,
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Flex,
  Text,
  Spinner,
  Center,
} from "@chakra-ui/react";
import WellDetail from "./FormHandling/WellDetail";
import WellLocation from "./FormHandling/WellLocation";
import KeyDates from "./FormHandling/KeyDates";
import WellStratigraphy from "./FormHandling/WellStratigraphy";
import WellCasing from "./FormHandling/WellCasing";
import WellDocuments from "./FormHandling/WellDocuments";
import WellLogs from "./FormHandling/WellLogs";
import ElevationsAndDepths from "./FormHandling/ElevationAndDepths";
import WellTrajectory from "./FormHandling/WellTrajectory";
import WellSummary from "./FormHandling/WellSummary";
import WellDrillingParameter from "./FormHandling/WellDrillingParameter";
import WellGeneralInfo from "./FormHandling/WellGeneralInfo";
import WellCores from "./FormHandling/WellCores";
import CardTabular from "./FormHandling/CardTabular";
import { postWellMaster, editWellMaster } from "../../API/PostKkks";
import { getExistingWell } from "../../API/APIKKKS";
import { useParams, useNavigate } from "react-router-dom";
import BreadcrumbCard from "../../Components/Card/Breadcrumb";
import Others from "./FormHandling/Others";
import { ADD_WELL_MASTER } from "../../../Reducer/reducer";
import { useJobContext } from "../../../Context/JobContext";
import DynamixRowGrid from "../../Components/Form/DynamicRowGrid/DynamicRowGrid";
// import DataHeaderCasing from "../Operation/FormHandling/Utils/WellCasingHeader";
import SeismicLine from "./FormHandling/SeismicLine";
import FileUploadSection from "./FormHandling/FileUploadSection";
import {wellCasingConf} from "../Planning/Utils/TableWellEquipment";
import {
  WellTestsHeaderMaster,
  WellCasingHeader,
  WellEquipmentHeader,
  WellCompletionHeader,
  WellPressureHeader,
} from "../Operation/FormHandling/Utils/HeaderAGGrid";

const WellMasterForm = () => {
  const { well_id } = useParams();
  const { state, dispatch } = useJobContext();
   console.log("🚀 ~ WellMasterForm ~ state:", state)
   
  const [formData, setFormData] = useState({ unit_type: "METRICS" });
   
   
  
  const prevFormData = useRef(formData);
  const toast = useToast();
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const cancelRef = useRef();
  const [wellData, setWellData] = useState(null);
  const navigate = useNavigate();
  const [capturedRowData, setCapturedRowData] = useState([]);
  const [errorForms, setErrorForms] = useState({});
  const [isLoading, setIsLoading] = useState(true);


  const validateForm = () => {
    const errors = {};
  
    // Validasi untuk Well Detail
    if (!state?.wellMaster?.area_id) {
      errors.area_id = "Area ID is required";
    }
    if (!state?.wellMaster?.field_id) {
      errors.field_id = "Field ID is required";
    }
    if (!state?.wellMaster?.well_name) {
      errors.well_name = "Well name is required";
    }
    if (!state?.wellMaster?.well_num) {
       
      errors.well_num = "Well Number cannot be empty";
    }
    if (!state?.wellMaster?.well_class) {
      errors.well_class = "Well Class cannot be empty";
    }
    if (!state?.wellMaster?.well_profile_type) {
      errors.well_profile_type = "Well Profile Type is required";
    }
    if (!state?.wellMaster?.environment_type) {
      errors.environment_type = "Environment Type is required";
    }
    if (!state?.wellMaster?.well_level_type) {
      errors.well_level_type = "Well Level Type is required";
    }
    if (!state?.wellMaster?.well_status) {
      errors.well_status = "Well Status is required";
    }

    // Validasi untuk Well Location
    if (!state?.wellMaster?.surface_longitude) {
      errors.surface_longitude = "Surface Longitude is required";
    }
    if (!state?.wellMaster?.surface_latitude) {
      errors.surface_latitude = "Surface Latitude";
    }
    if (!state?.wellMaster?.bottom_hole_longitude) {
      errors.bottom_hole_longitude = "Bottom Hole Longitude is required";
    }
    if (!state?.wellMaster?.bottom_hole_latitude) {
      errors.bottom_hole_latitude = "Bottom Hole Latitude";
    }
  
    setErrorForms(errors); // Simpan error ke state
    return errors;
  };

  const handleChange = useCallback(
    (field, newData, { isArray = false, wrapField = true } = {}) => {
      setFormData((prev) => {
        let updatedData;

        if (!wrapField) {
          updatedData = { ...prev, ...newData };
        } else {
          if (isArray) {
            updatedData = { ...prev, [field]: newData };
          } else {
            updatedData = { ...prev, [field]: newData };
          }
        }

        if (JSON.stringify(prev[field]) === JSON.stringify(newData)) {
          return prev;
        }
        return updatedData;
      });
    },
    []
  );

  useEffect(() => {
    const fetchWellData = async () => {
      try {
        setIsLoading(true);
        if (well_id) {
          try {
            const fetchedWellData = await getExistingWell(well_id);
            if (fetchedWellData) {
              setFormData((prevData) => ({ ...prevData, ...fetchedWellData }));
              setWellData(fetchedWellData);
              dispatch({
                type: ADD_WELL_MASTER,
                payload: fetchedWellData,
              });
            }
          } catch (error) {
            toast({
              title: "Error",
              description: "An error occurred while fetching Well data.",
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          }
        } else {
          setFormData({ unit_type: "METRICS" }); // Reset form to initial state
          setWellData(null);
          dispatch({
            type: ADD_WELL_MASTER,
            payload: {}, // Reset context to null
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "An error occurred while fetching Well data.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchWellData();
  }, [well_id, toast, dispatch]);

  useEffect(() => {
    const wellDatas = {
      well_cores: state.wellMaster?.well_cores,
      well_materials: state.wellMaster?.well_materials,
      well_tests: state.wellMaster?.well_tests,
      well_ppfg: state.wellMaster?.well_ppfg,
      well_schematic: state.wellMaster?.well_schematic,
    };
    setFormData((prev) => ({
      ...prev,
      ...wellDatas,
    }));
  }, []);
  

  const updateUnitType = (newUnitType) => {
    setFormData((prev) => {
      const updatedData = { ...prev, unit_type: newUnitType };
      const fieldsToUpdate = [
        "well_casing",
        "well_summary",
        "well_stratigraphy",
        "well_drilling_parameter",
      ];

      fieldsToUpdate.forEach((field) => {
        if (Array.isArray(updatedData[field])) {
          updatedData[field] = updatedData[field].map((item) => ({
            ...item,
            unit_type: newUnitType,
          }));
        } else if (
          typeof updatedData[field] === "object" &&
          updatedData[field]
        ) {
          updatedData[field] = {
            ...updatedData[field],
            unit_type: newUnitType,
          };
        }
      });

      return updatedData;
    });
  };

  const handleGeneralInfoChange = useCallback(
    (data) => handleChange(null, data, { wrapField: false }),
    [handleChange]
  );

  useEffect(() => {
    if (JSON.stringify(formData) !== JSON.stringify(prevFormData.current)) {
      prevFormData.current = formData;
    }
  }, [formData]);

  //  Fungsi untuk menangkap data dari komponen anak
   const onDataChange = useCallback((objectName, data) => {
      if (!objectName || !data) return; // Check for null or undefined arguments

      setCapturedRowData(data);

      // Only dispatch if data has changed to prevent infinite re-rendering
      if (state.wellMaster?.[objectName] !== data) {
        dispatch({
          type: ADD_WELL_MASTER,
          payload: {
            ...state.wellMaster,
            [objectName]: data,
          },
        });
      }
    },
    [dispatch, state.wellMaster] // Ensure dependencies are correct
  );



  const fieldRefs = useRef({});
  
  const handleSubmit = async () => {
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
       
      const firstErrorField = Object.keys(errors)[0];
       
       
      
      setTimeout(() => {
        if (fieldRefs.current[firstErrorField]) {
          fieldRefs.current[firstErrorField].scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

        }
      }, 500);
      return; // Stop submission jika ada error
    }

    try {

      const data = { ...state?.wellMaster , ...formData,};

      let response;
      if (well_id && wellData) {
        response = await editWellMaster(well_id, data);
      } else {
        response = await postWellMaster(data);
      }

      if (response) {
        toast({
          title: `Data ${well_id ? "Updated" : "Created"} Successfully.`,
          description: `Well Master data has been successfully ${
            well_id ? "updated" : "created"
          }.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        navigate("/wellmaster");
      } else {
        toast({
          title: "Error",
          description: `An error occurred while ${
            well_id ? "updating" : "creating"
          } Well Master data.`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `An error occurred while ${
          well_id ? "updating" : "creating"
        } Well Master data.`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const onOpenAlert = () => setIsAlertOpen(true);
  const onCloseAlert = () => setIsAlertOpen(false);
  const confirmSubmit = () => {
    onCloseAlert();
    handleSubmit();
  };

  if (isLoading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Center>
    );
  }

  const codeAreaId = formData.area_id;
  return (
    <Flex direction="column" style={{ padding: "20px" }} gap={6}>
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        New Well
      </Text>

      <Flex justifyContent={"space-between"} alignItems="start">
        <BreadcrumbCard wellName={wellData?.well_name} />
        <HStack spacing={4}>
          <Select
            value={formData.unit_type}
            onChange={(e) => updateUnitType(e.target.value)}
            size={"md"}
          >
            <option value="METRICS">METRICS</option>
            <option value="Imperial">Imperial</option>
          </Select>
        </HStack>
      </Flex>

      <VStack spacing={4} align="stretch">
        {/* <WellGeneralInfo
          handleChange={handleGeneralInfoChange}
          errorForms={{}}
          initialData={wellData}
        /> */}

        <WellDetail
          errorForms={errorForms}
          fieldRefs={fieldRefs}
        />
        <WellLocation
          errorForms={errorForms}
          fieldRefs={fieldRefs}
        />
        <Others/>
        <ElevationsAndDepths/>
        <KeyDates/>
        <WellStratigraphy/>
        <WellTrajectory/>
        <SeismicLine/>
        <WellDocuments/>
        <FileUploadSection
          title="Well PPFG"
          subtitle="Upload Well PPFG file"
          variableName="well_ppfg"
        />
        <FileUploadSection
          title="Well Schematic"
          subtitle="Well Schematic"
          variableName="well_schematic"
          allowedFileTypes={[".pdf", ".jpg", ".jpeg", ".png"]}
          maxFileSize={5}
        />
        <WellLogs />
        <FileUploadSection
          title="Well Drilling Parameter"
          subtitle="Well Drilling Parameter"
          variableName="well_drilling_parameter"
        />
        <WellCores />
        <DynamixRowGrid
          title="Well Casing"
          columnConfig={wellCasingConf}
          objectName="well_casings"
          onDataChange={onDataChange}
          initialData={state?.wellMaster?.well_casings}            
        />

        <DynamixRowGrid
          title="Well Equipments"
          columnConfig={WellEquipmentHeader}
          objectName="well_equipments"
          onDataChange={onDataChange}
          initialData={state?.wellMaster?.well_equipments}
        />

<       DynamixRowGrid
          title="Well Completion"
          columnConfig={WellCompletionHeader}
          objectName="well_completion"
          onDataChange={onDataChange}
          initialData={state?.wellMaster?.well_completion}
        />

        <DynamixRowGrid
          title="Well Pressure"
          columnConfig={WellPressureHeader}
          objectName="well_pressure"
          onDataChange={onDataChange}
          initialData={state?.wellMaster?.well_pressure}
        />

        <DynamixRowGrid
          title="Well Test"
          columnConfig={WellTestsHeaderMaster}
          objectName="well_tests"
          onDataChange={onDataChange}
          initialData={state?.wellMaster?.well_tests}
        />

        <Button colorScheme="blue" onClick={onOpenAlert} mt={4}>
          {well_id && wellData ? "Update" : "Submit"}
        </Button>
      </VStack>

      <AlertDialog
        isOpen={isAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={onCloseAlert}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm {well_id ? "Update" : "Submit"}
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure? This action will {well_id ? "update" : "submit"} the
              well data.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onCloseAlert}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={confirmSubmit} ml={3}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Flex>
  );
};

export default WellMasterForm;
