import { useState, useEffect } from "react";
import { getWellMaster, getWellMasterSummary } from "../API/APISKK";
import {
  Flex,
  Text,
  Badge,
  Icon,
  IconButton,
  Tooltip,
  Skeleton,
} from "@chakra-ui/react";
import {
  IconClipboardList,
  IconEye,
  IconCheck,
  IconBan,
} from "@tabler/icons-react";
import PerhitunganCard from "../PageSKK/Components/Card/CardPerhitunganBox";
import { Link } from "react-router-dom";
import PaginatedTable from "../Components/Card/PaginationTable";
import BreadcrumbCard from "../Components/Card/Breadcrumb";

const WellMasterSKK = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getWellMaster();
        setData(response || []);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const response = await getWellMasterSummary();
        setSummary(response || {});
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const StatusBadge = ({ status }) => {
    const colorScheme = status === "Active" ? "green" : "red";

    return (
      <Badge
        colorScheme={colorScheme}
        py={2}
        px={4}
        w={150}
        textAlign={"center"}
        borderRadius="full"
      >
        {status}
      </Badge>
    );
  };

  return (
    <Flex direction="column" gap={6}>
      <Text
        fontSize={"2em"}
        fontWeight={"bold"}
        color={"gray.600"}
        fontFamily={"Mulish"}
      >
        Well Master
      </Text>
      <BreadcrumbCard />
      <Flex gap={6} justifyContent="space-between">
        <PerhitunganCard
          number={summary?.total || <Skeleton height="30px" width="100px" />}
          icon={IconClipboardList}
          iconColor="blue.500"
          label={"Total Sumur"}
          subLabel="Jumlah Sumur Terdaftar"
          bgIcon="blue.100"
        />
        <PerhitunganCard
          number={summary?.aktif || <Skeleton height="30px" width="100px" />}
          icon={IconCheck}
          iconColor="green.500"
          label={"Aktif"}
          subLabel="Sumur Aktif"
          bgIcon="green.100"
        />
        <PerhitunganCard
          number={
            summary?.tidak_aktif || <Skeleton height="30px" width="100px" />
          }
          icon={IconBan}
          iconColor="red.500"
          label={"Tidak Aktif"}
          subLabel="Sumur Tidak Aktif"
          bgIcon="red.100"
        />
      </Flex>

      <PaginatedTable
        jobs={data || []}
        loading={loading}
        title={"Well Master"}
        subtitle={"Data sumur yang terdaftar"}
        excludeColumns={["well_id", "kkks_id"]}
        actionHeader={null}
        actionButtons={(well) => (
          <Flex gap={2}>
            <Tooltip label="View">
              <IconButton
                colorScheme="blue"
                size="sm"
                as={Link}
                to={`/view/well/${well.well_id}/`}
                icon={<Icon as={IconEye} />}
                rounded="full"
                aria-label="View"
              />
            </Tooltip>
          </Flex>
        )}
      />
    </Flex>
  );
};

export default WellMasterSKK;
