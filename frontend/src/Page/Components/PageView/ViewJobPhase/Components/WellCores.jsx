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
  Button,
  useToast,
} from "@chakra-ui/react";
import { fetchImage, pathExecute } from "../../../../API/APIKKKS";
import CardFormK3 from "../../../../Forms/Components/CardFormK3";

const WellCores = ({ data, title, subTitle, type }) => {
  const [wellData, setWellData] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalImageUrl, setModalImageUrl] = useState("");

  let DataData;

  const toast = useToast();

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

  useEffect(() => {
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

  const renderValue = (value, header, item) => {
    if (header === "image_path" && value) {
      const imageUrl = imageUrls[value];
      if (imageUrl) {
        return (
          <div onClick={() => openModal(imageUrl)}>
            <img src={imageUrl} alt="Gambar Sumur" width="50" height="50" />
          </div>
        );
      } else {
        return <div>Memuat...</div>;
      }
    }

    if (header === "view_path") {
      return (
        <Button
          colorScheme="blue"
          size="sm"
          onClick={() => openModal(imageUrls[item.image_path])}
        >
          View
        </Button>
      );
    }

    if (header === "delete_path") {
      return (
        <Button
          colorScheme="red"
          size="sm"
          onClick={() => handleDelete(value, item)}
        >
          Delete
        </Button>
      );
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

  const handleDelete = async (deletePath, itemToDelete) => {
    try {
      const response = await pathExecute(deletePath, "delete");
      if (response !== null) {
        setWellData((prevData) =>
          prevData.filter((item) => item !== itemToDelete)
        );
        toast({
          title: "Berhasil menghapus data",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        throw new Error("Gagal menghapus data");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      toast({
        title: "Gagal menghapus data",
        description: "Terjadi kesalahan saat menghapus data",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  if (!Array.isArray(wellData) || wellData.length === 0) {
    return <div>Tidak ada data tersedia</div>;
  }

  return (
    <CardFormK3
      title={title}
      padding="36px 28px"
      w={"71vw"}
      subtitle={subTitle}
    >
      <TableContainer overflowX={"auto"}>
        <Table variant="striped">
          <Thead>
            <Tr>
              <Th>No</Th>
              {getTableHeadersData().map((header, index) => (header === "physical_item_id" || header === "delete_path" ? null : (
                <Th key={index}>{header}</Th>
              )))}
            </Tr>
          </Thead>
          <Tbody>
            {wellData.map((item, index) => (
              <Tr key={index}>
                <Td>{index + 1}</Td>
                {Object.entries(item).map(([header, value], idx) => (header === "physical_item_id" || header === "delete_path" ? null : (
                  <Td key={idx}>{renderValue(value, header, item)}</Td>
                )))}
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalCloseButton />
          <ModalBody>
            <Image src={modalImageUrl} alt="Pratinjau Gambar" width="100%" />
          </ModalBody>
        </ModalContent>
      </Modal>
    </CardFormK3>
  );
};

export default WellCores;
