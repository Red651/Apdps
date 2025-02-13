import { useEffect, useState } from "react";
import {
  Flex,
  Box,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
} from "@chakra-ui/react";
import { fetchImage } from "../../../../API/APIKKKS";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";

const WellData = ({ data, title, subTitle, type }) => {
  const [wellData, setWellData] = useState([]);

  const [imageUrls, setImageUrls] = useState({});
  let DataData;

  switch (type) {
    case "actual":
      DataData = data?.actual;
      break;
    case "plan":
      DataData = data?.plan;
      break;
    default:
      DataData = data;
      break;
  }

  useEffect(() => {
    const fetchWellData = async () => {
      if (!DataData) return;
      try {
        setWellData(Array.isArray(DataData) ? DataData : [DataData]);

        const imagePaths = DataData.map((item) => item.image_path);
        imagePaths.forEach((imagePath) => {
          if (imagePath) {
            fetchAndStoreImage(imagePath);
          }
        });
      } catch (error) {
        console.error("Error fetching well Data data:", error);
      }
    };

    fetchWellData();
  }, [DataData]);

  const fetchAndStoreImage = async (imagePath) => {
    const imageUrl = await fetchImage(imagePath);
    if (imageUrl) {
      setImageUrls((prevUrls) => ({
        ...prevUrls,
        [imagePath]: imageUrl,
      }));
    }
  };

  const getTableHeadersData = () => {
    if (wellData && wellData.length > 0) {
      return Object.keys(wellData[0]);
    }
    return [];
  };

  const renderValue = (value, header) => {
    if (header === "image_path" && value) {
      const imageUrl = imageUrls[value];
      if (imageUrl) {
        return <img src={imageUrl} alt="Well Image" width="50" height="50" />;
      } else {
        return <div>Loading...</div>;
      }
    }

    if (value === null || value === undefined) return "-";

    if (typeof value === "object") {
      return value?.value || JSON.stringify(value) || "-";
    }

    return value.toString();
  };

  if (!Array.isArray(wellData) || wellData.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <Flex direction="column" width="100%" maxW={"71vw"}>
      <CardFormK3 title={title} padding="36px 28px" subtitle={type}>
        <TableContainer overflowX={"auto"}>
          <Table variant="striped">
            <Thead>
              <Tr>
                {getTableHeadersData().map((header, index) => (
                  <Th key={index}>{header}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {wellData.map((item, index) => (
                <Tr key={index}>
                  {Object.entries(item).map(([header, value], idx) => (
                    <Td key={idx}>{renderValue(value, header)}</Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </CardFormK3>
    </Flex>
  );
};

export default WellData;
