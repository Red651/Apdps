import { useEffect, useState } from "react";
import { GetDatas } from "../../../../API/APISKK";
import InlineSVG from "react-inlinesvg";
import { Box, Heading, Text, Flex } from "@chakra-ui/react";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";
import { Skeleton, SkeletonCircle, SkeletonText } from "@chakra-ui/react";

const WorkBreakdownStructure = ({ data, loadData }) => {
  const pathData = data?.plot?.path;
  const [wbs, setWbs] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (loadData && pathData) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const response = await GetDatas(pathData); // Pastikan GetDatas berfungsi dengan baik
          setWbs(response);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [loadData, pathData]); // Memicu fetchData saat loadData atau pathData berubah

  return (
    <CardFormK3
      title={"Work Breakdown Structure"}
      padding="36px 28px"
      subtitle={"Work Breakdown Structure"}
      width={"71vw"}
    >
      <Text
        textAlign="left"
        fontSize="14px"
        color="gray.500"
        borderBottom="1px"
        borderColor="gray.400"
      >
        Job Schedule
      </Text>
      <Box width={"100%"}>
        {loading ? (
          <Skeleton height="300px" width="100%" />
        ) : (
          <Box overflowX={"auto"}>
            <InlineSVG src={wbs} />
          </Box>
        )}
      </Box>
    </CardFormK3>
  );
};

export default WorkBreakdownStructure;
