import React, { useState, useEffect } from "react";
import { getWellMaster, getSummaryWellMaster } from "../../API/APIKKKS";
import {
  Box,
  Flex,
  Text,
  CircularProgress,
  Button,
  useToast,
  Icon,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import {
  IconPlus,
  IconCheck,
  IconBan,
  IconCylinder,
  IconEdit,
  IconTrash,
  IconEye,
} from "@tabler/icons-react";
import PerhitunganCard from "../../PageKKKS/Components/Card/CardPerhitunganBox";
import { IconClipboardList } from "@tabler/icons-react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import PaginatedTable from "../../Components/Card/PaginationTable";
import BreadcrumbCard from "../Card/Breadcrumb";

const WellMaster = () => {
  const [data, setData] = useState([]);
  const [perPageOptions] = useState([5, 10, 25, 50]);
  const [loading, setLoading] = useState(true);
  const [totalData, setTotalData] = useState(0);
  const navigate = useNavigate();
  const toast = useToast();
  const userID = JSON.parse(localStorage.getItem("user")).kkks_id;
  const [summaryData, setSummaryData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getWellMaster(userID);
        setData(response || []);
        setTotalData(response || 0);
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
  }, [userID, toast]);

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const response = await getSummaryWellMaster(userID);
        setSummaryData(response || []);
      } catch (error) {
        console.error("Error fetching summary data: ", error);
      }
    };
    fetchSummaryData();
  }, [userID]);

  const handleView = (id_well) => {
    navigate(`/wellmaster/view/${id_well}`);
  };
  const handleEdit = (id_well) => {
    navigate(`/wellmaster/edit/${id_well}`);
  };

  const handleDelete = (id_well) => {
    // Handle delete action
  };

  const actionButtons = (rowData) => (
    <Flex>
      <Button
        size="sm"
        // variant=""
        rounded={"full"}
        colorScheme="blue"
        leftIcon={<Icon as={IconEye} />}
        onClick={() => handleView(rowData.well_id)}
      >
        View
      </Button>
      <Button
        size="sm"
        // variant=""
        rounded={"full"}
        colorScheme="blue"
        leftIcon={<Icon as={IconEdit} />}
        onClick={() => handleEdit(rowData.well_id)}
        ml={2}
      >
        Edit
      </Button>
      <Button
        size="sm"
        // variant=""
        rounded={"full"}
        colorScheme="red"
        leftIcon={<Icon as={IconTrash} />}
        onClick={() => handleDelete(rowData.well_id)}
        ml={2}
      >
        Delete
      </Button>
    </Flex>
  );

  return (
    <Flex gap={4} my={6} direction={"column"}>
     <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        Well Master
      </Text>

      <BreadcrumbCard />
      
      <Flex gap={4}>
        <PerhitunganCard
          number={summaryData?.total}
          icon={IconClipboardList}
          iconColor="blue.500"
          label={"Total Sumur"}
          subLabel="Jumlah Sumur Terdaftar"
          bgIcon="blue.100"
        />
        <PerhitunganCard
          number={summaryData?.aktif}
          icon={IconCheck}
          iconColor="green.500"
          label={"Aktif"}
          subLabel="Sumur Aktif"
          bgIcon="green.100"
        />
        <PerhitunganCard
          number={summaryData?.tidak_aktif}
          icon={IconBan}
          iconColor="red.500"
          label={"Tidak Aktif"}
          subLabel="Sumur Tidak Aktif"
          bgIcon="red.100"
        />
      </Flex>

      <PaginatedTable
        jobs={data}
        loading={loading}
        perPageOptions={perPageOptions}
        totalData={totalData}
        title="Daftar Sumur"
        subtitle="Daftar Sumur Terdaftar"
        icon={IconCylinder}
        actionHeaderWidth={300}
        actionButton={
          <Button
            as={Link}
            to="form"
            leftIcon={<Icon as={IconPlus} />}
            colorScheme="blue"
            borderRadius={"full"}
          >
            Tambah Sumur
          </Button>
        }
        actionButtons={actionButtons}
        excludeColumns={["id", "well_id", "kkks_id"]}
      />
    </Flex>
  );
};

export default WellMaster;
