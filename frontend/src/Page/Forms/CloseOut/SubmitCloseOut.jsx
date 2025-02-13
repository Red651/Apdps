import React from "react";
import CardFormK3 from "../Components/CardFormK3";
import { FaPlus } from "react-icons/fa";
import { Button, SimpleGrid, useToast } from "@chakra-ui/react";
import FormControlCard from "../Components/FormControl";
import FinalyBudget from "./FormHanding/FinalyBudget";
import OtherDocuments from "./FormHanding/OtherDocuments";
import { postCloseOut } from "../../API/PostKkks";
import { useParams } from "react-router-dom";

const SubmitCloseOut = () => {
  const { job_id } = useParams();
  const toast = useToast();
  const [data, setData] = React.useState({
    final_budget: 0,
    dokumen_lainnya: [
      {
        file_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        filename: "string",
      },
    ],
  });

  const handleSubmit = async () => {
    try {
      const response = await postCloseOut(job_id, data);
      toast({
        title: "Success",
        description: response.message,
        status: "success",
        duration: 5000,
        isClosable: true,
        
      })
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      return response;
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  const actionButtonToSubmit = () => {
    return (
      <Button colorScheme="blue" onClick={handleSubmit}>
        Save
      </Button>
    );
  };
  const handleChange = (data) => {
    setData((prevData) => ({ ...prevData, ...data }));
  };
  return (
    <CardFormK3
      title="Update Close Out"
      actionButton={actionButtonToSubmit()}
      subtitle=""
      mt={4}
      icon={FaPlus}
    >
      <FinalyBudget onChange={handleChange} />
      <OtherDocuments
        onChange={(e, data) =>
          setData((prev) => ({ ...prev, dokumen_lainnya: data }))
        }
      />
    </CardFormK3>
  );
};

export default SubmitCloseOut;
