import { GetViewPlanning, GetDatas } from "../API/APISKK";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import InlineSVG from "react-inlinesvg";
import { Box, Flex } from '@chakra-ui/react'

const ViewPlanning = () => {
  const [planningData, setPlanningData] = useState();
  const [wbs, setWbs] = useState([]);
  const { job_id } = useParams();

  const wbsData = planningData?.operational.work_breakdown_structure.plot.path;
  // 

  useEffect(() => {
    const fetchData = async () => {
      const response = await GetViewPlanning(job_id);
      setPlanningData(response.data);
    };
      
    const fetchDataWBS = async () => {
        const response = await GetDatas(wbsData);
        setWbs(response);
      };
      fetchData();
      fetchDataWBS();
  }, []);


  // 
  return (
    <>
      <h1>asdasd</h1>
      <Box border="1px solid black" padding="4" w="100%" overflowY={"auto"} >
        <InlineSVG src={wbs} />
      </Box>
    </>
  );
};

export default ViewPlanning;
