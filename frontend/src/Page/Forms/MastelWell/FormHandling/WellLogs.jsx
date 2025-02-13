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
  Input,
  FormControl,
  FormLabel,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  InputGroup,
  InputRightAddon,
  IconButton,
  Icon
} from "@chakra-ui/react";
import {
  IconTrash,
  IconDownload,
  IconEdit,
  IconX,
  IconPencil,
  IconPlus,
} from "@tabler/icons-react";
import CardFormK3 from "../../Components/CardFormK3";
import { useJobContext } from "../../../../Context/JobContext";
import { ADD_WELL_MASTER } from "../../../../Reducer/reducer";
import { PostUploadFile } from "../../../API/PostKkks";
import { pathExecute } from "../../../../Page/API/APIKKKS";
import FormInputFile from "../../Components/FormInputFile";
const TableComponent = ({ data, onDelete, onDownload, onEdit }) => {
  return (
    <TableContainer>
      <Table variant="simple" colorScheme="gray">
        <Thead>
          <Tr>
            <Th>Filename</Th>
            <Th>Top Depth</Th>
            <Th>Base Depth</Th>
            <Th>Logs</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, index) => (
            <Tr key={index}>
              <Td>{row.filename}</Td>
              <Td>{row.top_depth}</Td>
              <Td>{row.base_depth}</Td>
              <Td>{row.logs}</Td>
              <Td>
                <Flex gap={2}>
                  <IconButton
                    icon={<Icon as={IconDownload} size={16} />}
                    colorScheme="green"
                    variant="solid"
                    aria-label="Download"
                    borderRadius={"full"}
                    size={"sm"}
                    onClick={() => onDownload(row.download_path, row.filename)}
                  />
                  <IconButton
                    icon={<Icon as={IconEdit} size={16} />}
                    colorScheme="yellow"
                    variant="solid"
                    aria-label="Edit"
                    borderRadius={"full"}
                    size={"sm"}
                    onClick={() => onEdit(index)}
                  />
                  <IconButton
                    icon={<Icon as={IconTrash} size={16} />}
                    colorScheme="red"
                    variant="solid"
                    aria-label="Delete"
                    borderRadius={"full"}
                    size={"sm"}
                    onClick={() => onDelete(index)}
                  />
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
const WellLogsForm = () => {
  const { state, dispatch } = useJobContext();
  const toast = useToast();
  const initialLogsData = state?.wellMaster?.well_logs || [];
  const [tableData, setTableData] = useState(initialLogsData);
  const [formData, setFormData] = useState({
    unit_type : state?.wellMaster?.unit_type || "METRICS",
    file: null,
    top_depth: "",
    base_depth: "",
    logs: "",
    // filename: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);
  const clearFileInput = useRef(null);

  const unitType =
    state?.wellMaster?.unit_type || "METRICS";

  useEffect(() => { 
    setTableData(initialLogsData);
  }, []);

  const handleChange = (name) => (e) => {
    const value = name === "file" ? e.target.files[0] : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "top_depth" || name === "base_depth"
          ? parseFloat(value) || ""
          : value,
      ...(name === "file" ? { filename: value ? value.name : "" } : {}),
    }));
  };

  const handleAddData = useCallback(async () => {
    setIsLoading(true);
    
    // Validasi file
    if (!formData.file) {
      showToast("Error", "Please select a file", "error");
      setIsLoading(false);
      return;
    }
    
    // Validasi depth
    if (!formData.top_depth || !formData.base_depth) {
      showToast("Error", "Please enter top and base depths", "error");
      setIsLoading(false);
      return;
    }
    
    if (formData.top_depth >= formData.base_depth) {
      showToast("Error", "Top depth must be less than base depth", "error");
      setIsLoading(false);
      return;
    }
    
    try {
      let fileId;
      
      if (editIndex !== null) {
        // Jika edit dan file tidak diubah, gunakan ID file yang sama
        fileId = tableData[editIndex].physical_item_id;
        
        // Jika file diubah, upload file baru
        if (formData.file instanceof File) {
          const uploadResponse = await uploadFile(formData.file);
          
          if (
            uploadResponse &&
            uploadResponse.data &&
            uploadResponse.data.success
          ) {
            fileId = uploadResponse.data.data.file_info.id;
          } else {
            throw new Error(uploadResponse?.data?.message || "Upload failed");
          }
        }
      } else {
        // Upload file baru
        const uploadResponse = await uploadFile(formData.file);
        
        if (
          uploadResponse &&
          uploadResponse.data &&
          uploadResponse.data.success
        ) {
          fileId = uploadResponse.data.data.file_info.id;
        } else {
          throw new Error(uploadResponse?.data?.message || "Upload failed");
        }
      }
      
      const newLog = createLogEntry(fileId);
      
      let updatedTableData;
      if (editIndex !== null) {
        // Mode Edit
        updatedTableData = tableData.map((item, index) =>
          index === editIndex ? newLog : item
        );
        setEditIndex(null);
      } else {
        // Mode Tambah
        updatedTableData = [...tableData, newLog];
      }
      
      updateTableData(updatedTableData);
      
      // Reset form dan file input
      resetForm();
      
      // Tambahan: Pastikan file input direset
      if (clearFileInput.current) {
        clearFileInput.current();
      }
      
      showToast(
        "Success",
        editIndex !== null ? "Well log updated" : "Well log added",
        "success"
      );
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Upload failed. Please try again.";
      showToast("Upload Error", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  }, [formData, tableData, editIndex]);

  const uploadFile = async (file) => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    return await PostUploadFile(formDataUpload);
  };

  const createLogEntry = (fileId) => ({
    unit_type : state?.wellMaster?.unit_type || "METRICS",
    download_path: `/utils/download/file/${fileId}`,
    remove_path: `/utils/delete/file/${fileId}`,
    // filename: formData.file.name,
    top_depth: formData.top_depth,
    base_depth: formData.base_depth,
    logs: formData.logs,
    physical_item_id: fileId,
  });

  const updateTableData = (updatedData) => {
    setTableData(updatedData);
    dispatch({
      type: ADD_WELL_MASTER,
      payload: {
        ...state.wellMaster,
        well_logs: updatedData.length === 0 ? null : updatedData,
      },
    });
  };

  const resetForm = () => {
    setFormData({
      file: null,
      top_depth: "",
      base_depth: "",
      logs: "",
      filename: "",
      physical_item_id: "",
    });
    // Pastikan clearFileInput sudah di-set sebelum memanggilnya
  if (clearFileInput.current) {
    clearFileInput.current();
  }
  };

  const showToast = (title, description, status) => {
    toast({ title, description, status, duration: 3000, isClosable: true });
  };

  const handleDelete = useCallback(async (index) => {
    setDeleteIndex(index);
    setAlertOpen(true);
  }, []);

  const confirmDelete = async () => {
    if (deleteIndex !== null) {
      const logToDelete = tableData[deleteIndex];
      try {
        const deleteResponse = await pathExecute(
          logToDelete.remove_path,
          "delete"
        );
        if (deleteResponse) {
          const updatedTableData = tableData.filter(
            (_, idx) => idx !== deleteIndex
          );
          updateTableData(updatedTableData);
          showToast("Success", "Data deleted", "success");
        } else {
          showToast(
            "Delete Error",
            "Failed to delete the file. Please try again.",
            "error"
          );
        }
      } catch (error) {
        showToast(
          "Delete Error",
          "An error occurred while deleting the file.",
          "error"
        );
      } finally {
        setAlertOpen(false);
        setDeleteIndex(null);
      }
    }
  };

  const handleDownload = async (filePath, originalFileName) => {
    const responseData = await pathExecute(filePath, "get");
    if (responseData) {
      const fileBlob = new Blob([responseData], {
        type: "application/octet-stream",
      });
      const fileURL = window.URL.createObjectURL(fileBlob);
      const downloadLink = document.createElement("a");
      downloadLink.href = fileURL;
      downloadLink.download = originalFileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      window.URL.revokeObjectURL(fileURL);
    } else {
      showToast(
        "Download Error",
        "Failed to download the file. Please try again.",
        "error"
      );
    }
  };

  const handleEdit = (index) => {
    const selectedLog = tableData[index];
    setFormData({
      file: {
        name: selectedLog.filename,
        // Tambahkan properti lain jika diperlukan
      },
      top_depth: selectedLog.top_depth,
      base_depth: selectedLog.base_depth,
      logs: selectedLog.logs,
      filename: selectedLog.filename,
      physical_item_id: selectedLog.physical_item_id,
    });
    setEditIndex(index);
  };
  return (
    <>
      <Grid templateColumns="repeat(2, 1fr)" mt={6} gap={4}>
        <GridItem>
          <CardFormK3
            title="Well Logs"
            padding="36px 28px"
            subtitle="Log Details"
          >
            <Flex gap={2} direction="column">
              <FormControl>
                <FormLabel>Top Depth</FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    value={formData.top_depth}
                    onChange={handleChange("top_depth")}
                    placeholder="Input Top Depth"
                  />
                  <InputRightAddon>
                    {unitType === "METRICS" ? "m" : "ft"}
                  </InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Base Depth</FormLabel>
                <InputGroup>
                  <Input
                    type="number"
                    value={formData.base_depth}
                    onChange={handleChange("base_depth")}
                    placeholder="Input Base Depth"
                  />
                  <InputRightAddon>
                    {unitType === "METRICS" ? "m" : "ft"}
                  </InputRightAddon>
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Logs</FormLabel>
                <InputGroup>
                  <Input
                    type="text"
                    value={formData.logs}
                    onChange={handleChange("logs")}
                    placeholder="Input Logs"
                  />
                </InputGroup>
              </FormControl>
              <FormControl mt={5}>
                <FormInputFile
                  label="Upload File"
                  onFileSelect={(file) => {
                    setFormData((prev) => ({ ...prev, file }));
                  }}
                  onClearFile={(clearFn) => {
                    clearFileInput.current = clearFn;
                  }}
                  existingFile={
                    formData?.file?.name
                      ? {
                          filename: formData.file?.name,
                          file_id: formData.physical_item_id,
                        }
                      : null
                  }
                  onDownload={() => handleDownload(`/utils/download/file/${formData.physical_item_id}`, formData.file?.name)}
                  onDelete={() => setIsDeleteAlertOpen(true)}
                />
              </FormControl>
            </Flex>
            <Flex mt={4} justifyContent="flex-end" gap={2}>
              {editIndex !== null ? (
                <>
                  <Button
                    colorScheme="yellow"
                    onClick={handleAddData}
                    isLoading={isLoading}
                    leftIcon={<Icon as={IconPencil} />}
                    borderRadius="full"
                  >
                    Edit
                  </Button>
                  <Button
                    colorScheme="gray"
                    onClick={() => {
                      setEditIndex(null);
                      resetForm();
                    }}
                    leftIcon={<Icon as={IconX} />}
                    borderRadius="full"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  colorScheme="blue"
                  onClick={handleAddData}
                  isLoading={isLoading}
                  borderRadius="full"
                  leftIcon={<Icon as={IconPlus} />}
                >
                  Add
                </Button>
              )}
            </Flex>
          </CardFormK3>
        </GridItem>
        <Box rounded="lg" overflowX="auto" borderWidth="1px" p={0}>
          <GridItem>
            <TableComponent
              data={tableData}
              onDelete={handleDelete}
              onDownload={(downloadPath, filename) => handleDownload(downloadPath, filename)}
              onEdit={handleEdit}
            />
          </GridItem>
        </Box>
      </Grid>
      <AlertDialog isOpen={isAlertOpen} onClose={() => setAlertOpen(false)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete File
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this file? This action cannot be
              undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button onClick={() => setAlertOpen(false)}>Cancel</Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};
export default WellLogsForm;
