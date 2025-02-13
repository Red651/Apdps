import React from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import { Button, HStack, SimpleGrid, Skeleton, SkeletonCircle, SkeletonText, Stack } from "@chakra-ui/react";
import { getAFENumber } from "../../../API/APIKKKS";
import { useParams } from "react-router-dom";
const AFENumber = () => {
  const { job_id } = useParams();
  const [afeNumber, setAfeNumber] = React.useState({
    nomor_afe: null,
    total_budget: null,
    estimated_budget: null,
  });
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getAFENumber(job_id);
        // 
        setAfeNumber(response.data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const [fieldData, setFieldData] = React.useState({});

  const handleChange = React.useCallback((data, name) => {
    setFieldData({
      ...fieldData,
      [name]: data,
    });
  });

  if (loading) {
    return (
      <Stack gap="6" maxW="xs">
        <HStack width="full">
          <SkeletonCircle size="10" />
          <SkeletonText  noOfLines={2} />
        </HStack>
        <Skeleton height="200px" />
      </Stack>
    );
  }
  return (
    <div>
      <CardFormK3 title="" subtitle="" icon={null}>
        <SimpleGrid columns={2} gap={2}>
          <FormControlCard
            labelForm="AFE Number"
            isDisabled
            type={"text"}
            value={afeNumber.nomor_afe}
          />
          <FormControlCard
            labelForm="Total Anggaran"
            isDisabled
            type={"text"}
            value={afeNumber.total_budget}
          />
        </SimpleGrid>

        <FormControlCard
          labelForm="Estimasi Realisasi Biaya"
          value={afeNumber.estimated_budget}
          isDisabled
          type={"text"}
        />
      </CardFormK3>
    </div>
  );
};

export default AFENumber;
