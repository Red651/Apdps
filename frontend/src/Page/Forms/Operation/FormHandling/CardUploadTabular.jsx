import React, { useState, useEffect, useRef, useCallback } from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormInputFile from "../../Components/FormInputFile";
import { readTabularFile } from "../../Planning/Utils/ReadTabularFile";
import {
  Box,
  Button,
  SimpleGrid,
  useToast,
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
} from "@chakra-ui/react";
import TableComponent from "../../Components/TableComponent";
import { useJobContext } from "../../../../Context/JobContext";
import { UPDATE_OPERATION_DATA } from "../../../../Reducer/reducer";
import { pathExecute } from "../../../../Page/API/APIKKKS";
const CardUploadTabular = ({
  title = "Title Here",
  subtitle = "Title",
  variableName,
}) => {
  const { state, dispatch } = useJobContext();
  const toast = useToast();
  const [tableHeaders, setTableHeaders] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isReplaceAlertOpen, setIsReplaceAlertOpen] = useState(false);
  
  const cancelRef = useRef();
  const fileToUpload = useRef(null);
  // Fungsi untuk memperbarui data operasi
  const updateOperationData = useCallback((newFormData) => {
    try {
      const updatedOperationData = {
        ...state.initialOperationData,
        actual_job: {
          ...state.initialOperationData.actual_job,
          well: {
            ...state.initialOperationData.actual_job.well,
            [variableName]: newFormData,
          },
        },
      };
      dispatch({
        type: UPDATE_OPERATION_DATA,
        payload: updatedOperationData,
      });
    } catch (error) {
      console.error("Error updating operation data:", error);
      toast({
        title: "Error",
        description: "Gagal memperbarui data operasi",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [dispatch, state.initialOperationData, variableName, toast]);
  // Inisialisasi data awal
  useEffect(() => {
    const initialData = state?.initialOperationData?.actual_job?.well?.[variableName];
    
    if (initialData) {
      setFormData(initialData);
      
      if (initialData.data && initialData.data.length > 0) {
        const headers = Object.keys(initialData.data[0]).map((key) => ({
          Header: key,
          accessor: key,
        }));
        
        setTableHeaders(headers);
        setTableData(initialData.data);
      }
    }
  }, [state?.initialOperationData, variableName]);
  // Fungsi upload file
  const handleUpload = useCallback(
    async (file) => {
      if (!file) {
        toast({
          title: "Error",
          description: "No File Selected",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return null;
      }
      
      try {
        setLoading(true);
        const response = await readTabularFile(file);
        
        const newFormData = {
          file_id: response.data.file_id,
          filename: response.data.filename,
          data: response.data.item,
          download_path: response.data.download_path,
          delete_path: response.data.delete_path,
        };
        const headers = Object.keys(response.data.item[0]).map((key) => ({
          Header: key,
          accessor: key,
        }));
        setTableHeaders(headers);
        setTableData(response.data.item);
        setFormData(newFormData);
        
        // Update operation data
        updateOperationData(newFormData);
        toast({
          title: "Success",
          description: "File Berhasil di Upload",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        return newFormData;
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "File Tidak Sesuai",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        return null;
      } finally {
        setLoading(false);
      }
    },
    [toast, updateOperationData]
  );
  // Fungsi seleksi file
  const handleFileSelect = useCallback(
    (selectedFile) => {
      if (formData && formData.file_id) {
        fileToUpload.current = selectedFile;
        setIsReplaceAlertOpen(true);
      } else {
        handleUpload(selectedFile);
      }
    },
    [formData, handleUpload]
  );
  // Fungsi download file
  const handleDownload = useCallback(async () => {
    if (!formData) return;
    
    try {
      const response = await pathExecute(
        `/utils/download/file/${formData.file_id}`, 
        "get", 
        { responseType: "blob" }
      );
      
      if (response) {
        const fileBlob = new Blob([response.data]);
        const fileURL = window.URL.createObjectURL(fileBlob);
        const downloadLink = document.createElement("a");
        
        downloadLink.href = fileURL;
        downloadLink.download = formData.filename || "unduhan_file";
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        window.URL.revokeObjectURL(fileURL);
      } else {
        throw new Error("Gagal mengunduh file. Respons tidak valid.");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Error",
        description: "Gagal mengunduh file, silakan coba lagi.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [formData, toast]);
  // Fungsi hapus file
  const handleDelete = useCallback(async () => {
    try {
      setDeleteLoading(true);
      
      const response = await pathExecute(
        `/utils/delete/file/${formData.file_id}`,
        "delete"
      );
      
      if (response) {
        toast({
          title: "Success",
          description: "File successfully deleted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        
        // Reset state
        setIsDeleteAlertOpen(false);
        setFormData(null);
        setTableHeaders([]);
        setTableData([]);
        
        // Update operation data dengan null
        updateOperationData(null);
      } else {
        throw new Error("Failed to delete the file.");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setDeleteLoading(false);
    }
  }, [formData, toast, updateOperationData]);
  // Fungsi replace file
  const handleReplace = async () => {
    await handleDelete();
    await handleUpload(fileToUpload.current);
    setIsReplaceAlertOpen(false);
  };
  return (
    <CardFormK3 mt={4} title={title} subtitle={subtitle}>
      <FormInputFile
        onFileSelect={handleFileSelect}
        isLoading={loading}
        label="Upload Dokumen"
        acceptedFormats=".pdf,.docx,.xlsx,.xls,.csv"
        existingFile={formData?.filename && formData?.file_id ? {
          filename: formData.filename,
          file_id: formData.file_id,
        } : null}
        onDownload={handleDownload}
        onDelete={() => setIsDeleteAlertOpen(true)}
      />
      
      <SimpleGrid>
        <Box
          mt={4}
          overflowX={"auto"}
          width={"100%"}
          gap={4}
        >
          {tableHeaders.length > 0 && tableData.length > 0 && (
            <TableComponent
              headers={tableHeaders}
              data={tableData}
              headerKey="Header"
              minHeight="100px"
              maxHeight="400px"
            />
          )}
        </Box>
      </SimpleGrid>
      
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Delete
            </AlertDialogHeader>
            <AlertDialogBody>
              Are you sure you want to delete this file? This action cannot be undone.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteAlertOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
      
      <AlertDialog
        isOpen={isReplaceAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsReplaceAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Replace
            </AlertDialogHeader>
            <AlertDialogBody>
              A file already exists. Uploading a new file will replace the existing one. Do you want to continue?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsReplaceAlertOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleReplace} ml={3}>
                Replace
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </CardFormK3>
  );
};
export default CardUploadTabular;