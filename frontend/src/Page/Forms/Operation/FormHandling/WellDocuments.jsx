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
  Select,
  FormControl,
  FormLabel,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Text,
  IconButton,
  Icon,
} from "@chakra-ui/react";
import {
  IconTrash,
  IconDownload,
  IconEdit,
  IconPlus,
  IconX,
  IconTable,
} from "@tabler/icons-react";
import CardFormK3 from "../../Components/CardFormK3";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";
import { PostUploadFile } from "../../../API/PostKkks";
import { pathExecute } from "../../../../Page/API/APIKKKS";
import FormInputFile from "../../Components/FormInputFile";
const TableComponent = ({ data, onDelete, onDownload, onEdit }) => {
  return (
    <TableContainer>
      <Table variant="simple" colorScheme="gray">
        <Thead>
          <Tr backgroundColor={"gray.100"}>
            <Th>Document Type</Th>
            <Th>Filename</Th>
            <Th>Remarks</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row, index) => (
            <Tr key={index}>
              <Td>{row.document_type}</Td>
              <Td>{row.filename}</Td>
              <Td>{row.remark}</Td>
              <Td>
                <Flex gap={2}>
                  <IconButton
                    icon={<IconDownload size={16} />}
                    colorScheme="blue"
                    variant="solid"
                    onClick={() => onDownload(row.download_path, row.filename)}
                    aria-label="Download"
                    borderRadius={"full"}
                    size={"sm"}
                  />
                  <IconButton
                    icon={<IconEdit size={16} />}
                    colorScheme="yellow"
                    variant="solid"
                    onClick={() => onEdit(index)}
                    aria-label="Edit"
                    borderRadius={"full"}
                    size={"sm"}
                  />
                  <IconButton
                    icon={<IconTrash size={16} />}
                    colorScheme="red"
                    variant="solid"
                    onClick={() => onDelete(index)}
                    aria-label="Delete"
                    borderRadius={"full"}
                    size={"sm"}
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
const WellDocuments = () => {
  const { state, dispatch } = useJobContext();
  const toast = useToast();
  const initialLogsData =
    state?.initialOperationData?.actual_job?.well?.well_documents || [];

  const [tableData, setTableData] = useState(initialLogsData);
  const [formData, setFormData] = useState({
    document_type: "Well Report",
    file: null,
    remark: null,
    filename: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setAlertOpen] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [editIndex, setEditIndex] = useState(null);

  const clearFileInput = useRef(null);
  const handleChange = (name) => (e) => {
    const value = name === "file" ? e.target.files[0] : e.target.value;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "file" ? { filename: value.name } : {}),
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
  
  
    // Validasi nama file duplikat
    const isDuplicateFile = tableData.some((item, index) => {
      // Abaikan file yang sedang diedit
      if (editIndex !== null && index === editIndex) {
        return false;
      }
      return item.filename === formData.file.name;
    });
  
  
    // Jika file duplikat ditemukan
    if (isDuplicateFile) {
      showToast(
        "Duplicate File", 
        "A file with the same name already exists.", 
        "error"
      );
      setIsLoading(false);
      return;
    }
  
  
    // Validasi ekstensi file (opsional)
    const allowedExtensions = [
      'pdf', 'doc', 'docx', 'xls', 'xlsx', 
      'txt', 'jpg', 'jpeg', 'png', 'csv'
    ];
    const fileExtension = formData.file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      showToast(
        "Invalid File Type", 
        `Only ${allowedExtensions.join(', ')} files are allowed.`, 
        "error"
      );
      setIsLoading(false);
      return;
    }
  
  
    // Validasi ukuran file (opsional)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (formData.file.size > maxFileSize) {
      showToast(
        "File Too Large", 
        "File size should not exceed 10MB.", 
        "error"
      );
      setIsLoading(false);
      return;
    }
  
  
    try {
      let fileId;
      if (editIndex !== null) {
        // Jika dalam mode edit dan file tidak diubah
        fileId = tableData[editIndex].file_id;
      } else {
        // Jika menambah file baru
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
      resetForm();
      showToast(
        "Success",
        editIndex !== null ? "Document updated" : "Document added",
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
    file_id: fileId,
    filename: formData.file.name,
    document_type: formData.document_type,
    download_path: `/utils/download/file/${fileId}`,
    remove_path: `/utils/delete/file/${fileId}`,
    remark: formData.remark,
  });
  const updateTableData = (updatedData) => {
    setTableData(updatedData);
    dispatch({
      type: UPDATE_OPERATION_DATA,
      payload: {
        ...state.initialOperationData,
        actual_job: {
          ...state.initialOperationData.actual_job,
          well: {
            ...state.initialOperationData.actual_job.well,
            well_documents: updatedData.length == 0 ? null : updatedData,
          },
        },
      },
    });
  };
  const resetForm = () => {
    setFormData({
      document_type: "Well Report",
      file: "",
      remark: "",
      filename: "",
    });
    if (clearFileInput.current) {
      clearFileInput.current();
    }
    // Reset edit index
    setEditIndex(null);
  };
  const showToast = (title, description, status) => {
    toast({ title, description, status, duration: 3000, isClosable: true });
  };
  const handleEdit = (index) => {
    const selectedItem = tableData[index];
    setFormData({
      document_type: selectedItem.document_type,
      file: null, // File tidak diubah
      filename: selectedItem.filename,
      remark: selectedItem.remark,
    });
    setEditIndex(index);
  };
  const handleCancelEdit = () => {
    resetForm();
    setEditIndex(null);
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
          console.log(
            "😺 -> confirmDelete -> updatedTableData:",
            updatedTableData
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
  const docType = [
    "Well Report",
    "Drilling Log",
    "Completion Report",
    "Wellbore Diagram",
    "Well Test Report",
    "Production Log",
    "Well Workover Report",
    "Wellhead Inspection",
    "Casing Report",
    "Cementing Report",
    "Pore Pressure Prediction",
    "Fracture Gradient Report",
    "Well Trajectory",
    "Logging Report",
    "Mud Logging Report",
    "Well Site Survey",
    "Geomechanical Report",
    "Reservoir Characterization",
    "Core Analysis Report",
    "Well Completion Summary",
    "Drilling Fluid Report",
    "Well Abandonment Report",
    "HSE Report",
  ];
  return (
    <>
      <Grid templateColumns="repeat(2, 1fr)" gap={4}>
        <GridItem>
          <CardFormK3 title="Well Documents" subtitle="Log Details">
            <Flex gap={6} direction="column">
              <FormControl>
                <FormLabel>Document Type</FormLabel>
                <Select
                  value={formData.document_type}
                  onChange={handleChange("document_type")}
                >
                  {docType.map((option, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Remarks</FormLabel>
                <Input
                  type="text"
                  value={formData.remark}
                  onChange={handleChange("remark")}
                />
              </FormControl>
              <FormControl>
                <FormInputFile
                  label="Upload File"
                  onFileSelect={(file) => {
                    setFormData((prev) => ({
                      ...prev,
                      file,
                    }));
                  }}
                  onClearFile={(clearFn) => {
                    clearFileInput.current = clearFn;
                  }}
                  key={formData.file ? "with-file" : "no-file"}
                />
              </FormControl>
              {editIndex !== null && (
                <Text backgroundColor={"yellow.100"} p={2} mt={2}>
                  Current File: {formData.filename}
                </Text>
              )}
            </Flex>
            <Flex mt={4} justifyContent="flex-end" gap={2}>
              <Button
                colorScheme={editIndex !== null ? "yellow" : "blue"}
                onClick={handleAddData}
                isLoading={isLoading}
                leftIcon={
                  editIndex !== null ? (
                    <Icon as={IconEdit} />
                  ) : (
                    <Icon as={IconPlus} />
                  )
                }
                borderRadius={"full"}
              >
                {editIndex !== null ? "Update" : "Add"}
              </Button>
              {editIndex !== null && (
                <Button
                  colorScheme="gray"
                  onClick={handleCancelEdit}
                  borderRadius={"full"}
                  leftIcon={<Icon as={IconX} />}
                >
                  Cancel
                </Button>
              )}
            </Flex>
          </CardFormK3>
        </GridItem>
        <GridItem overflow="auto">
          <CardFormK3 title="Well Document Table" icon={IconTable}>
            <TableComponent
              data={tableData}
              onDelete={handleDelete}
              onDownload={handleDownload}
              onEdit={handleEdit}
            />
          </CardFormK3>
        </GridItem>
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
export default WellDocuments;
