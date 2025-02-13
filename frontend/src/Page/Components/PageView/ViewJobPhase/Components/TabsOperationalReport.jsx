import { useParams } from "react-router-dom";
import { GetDateJobInstances, GetDailyReport } from "../../../../API/APIKKKS";
import { useEffect, useState, useRef } from "react";
import {
  Flex,
  Text,
  Box,
  Skeleton,
  SkeletonText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import ButtonCarousel from "../../../../Forms/Operation/FormHandling/ButtonCourosel";

// Fungsi untuk memeriksa apakah value adalah object atau array
const isComplex = (value) => typeof value === "object" && value !== null;

const TabsOperationalReport = ({ loadData }) => {
  const { job_id } = useParams();
  const [dates, setDates] = useState([]);
  const [reportDate, setReportDate] = useState(null);
  const [dailyReport, setDailyReport] = useState(null);
  const [loading, setLoading] = useState(false); // Track loading state for date data
  const [loadingReport, setLoadingReport] = useState(false); // Track loading state for daily report

  const renderHtmlRef = useRef(null); // Use ref to keep track of the HTML

  // Handle when date changes
  const handleDateChange = (date) => {
    setReportDate(date);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true when fetching date data
      try {
        const response = await GetDateJobInstances(job_id);
        setDates(response.data);

        // Set the first date as default
        if (response.data?.data?.[0]) {
          setReportDate(response.data.data[0].Date);
        }
      } catch (error) {
        console.error("Error fetching date data:", error);
      } finally {
        setLoading(false); // Set loading to false after fetching date data
      }
    };
    fetchData();
  }, [job_id]);

  useEffect(() => {
    const fetchDailyReport = async () => {
      if (reportDate && loadData) {
        setLoadingReport(true); // Set loading to true when fetching daily report
        try {
          const response = await GetDailyReport(job_id, reportDate);
          renderHtmlRef.current = response.body; // Store the report data in ref, not in state
          setDailyReport(response); // Optionally store it in state as well
        } catch (error) {
          console.error("Error fetching daily report:", error);
        } finally {
          setLoadingReport(false); // Set loading to false once the report data is fetched
        }
      }
    };

    if (reportDate) {
      fetchDailyReport(); // Fetch the daily report whenever the reportDate changes
    }
  }, [job_id, reportDate, loadData]);

  // Handle the case where no data is available for the dates
  if (!dates || Object.keys(dates).length === 0) {
    return  <Box mt={8}>
    <SkeletonText mt="4" noOfLines={6} spacing="4" skeletonHeight="4" />
  </Box>;
  }

  // Use the ref value for rendering the iframe
  const renderHtml = renderHtmlRef.current || dailyReport || null;

  return (
    <Flex direction={"column"} gap={1} maxWidth="71vw" width="100%">
      {/* Disable ButtonCarousel when date data or report data is loading */}
      <ButtonCarousel
        dateDataJobPlan={dates.data || []}
        dateNow={reportDate}
        setDateNow={handleDateChange}
        isDisabled={loading || loadingReport} // Disable when either loading
      />

      <Box
        borderRadius="md"
        flex={1}
        width="100%"
      >

        {/* Skeleton Loader for daily report */}
        {loadingReport ? (
          <Skeleton height="600px" width="100%" />
        ) : renderHtml ? (
          // Only render iframe if reportHtml is available
          <iframe
            key={reportDate} // Force re-render on date change
            srcDoc={renderHtml} // Use srcDoc to inject HTML content directly
            width="100%"
            height="600px"
            style={{ border: "none" }}
            title="Daily Report"
          />
        ) : (
          // Fallback if no report data available
          <Text>No report available.</Text>
        )}
      </Box>

      {/* Additional skeleton loaders for other content */}
      {loading && (
        <Box mt={8}>
          <SkeletonText mt="4" noOfLines={6} spacing="4" skeletonHeight="4" />
        </Box>
      )}
    </Flex>
  );
};

export default TabsOperationalReport;
