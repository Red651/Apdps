import React from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import { Button, SimpleGrid } from "@chakra-ui/react";
import axios from "axios";
import { useParams } from "react-router-dom";

const FinalyBudget = ({onChange}) => {
  const { job_id } = useParams();
  const [afeNumber, setAfeNumber] = React.useState({
    final_budget: null,
  });

  React.useEffect(()=> {
    onChange(afeNumber)
  },[afeNumber])
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_APP_URL}/job/co/${job_id}/get`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setAfeNumber((prev) => ({
          ...prev,
          final_budget: response.data.data.final_budget,
        }));
        return;
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <CardFormK3 title="" subtitle="" icon={null}>
        {/* <SimpleGrid columns={2} gap={2}>
          <FormControlCard
            labelForm="AFE Number"
            type={"text"}
            value={afeNumber.nomor_afe}
          />
          <FormControlCard
            labelForm="Total Anggaran"
            type={"text"}
            // value={afeNumber.total_budget}
          />
        </SimpleGrid> */}

        <FormControlCard
          labelForm="Finalisasi Realisasi Biaya Oleh Keuangan"
          value={afeNumber.final_budget}
          type={"text"}
        />
      </CardFormK3>
    </>
  );
};

export default FinalyBudget;
