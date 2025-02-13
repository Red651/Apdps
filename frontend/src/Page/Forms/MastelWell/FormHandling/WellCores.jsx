import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Button,
  Flex,
  Grid,
  GridItem,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  SimpleGrid
} from "@chakra-ui/react";
import { IconTrash } from "@tabler/icons-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import CardFormK3 from "../../Components/CardFormK3";
import FormControlCard from "../../Components/FormControl";
import FormInputFile from "../../Components/FormInputFile";
import { useJobContext } from "../../../../Context/JobContext";
import { ADD_WELL_MASTER } from "../../../../Reducer/reducer";
import { fetchImage } from "../../../../Page/API/APIKKKS";
import { PostUploadPhysicalItem } from "../../../API/PostKkks";

const TableComponent = ({ data, headers, imageUrls, onImageClick }) => {
  return (
    <TableContainer>
      <Table variant="simple" colorScheme="gray">
        <Thead>
          <Tr>
            {headers.map((column, index) => (
              <Th key={index}>{column.Header}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, rowIndex) => (
            <Tr key={rowIndex}>
              {headers.map((column, colIndex) => (
                <Td key={colIndex}>
                  {column.render
                    ? column.render(
                        row,
                        rowIndex,
                        imageUrls[rowIndex],
                        onImageClick
                      )
                    : row[column.accessor]}
                </Td>
              ))}
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};

const WellCoresForm = () => {
  const { state, dispatch } = useJobContext();
  const toast = useToast();
  const data = state?.wellMaster?.well_cores;
  const clearFileInput = useRef(null);
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState({
    unit_type:
      state?.wellMaster?.unit_type || "METRICS",
    top_depth: null,
    base_depth: null,
    core_diameter: null,
    core_type: null,
    core_show_type: null,
    remark: null,
    physical_item_id: null,
  });

  // "well_cores": [
  //       {
  //         "unit_type": "METRICS",
  //         "top_depth": 0,
  //         "base_depth": 0,
  //         "core_diameter": 0,
  //         "core_type": "string",
  //         "core_show_type": "string",
  //         "remark": "string",
  //         "physical_item_id": "string"
  //       }
  //     ],
  const [imageUrls, setImageUrls] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setTableData(data);
    }
  }, [data]);

  useEffect(() => {
    const loadImages = async () => {
      const urls = await Promise.all(
        tableData.map((row) => fetchImage(row.view_path))
      );
      setImageUrls(urls);
    };
    if (tableData.length > 0) {
      loadImages();
    }
  }, [tableData]);

  const handleImageClick = (url) => {
    setSelectedImage(url);
    setIsModalOpen(true);
  };

  const validateFormData = useCallback((data) => {
    const errors = [];

    if (data.top_depth >= data.base_depth) {
      errors.push("Top depth harus lebih kecil dari Base depth");
    }

    if (!data.image_file_id) {
      errors.push("Image harus diupload");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const handleChangeData = useCallback(
    (name, type) => (e) => {
      let value = e.target.value;
      if (type === "number") {
        value = value.includes(".") ? parseFloat(value) : parseInt(value, 10);
        if (isNaN(value)) value = null;
      } else if (type === "text") {
        value = String(value);
      }

      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    },
    []
  );

  const handleFileSelect = useCallback((file) => {
    setFormData((prevData) => ({
      ...prevData,
      image_file: file,
    }));
  }, []);

  const handleAddData = useCallback(async () => {
    setIsLoading(true);

    try {
      if (!formData.image_file) {
        toast({
          title: "Error",
          description: "Please select an image file",
          status: "error",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
        setIsLoading(false);
        return;
      }

      const formDataUpload = new FormData();
      formDataUpload.append("file", formData.image_file);

      const uploadResponse = await PostUploadPhysicalItem(formDataUpload);

      if (uploadResponse.data.success) {
        const imageFileId = uploadResponse.data.data.physical_item_info.physical_item_id;

        const newFormData = {
          ...formData,
          image_file_id: imageFileId,
          top_depth: Number(formData.top_depth),
          base_depth: Number(formData.base_depth),
          core_diameter: Number(formData.core_diameter),
          physical_item_id: imageFileId,
          core_type: formData.core_type,
          core_show_type: formData.core_show_type,
          remark: formData.remark,
        };

        const { isValid, errors } = validateFormData(newFormData);

        if (!isValid) {
          toast({
            title: "Validation Error",
            description: errors.join("\n"),
            status: "error",
            duration: 3000,
            isClosable: true,
            position: "top",
          });
          setIsLoading(false);
          return;
        }

        const newCore = {
          unit_type: newFormData.unit_type,
          image_file_id: imageFileId,
          top_depth: newFormData.top_depth,
          base_depth: newFormData.base_depth,
          view_path: `/utils/view-image/file/${imageFileId}`,
          delete_path: `/utils/delete/file/${imageFileId}`,
          core_diameter: newFormData.core_diameter,
          core_type: newFormData.core_type,
          core_show_type: newFormData.core_show_type,
          remark: newFormData.remark,
          physical_item_id: newFormData.physical_item_id,
        };

        const updatedTableData = [...tableData, newCore];

        setTableData(updatedTableData);
        dispatch({
          type: ADD_WELL_MASTER,
          payload: {
            ...state.wellMaster,
                well_cores: updatedTableData.length == 0 ? null : updatedTableData,
              },
        });

        // Reset form
        setFormData({
          unit_type:
            state?.wellMaster?.unit_type ||
            "METRICS",
          top_depth: "",
          base_depth: "",
          image_file_id: "",
          image_file: "",
          core_diameter: "",
          core_type: "",
          core_show_type: "",
          remark: "",
        });

        // Clear file input
        if (clearFileInput.current) {
          clearFileInput.current();
        }

        toast({
          title: "Success",
          description: "Data well cores berhasil ditambahkan",
          status: "success",
          duration: 3000,
          isClosable: true,
          position: "top",
        });
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Error",
        description:
          error.response?.data?.message ||
          "Gagal mengupload file. Silakan coba lagi.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    formData,
    tableData,
    dispatch,
    state.wellMaster,
    validateFormData,
    toast,
  ]);

  const handleDelete = useCallback(
    (index) => {
      const updatedTableData = tableData.filter((_, idx) => idx !== index);
      setTableData(updatedTableData);
      dispatch({
        type: ADD_WELL_MASTER,
        payload: {
          ...state.wellMaster,
              well_cores: updatedTableData.length == 0 ? null : updatedTableData,
            },
      });

      toast({
        title: "Success",
        description: "Data berhasil dihapus",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    },
    [tableData, dispatch, state.wellMaster, toast]
  );

  const headers = [
    { Header: "Top Depth", accessor: "top_depth" },
    { Header: "Base Depth", accessor: "base_depth" },
    { Header: "Core Diameter", accessor: "core_diameter" },
    { Header: "Core Type", accessor: "core_type" },
    { Header: "core show Type", accessor: "core_show_type" },
    { Header: "remark", accessor: "remark" },
    {
      Header: "Image",
      accessor: "image_file_id",
      render: (row, rowIndex) => (
        <img
          src={imageUrls[rowIndex]}
          alt="Well Cores"
          style={{
            width: "50px",
            height: "50px",
            objectFit: "cover",
            cursor: "pointer",
          }}
          onClick={() => handleImageClick(imageUrls[rowIndex])}
        />
      ),
    },
    {
      Header: "Action",
      accessor: "actions",
      render: (row, rowIndex) => (
        <Button
          colorScheme="red"
          variant="outline"
          leftIcon={<IconTrash size={16} />}
          onClick={() => handleDelete(rowIndex)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Grid templateColumns="repeat(2, 1fr)" mt={6} gap={4} fontFamily={"Mulish"}>
      <GridItem>
        <CardFormK3
          title="Well Cores"
          padding="36px 28px"
          subtitle="Cores Details"
          OptionDepth={["MSL", "KB", "GL"]}
          OptionDepthStatus={true}
        >
          <SimpleGrid columns={2} gap={2}>
            <FormControlCard
              labelForm="Top Depth"
              placeholder="Enter Top Depth"
              type="number"
              value={formData.top_depth}
              handleChange={handleChangeData("top_depth", "number")}
            />
            <FormControlCard
              labelForm="Base Depth"
              placeholder="Enter Base Depth"
              type="number"
              value={formData.base_depth}
              handleChange={handleChangeData("base_depth", "number")}
            />
            {/* ================================= */}
             <FormControlCard
              labelForm="Core Diameter"
              placeholder="Enter core_diameter"
              type="number"
              value={formData.core_diameter}
              handleChange={handleChangeData("core_diameter", "number")}
            />
            <FormControlCard
              labelForm="Core Type"
              placeholder="Enter core_type"
              type="text"
              value={formData.core_type}
              handleChange={handleChangeData("core_type", "text")}
            />
            <FormControlCard
              labelForm="Core Show Type"
              placeholder="Enter core_show_type"
              type="text"
              value={formData.core_show_type}
              handleChange={handleChangeData("core_show_type", "text")}
            />
            <FormControlCard
              labelForm="Remark"
              placeholder="Enter remark"
              type="text"
              value={formData.remark}
              handleChange={handleChangeData("remark", "text")}
            />
          </SimpleGrid>
          <FormInputFile
            label="Upload Image"
            acceptedFormats=".jpg,.jpeg,.png"
            onFileSelect={handleFileSelect}
            onClearFile={(clearFn) => {
              clearFileInput.current = clearFn;
            }}
          />
          <Flex mt={4} justifyContent="flex-end">
            <Button
              colorScheme="blue"
              variant="solid"
              onClick={handleAddData}
              isLoading={isLoading}
              loadingText="Adding..."
              isDisabled={isLoading}
            >
              Add
            </Button>
          </Flex>
        </CardFormK3>
      </GridItem>
      <Box rounded="lg" overflowX="auto" borderWidth="1px" p={0}>
        <GridItem>
          <TableComponent
            data={tableData}
            headers={headers}
            imageUrls={imageUrls}
            onImageClick={handleImageClick}
          />
        </GridItem>
      </Box>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="5xl"
        isCentered
      >
        <ModalOverlay />
        <ModalContent margin="auto" width="auto" maxW="unset">
          <ModalHeader>Preview Image</ModalHeader>
          <ModalCloseButton />
          <ModalBody padding={4}>
            {selectedImage && (
              <TransformWrapper
                initialScale={1}
                initialPositionX={0}
                initialPositionY={0}
              >
                {({ zoomIn, zoomOut, resetTransform }) => (
                  <Flex direction="column">
                    <Flex mb={4} gap={2}>
                      <Button onClick={() => zoomIn()}>Zoom In</Button>
                      <Button onClick={() => zoomOut()}>Zoom Out</Button>
                      <Button onClick={() => resetTransform()}>Reset</Button>
                    </Flex>
                    <Box
                      maxH={`calc(90vh - 140px)`}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <TransformComponent>
                        <img
                          src={selectedImage}
                          alt="Selected Well Cores"
                          style={{
                            maxWidth: "90vw",
                            maxHeight: "calc(90vh - 150px)",
                            objectFit: "contain",
                            borderRadius: "10px",
                          }}
                        />
                      </TransformComponent>
                    </Box>
                  </Flex>
                )}
              </TransformWrapper>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Grid>
  );
};

export default WellCoresForm;
