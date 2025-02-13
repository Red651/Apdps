import React from "react";
import ModalAndContent from "../../../Forms/Components/ModalAndContent";
import { Button, Flex, Text, useDisclosure, useToast } from "@chakra-ui/react";
import { DeleteJobPlanning } from "../../../API/PostKkks";
import { FaTrash } from "react-icons/fa";

const ModalDelete = ({ isOpen, onClose, JobName, idJob }) => {
  const toast = useToast();

  const handleDeleteButton = (id) => {
    const [isLoading, setIsLoading] = React.useState(false);
    const HandleDelete = async () => {
      setIsLoading(true);
      try {
        //
        await DeleteJobPlanning(id).then((res) => {
          if (res.status === 200) {
            toast({
              title: "Success",
              description: "Data Berhasil Di Hapus",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
          }

        }).then(() => {
          window.location.reload();
          setIsLoading(false);
        });
      } catch (error) {
        console.error(error);
        if (error.response.status === 400) {
          toast({
            title: "Warning",
            description: error.response.data.detail,
            status: "info",
            duration: 3000,
            isClosable: true,
          });

          setIsLoading(false);
        }

        if (error.response.status === 404) {
          toast({
            title: "Error",
            description: "Job Not Found",
            status: "error",
            duration: 3000,
            isClosable: true,
          });

          setIsLoading(false);
        }
        if (error.response.status === 500) {
          toast({
            title: "Error",
            description: "Internal Server Error",
            status: "error",
            duration: 3000,
            isClosable: true,
          });

          setIsLoading(false);
        }
      }

      setIsLoading(false);
    };
    return (
      <Flex gap={2}>
        <Button
          colorScheme="red"
          isLoading={isLoading}
          leftIcon={<FaTrash/> }
          onClick={HandleDelete}
        >
          Hapus
        </Button>
        <Button
        
          isLoading={isLoading}
        
          onClick={onClose} 
        >
          Cancel
        </Button>
      </Flex>
    );
  };
  return (
    <ModalAndContent
      isOpen={isOpen}
      onClose={onClose}
      actionButton={handleDeleteButton(idJob)}
    >
      <Text>Apakah Ingin Menghapus {JobName}</Text>
    </ModalAndContent>
  );
};

export default ModalDelete;
