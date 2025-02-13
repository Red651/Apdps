import React, { useState, useEffect, useRef, useCallback } from "react";
import CardFormK3 from "../../Components/CardFormK3";
import FormInputFile from "../../Components/FormInputFile";
import { readTabularFile } from "../../Planning/Utils/ReadTabularFile";
import { Box, Button, Flex, SimpleGrid, useToast, Text, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter } from "@chakra-ui/react";
import TableComponent from "../../Components/TableComponent";
import { FaCheck } from "react-icons/fa";
import { useJobContext } from "../../../../Context/JobContext";
import { ADD_WELL_MASTER } from "../../../../Reducer/reducer";
import { pathExecute } from "../../../../Page/API/APIKKKS";
import { useParams } from "react-router-dom";

const CardUploadTabular = ({
  title = "Title Here",
  subtitle = "Title",
  variableName,
  tabularTable = true,
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
  
  const { well_id } = useParams();  // Ambil well_id dari URL params
  
  const prevFormDataRef = useRef(formData);

  useEffect(() => {
    const initialData = state?.wellMaster?.[variableName];

    if (!well_id) {
      // Jika tidak ada well_id, set formData ke null
      setFormData(null);
    } else if (initialData) {
      // Jika ada well_id, set formData menggunakan data dari state.wellMaster
      setFormData(initialData);

      // Set table headers dan data jika tersedia
      if (initialData.data && initialData.data.length > 0) {
        const headers = Object.keys(initialData.data[0]).map(key => ({
          Header: key,
          accessor: key,
        }));
        setTableHeaders(headers);
        setTableData(initialData.data);
      }
    }
  }, [state?.wellMaster, variableName, well_id]); // Tambahkan well_id sebagai dependency

  useEffect(() => {
    if (formData && JSON.stringify(prevFormDataRef.current) !== JSON.stringify(formData)) {
      dispatch({
        type: ADD_WELL_MASTER,
        payload: {
            ...state.wellMaster,
            [variableName]: formData,
        },
      });
      prevFormDataRef.current = formData;
    }
  }, [formData, dispatch, state.wellMaster, variableName]);

  const handleUpload = useCallback(async (file) => {
    if (!file) {
      toast({
        title: "Error",
        description: "No File Selected",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    
    try {
      setLoading(true);
      const response = await readTabularFile(file);
      const headers = Object.keys(response.data.item[0]).map(key => ({
        Header: key,
        accessor: key
      }));
      setTableHeaders(headers);
      setTableData(response.data.item);
      setFormData({
        file_id: response.data.file_id,
        filename: response.data.filename,
        data: response.data.item,
        download_path: response.data.download_path,
        delete_path: response.data.delete_path,
      });
      toast({
        title: "Success",
        description: "File Berhasil di Upload",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "File Tidak Sesuai",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleFileSelect = useCallback((selectedFile) => {
    if (formData && formData.file_id) {
      fileToUpload.current = selectedFile;
      setIsReplaceAlertOpen(true);
    } else {
      handleUpload(selectedFile);
    }
  }, [formData, handleUpload]);

  const handleDownload = useCallback(async () => {
    if (!formData) return;
  
    try {
      const response = await pathExecute(formData.download_path, "get", {
        responseType: "blob", // Pastikan menerima data dalam format file
      });
  
      if (response) {
        const fileBlob = new Blob([response.data]); // Gunakan `response.data` untuk file blob
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

  const handleDelete = useCallback(async () => {
    try {
      setDeleteLoading(true);
      const response = await pathExecute(formData.delete_path, 'delete');
      if (response) {
        toast({
          title: "Success",
          description: "File successfully deleted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        });
        setIsDeleteAlertOpen(false);
        setFormData(null);
        setTableHeaders([]);
        setTableData([]);
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
  }, [formData, toast]);

  const handleReplace = async () => {
    await handleDelete();
    await handleUpload(fileToUpload.current);
    setIsReplaceAlertOpen(false);
  };

  return (
    <CardFormK3
      mt={4}
      title={title}
      subtitle={subtitle}
    >
      <FormInputFile onFileSelect={handleFileSelect} isLoading={loading} />
      {formData && formData.file_id && (
        <Flex alignItems="center" justifyContent="space-between">
          <Text bg="green.100" p={2} borderRadius="md" w="100%">
            File: {formData.filename || formData.file_id}
          </Text>
          <Flex>
            <Button
              colorScheme="blue"
              ml={2}
              onClick={handleDownload}
            >
              Download
            </Button>
            <Button
              colorScheme="red"
              ml={2}
              onClick={() => setIsDeleteAlertOpen(true)}
              isLoading={deleteLoading}
            >
              Delete </Button>
          </Flex>
        </Flex>
      )}
      {tabularTable ? (
        <SimpleGrid>
        <Box
          mt={4}
          overflowX={"auto"}
          maxHeight={"400px"}
          width={"100%"}
          gap={4}
        >
          {tableHeaders.length > 0 && tableData.length > 0 && (
            <TableComponent 
              headers={tableHeaders} 
              data={tableData} 
              headerKey="Header"
            />
          )}
        </Box>
      </SimpleGrid>
      ): null}
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
