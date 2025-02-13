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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  Image,
} from "@chakra-ui/react";
import { fetchImage } from "../../../../API/APIKKKS";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";

const WellData = ({ data, title, subTitle, type = "none" }) => {
  const [wellData, setWellData] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [modalImageUrl, setModalImageUrl] = useState(""); // State to store the image URL for modal

  let DataData;

  switch (type) {
    case "actual":
      DataData = data.actual;
      break;
    case "plan":
      DataData = data.plan;
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

        const imagePaths = DataData.map((item) => item.image_path || item.view_path);
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
      return Object.keys(wellData[0]).filter((header) => !["physical_item_id", "delete_path"].includes(header)).map((header) => header.replace(/_/g, " "));
    }
    return [];
  };

  const renderValue = (value, header) => {
    if (header === "image_path" || header === "view_path" && value) {
      const imageUrl = imageUrls[value];
      if (imageUrl) {
        return (
          <div onClick={() => openModal(imageUrl)}>
            <img src={imageUrl} alt="Well Image" width="50" height="50" />
          </div>
        );
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

  const openModal = (imageUrl) => {
    setModalImageUrl(imageUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalImageUrl("");
  };

  if (!Array.isArray(wellData) || wellData.length === 0) {
    return <div>No data available</div>;
  }

  return (
    <CardFormK3 title={title} padding="36px 28px" w={"71vw"} subtitle={subTitle}>
      <TableContainer overflowX={"auto"}>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>No</Th>
              {getTableHeadersData().map((header, index) => (
                <Th key={index}>{header}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {wellData.map((item, index) => (
              <Tr key={index}>
                <Td>{index + 1}</Td>
                {Object.entries(item).map(([header, value], idx) => (header === "physical_item_id" || header === "delete_path" ? null : (
                  <Td key={idx}>{renderValue(value, header)}</Td>
                )))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      {/* Modal for image preview */}
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Image src={modalImageUrl} alt="Preview Image" width="100%" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </CardFormK3>
  );
};

export default WellData;

