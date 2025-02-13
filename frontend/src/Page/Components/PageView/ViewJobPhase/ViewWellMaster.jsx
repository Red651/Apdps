import DataTable from "./Components/DataTable";
import JobDocuments from "./Components/JobDocuments";
import WellData from "./Components/WellData";
import TableOfContents from "../../Card/TableOfContents";
import CardFormK3 from "../../../Forms/Components/CardFormK3";
import FileDownload from "./Components/Wellmaster/FileDownload";
import WellLogsData from "./Components/Wellmaster/WellLogsData";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Box, useToast, SkeletonCircle, SkeletonText } from "@chakra-ui/react";
import {
    Flex,
    Text,
    Heading,
    Alert,
    AlertIcon,
} from "@chakra-ui/react";
import BreadcrumbCard from "../../Card/Breadcrumb";

import { getExistingWell } from "../../../API/APIKKKS";
  
const ViewWellMaster = () => {

    const { well_id } = useParams();
    const [wellData, setWellData] = useState(null);
    const [loading, setLoading] = useState(true);
    console.log("🚀 ~ ViewWellMaster ~ data:", wellData)
    const toast = useToast();
    const wellName = wellData?.well_name;
    const jobType = "WellMaster";
    const status = wellData?.well_status;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
            const response = await getExistingWell(well_id);
            setWellData(response || []);
            } catch (error) {
            console.error("Error fetching well instance data: ", error);
            toast({
                title: "Error",
                description: "Failed to fetch data.",
                status: "error",
                duration: 3000,
                isClosable: true,
            });
            } finally {
            setLoading(false);
            }
        };
        fetchData();
    }, [well_id, toast]);

    const getStatus = (status) => {
      switch (status) {
        case "ACTIVE":
          return "success";
        case "OPERATING":
        default:
          return "error"; // Default status jika tidak ada match
      }
    };
  
    const isDataAvailable = (id) => {
      switch (id) {
        case "well-detail":
          return wellData;
        case "well-location":
          return wellData;
        case "well-other":
          return wellData;
        case "well-elev":
          return wellData;
        case "well-dates":
          return wellData;
        case "well-stratigraphy":
          return wellData?.well_stratigraphy;
        case "well-pressure":
          return wellData?.well_pressure;
        case "well-drilling-parameters":
          return wellData?.well_drilling_parameter;
        case "well-completion":
          return wellData?.well_completion;
        case "well-equipment":
          return wellData?.well_equipments;
        case "well-documents":
          return wellData?.well_documents;
        case "well-casing":
          return wellData?.well_casings
        case "well-schematic":
          return wellData?.well_schematic;
        case "well-trajectory":
          return wellData?.well_trajectory;
        case "well-ppfg":
          return wellData?.well_ppfg;
        case "well-logs":
          return wellData?.well_logs;
        case "seismic":
          return wellData?.seismic_line;
        case "well-test":
          return wellData?.well_tests;
        case "well-cores":
          return wellData?.well_cores;
        default:
          return false;
      }
    };
  
    const headings = [
      { id: "well-detail", title: "Well Detail" },
      { id: "well-location", title: "Well Location" },
      { id: "well-other", title: "Well Other" },
      { id: "well-elev", title: "Elevation and Depths" },
      { id: "well-dates", title: "Well Dates" },
      { id: "well-stratigraphy", title: "Well Stratigraphy" },
      { id: "well-trajectory", title: "Well Trajectory" }, 
      { id: "seismic", title: "Seismic Line" },
      { id: "well-documents", title: "Well Documents" },
      { id: "well-ppfg", title: "Well PPFG" },
      { id: "well-schematic", title: "Well Schematic" },
      { id: "well-logs", title: "Well Logs" },
      { id: "well-drilling-parameters", title: "Well Drilling Parameters" },
      { id: "well-cores", title: "Well Cores" },
      { id: "well-casing", title: "Well Casing" },
      { id: "well-equipment", title: "Well Equipment" },
      { id: "well-completion", title: "Well Completion" },
      { id: "well-pressure", title: "Well Pressure" },
      { id: "well-test", title: "Well Test" },
    ];
  
    // const { ref: refWbs, inView: inViewWbs } = useInView({ triggerOnce: true, threshold: 0.1, rootMargin: '-100px 0px' });
    // const { ref: refWellLog, inView: inViewWellLog } = useInView({ triggerOnce: true, threshold: 0.1, rootMargin: '-100px 0px' });
    // const { ref: refSeismic, inView: inViewSeismic } = useInView({ triggerOnce: true, threshold: 0.1, rootMargin: '-100px 0px' });
    // const { ref: refDor, inView: inViewDor } = useInView({ triggerOnce: true, threshold: 0.1, rootMargin: '-100px 0px' });
  
    const filteredHeadings = headings.filter((heading) =>
      isDataAvailable(heading.id)
  );
  
    if (loading) {
      return (
        <Flex w="full" gap={6} flexDir={"column"}>
          <Box w={"15%"}>
            <SkeletonText mt="6" noOfLines={2} spacing="4" skeletonHeight="6" />
          </Box>
          <Flex gap={6}>
            <Box padding="6" boxShadow="lg" bg="white" flex={6} w={"100%"}>
              <SkeletonCircle size="14" />
              <SkeletonText mt="6" noOfLines={6} spacing="4" skeletonHeight="6" />
            </Box>
            <Box padding="6" flex={1} w={"100%"}>
              <SkeletonText mt="4" noOfLines={6} spacing="4" skeletonHeight="4" />
            </Box>
          </Flex>
          <Flex gap={6}>
            <Box padding="6" boxShadow="lg" bg="white" flex={6} w={"100%"}>
              <SkeletonCircle size="14" />
              <SkeletonText mt="6" noOfLines={6} spacing="4" skeletonHeight="6" />
            </Box>
            <Box padding="6" flex={1} w={"100%"}></Box>
          </Flex>
        </Flex>
      );
    }
  
    return (
      <Flex flexDirection={"column"} gap={4} fontFamily={"Mulish"}>
        <Flex alignItems={"center"} justifyContent={"space-between"}>
          <Box mt={3}>
            <Heading as="h3" size="lg" fontFamily={"Mulish"}>
              {wellName}
            </Heading>
            <Text fontSize="lg" color={"gray.400"}>
              {jobType}
            </Text>
          </Box>
          <Box>
            <Alert
              status={getStatus(status)}
              variant={status == "FINISHED" ? "solid" : "subtle"}
              p={5}
              borderRadius="10px"
            >
              <AlertIcon />
              {status || "ERRORS!"}
            </Alert>
          </Box>
        </Flex>
        <BreadcrumbCard wellName={wellName ?? "-"} />
        <Flex flexDirection={"row-reverse"} w={"full"} gap={6}>
          <Box flex={1} position={"sticky"}>
            <TableOfContents headings={filteredHeadings} />
          </Box>
          <Box flex={4}>
            <Flex flexDirection={"column"} gap={6}>

                <CardFormK3
                    title="Well Detail"
                    subtitle="Well Detail"
                    padding="36px 28px"
                    flex="1"
                >
                    <Box id="well-detail">
                        <DataTable 
                            data={wellData} 
                            filter={["well_name", "well_num", "well_class", "well_profile_type", "environment_type", "well_level_type", "well_status", "parent_well_id"]}
                        />
                    </Box>
                </CardFormK3>

                <CardFormK3
                    title="Well Location"
                    subtitle="well coordinates"
                    padding="36px 28px"
                    flex="1"
                >
                    <Box id="well-location">
                        <DataTable 
                            data={wellData} 
                            filter={["surface_longitude", "bottom_hole_latitude", "surface_latitude","bottom_hole_longitude"]}
                        />
                    </Box>
                </CardFormK3>   

                <CardFormK3
                    title="Well Other"
                    subtitle="well other details"
                    padding="36px 28px"
                    flex="1"
                >
                    <Box id="well-other">
                        <DataTable 
                            data={wellData} 
                            filter={["hydrocarbon_target", "net_pay", "water_acoustic_vel", "azimuth", "maximum_inclination", "kick_off_point", "remark"]}
                        />
                    </Box>
                </CardFormK3>

                <CardFormK3
                    title="Elevation and Depths"
                    subtitle="Elevation and Depths details"
                    padding="36px 28px"
                    flex="1"
                >
                    <Box id="well-elev">
                        <DataTable 
                            data={wellData} 
                            filter={[
                                "rotary_table_elev",
                                "derrick_floor_elev",
                                "final_md",
                                "base_depth",
                                "depth_datum_elev",
                                "drill_td",
                                "top_depth",
                                "whipstock_depth",
                                "ground_elev_type",
                                "kb_elev",
                                "ground_elev",
                                "maximum_tvd",
                                "deepest_depth",
                                "difference_lat_msl",
                                "plugback_depth",
                                "water_depth",
                                "elev_ref_datum",
                                "subsea_elev_ref_type",
                                "water_depth_datum"
                              ]}
                        />
                    </Box>
                </CardFormK3>    

                <CardFormK3
                    title="Well Dates"
                    subtitle="well Dates"
                    padding="36px 28px"
                    flex="1"
                >
                    <Box id="well-dates">
                        <DataTable 
                            data={wellData} 
                            filter={["spud_date", "final_drill_date", "completion_date", "abandonment_date", "rig_on_site_date", "rig_release_date"]}
                        />
                    </Box>
                </CardFormK3>

                {wellData?.well_stratigraphy && (
                <Box id="well-stratigraphy">
                    <WellData
                        data={wellData?.well_stratigraphy}
                        title="Well Stratigraphy"
                        subTitle="Well Stratigraphy"
                    />
                </Box>
                )}
            
                {wellData?.well_trajectory && (
                <CardFormK3
                    title="Well Trajectory"
                    subtitle="Well Trajectory"
                    padding="36px 28px"
                    flex="1"
                >
                    <Box id="well-trajectory">
                        <DataTable data={wellData?.well_trajectory} />
                    </Box>
                </CardFormK3>
                )}
  
                {wellData?.seismic_line && (
                <CardFormK3
                    title="Seismic Line"
                    subtitle="Seismic Line"
                    padding="36px 28px"
                    flex="1"
                >
                    <Box id="seismic">
                        <DataTable data={wellData?.seismic_line} />
                    </Box>
                </CardFormK3>
                )}      

                {wellData?.well_documents && (
                <Box id="well-documents">
                    <JobDocuments
                    data={wellData?.well_documents}
                    title="Well Documents"
                    subtitle="Uploaded documents"
                    />
                </Box>
                )}

                {wellData?.well_ppfg && (
                <Box id="well-ppfg">
                    <FileDownload
                    title="Well PPFG"
                    subtitle="Well PPFG file"
                    wellData={wellData?.well_ppfg}
                    />
                </Box>
                )}

                {wellData?.well_schematic && (
                <Box id="well-schematic">
                    <FileDownload
                    title="Well Schematic"
                    subtitle="Well Schematic file"
                    wellData={wellData?.well_schematic}
                    />
                </Box>
                )}

                {wellData?.well_logs && (
                <Box id="well-logs">
                    <WellLogsData
                    wellData={wellData?.well_logs}
                    title="Well Logs"
                    subtitle="Uploaded Logs"
                    />
                </Box>
                )}  

                {wellData?.well_drilling_parameter && (
                <Box id="well-drilling-parameters">
                    <FileDownload
                    title="Well Drilling Parameter"
                    subtitle="Well Drilling Parameter file"
                    wellData={wellData?.well_drilling_parameter}
                    />
                </Box>
                )}

                {wellData?.well_cores && (
                <Box id="well-cores">
                    <WellData
                    data={wellData?.well_cores}
                    title="Well Cores"
                    subTitle="Well Cores"
                    />
                </Box>
                )}
                {wellData?.well_casings && (
                <Box id="well-casings">
                    <WellData
                    data={wellData?.well_casings}
                    title="Well Casing"
                    subTitle="Well Casing"
                    />
                </Box>
                )}

                {wellData?.well_equipments && (
                <Box id="well-equipments">
                    <WellData
                    data={wellData?.well_equipments}
                    title="Well Equipments"
                    subTitle="Well Equipments"
                    />
                </Box>
                )}

                {wellData?.well_completion && (
                <Box id="well-completion">
                    <WellData
                    data={wellData?.well_completion}
                    title="Well Completion"
                    subTitle="Well Completion"
                    />
                </Box>
                )}

                {wellData?.well_pressure && (
                <Box id="well-pressure">
                    <WellData
                    data={wellData?.well_pressure}
                    title="Well Pressure"
                    subTitle="Well Pressure"
                    />
                </Box>
                )}

                {wellData?.well_tests && (
                <Box id="well-tests">
                    <WellData
                    data={wellData?.well_tests}
                    title="Well Test"
                    subTitle="Well Test"
                    />
                </Box>
                )}
  
            </Flex>
          </Box>
        </Flex>
      </Flex>
    );
  };
  
  export default ViewWellMaster;
  