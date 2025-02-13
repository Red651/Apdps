import React, {
    useState,
    useEffect,
    useRef,
    useCallback,
    useMemo,
  } from "react";
  import {
    Button,
    Flex,
    useToast,
    Text,
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Icon,
  } from "@chakra-ui/react";
  import { IconFileUpload } from "@tabler/icons-react";
  import { useJobContext } from "../../../../Context/JobContext";
  import { ADD_WELL_MASTER } from "../../../../Reducer/reducer";
  import { pathExecute } from "../../../../Page/API/APIKKKS";
  import { PostUploadFile } from "../../../API/PostKkks";
  import CardFormK3 from "../../Components/CardFormK3";
  import FormInputFile from "../../Components/FormInputFile";
  
  const FileUploadSection = ({
    title,
    subtitle,
    variableName,
    parentPath,
    allowedFileTypes = [],
    maxFileSize = 5,
    jobType,
  }) => {
    const { state, dispatch } = useJobContext();
    const toast = useToast();
    const initialRenderRef = useRef(true);
    const cancelRef = useRef();
    const fileToUpload = useRef(null);
  
    const [formData, setFormData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [isReplaceAlertOpen, setIsReplaceAlertOpen] = useState(false);
  
    const currentData = useMemo(() => {
      return parentPath
        ? state?.wellMaster?.[parentPath]?.[variableName]
        : state?.wellMaster?.[variableName];
    }, [state?.wellMaster, parentPath, variableName]);
  
    useEffect(() => {
      if (!currentData) return;
  
      if (typeof currentData === "object" && !Array.isArray(currentData)) {
        const newFormData = {
          file_id: currentData.file_id || null,
          filename: currentData.filename || "",
          download_path: currentData.download_path || "",
          delete_path: currentData.delete_path || "",
        };
  
        if (JSON.stringify(formData) !== JSON.stringify(newFormData)) {
          setFormData(newFormData);
        }
      }
    }, [currentData]);
  
    useEffect(() => {
      if (initialRenderRef.current) {
        initialRenderRef.current = false;
        return;
      }
  
      const updateGlobalState = () => {
        if (JSON.stringify(currentData) === JSON.stringify(formData)) {
          return;
        }
  
        const newPayload = {
          ...state.wellMaster,
        };
  
        if (parentPath) {
          newPayload[parentPath] = {
            ...newPayload[parentPath],
            [variableName]: formData,
          };
        } else {
          newPayload[variableName] = formData;
        }
  
        dispatch({
          type: ADD_WELL_MASTER,
          payload: newPayload,
        });
      };
  
      const timeoutId = setTimeout(updateGlobalState, 300);
      return () => clearTimeout(timeoutId);
    }, [
      formData,
      dispatch,
      state.wellMaster,
      parentPath,
      variableName,
      currentData,
    ]);
  
    const validateFile = useCallback(
      (file) => {
        const fileSizeInMB = file.size / (1024 * 1024);
        if (fileSizeInMB > maxFileSize) {
          throw new Error(`File size must be less than ${maxFileSize}MB`);
        }
  
        const fileExtension = `.${file.name.split(".").pop().toLowerCase()}`;
        if (
          allowedFileTypes.length > 0 &&
          !allowedFileTypes.includes(fileExtension)
        ) {
          throw new Error(
            `File type not allowed. Allowed types: ${allowedFileTypes.join(", ")}`,
          );
        }
  
        return true;
      },
      [maxFileSize, allowedFileTypes],
    );
  
    const handleUpload = useCallback(
      async (selectedFile) => {
        if (!selectedFile) return;
  
        try {
          validateFile(selectedFile);
  
          if (formData?.file_id) {
            fileToUpload.current = selectedFile;
            setIsReplaceAlertOpen(true);
          } else {
            await uploadFile(selectedFile);
          }
        } catch (error) {
          toast({
            title: "Error",
            description: error.message || "Upload failed",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      },
      [formData?.file_id, validateFile, toast],
    );
  
    const uploadFile = async (file) => {
      setLoading(true);
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
  
        const uploadResponse = await PostUploadFile(formDataUpload);
        if (uploadResponse.data.success) {
          const newFileId = uploadResponse.data.data.file_info.id;
          const newFileData = {
            file_id: newFileId,
            filename: file.name,
            download_path: `/utils/download/file/${newFileId}`,
            delete_path: `/utils/delete/file/${newFileId}`,
          };
  
          setFormData(newFileData);
  
          toast({
            title: "Success",
            description: "File successfully uploaded",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
        } else {
          throw new Error(uploadResponse.data.message);
        }
      } catch (error) {
        throw error;
      } finally {
        setLoading(false);
      }
    };
  
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
      if (!formData) return;
  
      try {
        setDeleteLoading(true);
        const response = await pathExecute(formData.delete_path, "delete");
        if (response) {
          setFormData({
            file_id: null,
            filename: "",
            download_path: "",
            delete_path: "",
          });
          setIsDeleteAlertOpen(false);
  
          toast({
            title: "Success",
            description: "File successfully deleted.",
            status: "success",
            duration: 5000,
            isClosable: true,
          });
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
      if (!fileToUpload.current) return;
      await handleDelete();
      await uploadFile(fileToUpload.current);
      fileToUpload.current = null;
      setIsReplaceAlertOpen(false);
    };
  
    return (
      <>
        <CardFormK3 mt={4} title={title} subtitle={subtitle}>
          <Flex direction="column" gap={4}>
            <FormInputFile
              acceptedFormats={allowedFileTypes}
              onFileSelect={handleUpload}
              isLoading={loading}
              allowedFileTypes={allowedFileTypes}
            />
            <Flex alignItems="center" gap={2}>
              <Icon as={IconFileUpload} boxSize={6} color="blue.500" />
              <Text fontSize="sm" color="gray.600">
                Allowed types: {allowedFileTypes.join(", ")} (Max: {maxFileSize}{" "}
                MB)
              </Text>
            </Flex>
  
            {formData?.file_id && (
              <Flex alignItems="center" justifyContent="space-between">
                <Text bg="green.100" p={2} borderRadius="md" w="100%">
                  File: {formData.filename || formData.file_id}
                </Text>
                <Flex>
                  <Button colorScheme="blue" ml={2} onClick={handleDownload}>
                    Download
                  </Button>
                  <Button
                    colorScheme="red"
                    ml={2}
                    onClick={() => setIsDeleteAlertOpen(true)}
                    isLoading={deleteLoading}
                  >
                    Delete
                  </Button>
                </Flex>
              </Flex>
            )}
          </Flex>
        </CardFormK3>
  
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
                Are you sure you want to delete this file? This action cannot be
                undone.
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => setIsDeleteAlertOpen(false)}
                >
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
                A file already exists. Uploading a new file will replace the
                existing one. Do you want to continue?
              </AlertDialogBody>
              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={() => setIsReplaceAlertOpen(false)}
                >
                  Cancel
                </Button>
                <Button colorScheme="blue" onClick={handleReplace} ml={3}>
                  Replace
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    );
  };
  
  export default FileUploadSection;
  